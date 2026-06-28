#!/usr/bin/env python3
"""네이버 블로그(isuhani) 새 글 동기화.
RSS로 새 logNo를 찾고, PostView에서 제목/날짜/본문/이미지를 추출 → 이미지를 S3로 이관 →
posts/{logNo}.json 저장 → index.json·live-index.json·DynamoDB 갱신.
재실행 안전(이미 있는 글은 건너뜀).

  python3 sync_naver_posts.py            # dry-run (가져올 글만 출력)
  python3 sync_naver_posts.py --apply    # 실제 반영
"""
import sys, re, json, hashlib, html as htmllib, urllib.request, datetime, boto3

BLOG = "isuhani"
DATA_BUCKET = "isuhani-clinic-data"
WEB_BUCKET = "isuhani-clinic-web"
TABLE = "isuhani-journal-posts"
REGION = "ap-northeast-2"
APPLY = "--apply" in sys.argv

sess = boto3.Session(profile_name="isuhani", region_name=REGION)
s3 = sess.client("s3")
ddb = sess.resource("dynamodb").Table(TABLE)

UA = {"User-Agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/120 Safari/537.36"}

CATEGORY_MAP = {
    "1": "한의원 story", "32": "건강관리", "43": "한의원 story", "42": "여가 · 여행",
    "11": "비만 · 다이어트", "38": "BLOG", "7": "체형 · 척추 · 관절통증",
    "12": "체형 · 척추 · 관절통증", "13": "체형 · 척추 · 관절통증", "14": "체형 · 척추 · 관절통증",
    "21": "체형 · 척추 · 관절통증", "8": "여성 · 산후조리", "24": "여성 · 산후조리",
    "25": "여성 · 산후조리", "9": "소아 성장", "10": "소아 성장", "15": "소아 성장", "39": "소아 성장",
}

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=30).read()

def fetch_text(url):
    return fetch(url).decode("utf-8", "ignore")

# ── 기존 logNo 집합 ──
def existing_lognos():
    idx = json.loads(s3.get_object(Bucket=DATA_BUCKET, Key="index.json")["Body"].read())
    posts = idx["posts"] if isinstance(idx, dict) and "posts" in idx else idx
    return idx, posts, {str(p.get("logNo")) for p in posts}

# 네이버 카테고리명 → 사이트 카테고리(탭) 정규화
SITE_CATS = ["한의원 story", "건강관리", "체형 · 척추 · 관절통증", "소아 성장",
             "여성 · 산후조리", "여가 · 여행", "비만 · 다이어트"]
def norm_cat(raw):
    if not raw:
        return "한의원 story"
    k = re.sub(r"[\s·.]", "", raw)
    table = {
        "건강관리": "건강관리", "한의원story": "한의원 story",
        "체형척추관절통증": "체형 · 척추 · 관절통증", "통증질환": "체형 · 척추 · 관절통증",
        "디스크": "체형 · 척추 · 관절통증", "추나": "체형 · 척추 · 관절통증",
        "여성산후조리": "여성 · 산후조리", "산후조리": "여성 · 산후조리", "여성": "여성 · 산후조리",
        "소아성장": "소아 성장", "소아": "소아 성장",
        "비만다이어트": "비만 · 다이어트", "다이어트": "비만 · 다이어트",
        "여가여행": "여가 · 여행", "여행": "여가 · 여행", "일상": "여가 · 여행",
    }
    if k in table:
        return table[k]
    for c in SITE_CATS:
        if re.sub(r"[\s·.]", "", c) == k:
            return c
    return "한의원 story"

# ── RSS에서 최근 글 (logNo, category) ──
def rss_items():
    x = fetch_text(f"https://rss.blog.naver.com/{BLOG}.xml")
    out = []
    for it in re.findall(r"<item>(.*?)</item>", x, re.S):
        link = re.search(r"<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</link>", it, re.S)
        cat = re.search(r"<category>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</category>", it, re.S)
        m = re.search(r"/(\d{10,})", link.group(1)) if link else None
        if m:
            out.append((m.group(1), htmllib.unescape(cat.group(1).strip()) if cat else ""))
    return out

def og(html, prop):
    m = re.search(rf'<meta property="og:{prop}" content="([^"]*)"', html)
    return htmllib.unescape(m.group(1)) if m else ""

def extract_body(html):
    i = html.find('<div class="se-main-container">')
    if i < 0:
        return ""
    depth, j = 0, i
    for m in re.finditer(r"<(/?)div\b[^>]*>", html[i:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            j = i + m.end()
            break
    return html[i:j]

def add_date(html):
    m = re.search(r"(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.", html)
    return f"{m.group(1)}. {int(m.group(2))}. {int(m.group(3))}." if m else ""

def iso_date(addd):
    m = re.match(r"(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})", addd)
    return f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}" if m else ""

def category_no(html):
    m = re.search(r"categoryNo=(\d+)", html)
    return m.group(1) if m else ""

# 본문 내 네이버 콘텐츠 이미지 URL (UI gif 제외)
IMG_RE = re.compile(r'(https://(?:postfiles|blogfiles|mblogthumb|blogthumb)[^\s"\'<>]+|https://[a-z0-9.\-]*pstatic\.net/[^\s"\'<>]*(?:postfiles|MjAy|/\d{8}_)[^\s"\'<>]*)')

def strip_q(u):
    return u.split("?")[0]

def key_of(stripped):
    return hashlib.sha1(stripped.encode()).hexdigest()[:16]

def migrate_images(body, og_image):
    """본문·ogImage의 네이버 이미지를 S3로 이관하고 URL 치환. (S3 URL 목록, 새 body, 새 ogImage 반환)"""
    urls = set(re.findall(IMG_RE, body))
    if og_image and "pstatic" in og_image:
        urls.add(og_image)
    s3_urls = []
    new_body = body
    new_og = og_image
    for u in sorted(urls):
        stripped = strip_q(u)
        ext = (re.search(r"\.(jpg|jpeg|png|gif)$", stripped, re.I) or [None, "jpg"])[1].lower()
        key = f"images/legacy/{key_of(stripped)}.{ext}"
        s3_url = f"https://{DATA_BUCKET}.s3.{REGION}.amazonaws.com/{key}"
        # 다운로드(최고화질 w3840 → 폴백) + 업로드
        cands = ["?type=w3840", "?type=w966", "?type=w773", ""] if "pstatic" in stripped else [""]
        data = None
        for q in cands:
            try:
                data = fetch(stripped + q); break
            except Exception:
                continue
        if data is None:
            continue
        if APPLY:
            ct = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif"}[ext]
            s3.put_object(Bucket=DATA_BUCKET, Key=key, Body=data, ContentType=ct)
        # body·ogImage 내 해당 stripped(+쿼리) 전부 치환
        pat = re.compile(re.escape(stripped) + r'(\?[^\s"\'<>]*)?')
        new_body = pat.sub(s3_url, new_body)
        if new_og:
            new_og = pat.sub(s3_url, new_og)
        s3_urls.append(s3_url)
    return s3_urls, new_body, new_og

def build_post(logno, rss_cat):
    html = fetch_text(f"https://blog.naver.com/PostView.naver?blogId={BLOG}&logNo={logno}")
    title = og(html, "title")
    body = extract_body(html)
    if not title or not body:
        return None
    addd = add_date(html)
    og_img = og(html, "image")
    desc = og(html, "description")
    s3_imgs, body2, og2 = migrate_images(body, og_img)
    return {
        "logNo": logno, "title": title, "addDate": addd,
        "categoryNo": category_no(html), "parentCategoryNo": "",
        "url": f"https://blog.naver.com/PostView.naver?blogId={BLOG}&logNo={logno}",
        "blocks": [], "body": body2, "body_kind": "html",
        "images": s3_imgs,
        "meta": {"ogTitle": title, "ogDesc": desc, "ogImage": og2 or None,
                 "category": norm_cat(rss_cat), "date": iso_date(addd)},
    }

def index_entry(post):
    return {
        "logNo": post["logNo"], "title": post["title"], "addDate": post["addDate"],
        "date": post["meta"]["date"], "category": post["meta"]["category"],
        "thumbnail": post["images"][0] if post["images"] else (post["meta"].get("ogImage")),
        "isCms": False,
    }

def main():
    idx, posts, have = existing_lognos()
    rss = rss_items()
    todo = [(ln, cat) for (ln, cat) in rss if ln not in have]
    print(f"기존 {len(have)}편 · RSS {len(rss)}편 · 새 글 {len(todo)}편")
    if not todo:
        print("새 글 없음."); return
    new_entries = []
    for ln, rss_cat in todo:
        post = build_post(ln, rss_cat)
        if not post:
            print(f"  ! {ln} 파싱 실패(스킵)"); continue
        print(f"  {'[저장]' if APPLY else '[dry]'} {post['meta']['date']} #{ln} {post['title'][:36]}  img:{len(post['images'])} cat:{post['meta']['category']}")
        if APPLY:
            s3.put_object(Bucket=DATA_BUCKET, Key=f"posts/{ln}.json",
                          Body=json.dumps(post, ensure_ascii=False, indent=2).encode(),
                          ContentType="application/json; charset=utf-8")
        new_entries.append(index_entry(post))

    if APPLY and new_entries:
        # index.json
        by = {str(p.get("logNo")): p for p in posts}
        for e in new_entries:
            by[e["logNo"]] = e
        merged = sorted(by.values(), key=lambda p: (p.get("date") or ""), reverse=True)
        idx2 = {"posts": merged} if isinstance(idx, dict) and "posts" in idx else merged
        s3.put_object(Bucket=DATA_BUCKET, Key="index.json",
                      Body=json.dumps(idx2, ensure_ascii=False).encode(),
                      ContentType="application/json; charset=utf-8")
        # live-index.json (웹 버킷)
        def web(e):
            return {"logNo": e["logNo"], "title": e["title"], "date": e["date"],
                    "dateLabel": e["addDate"], "category": e["category"],
                    "thumbnail": e.get("thumbnail"), "excerpt": "", "hasBody": False}
        s3.put_object(Bucket=WEB_BUCKET, Key="live-index.json",
                      Body=json.dumps({"updatedAt": datetime.datetime.utcnow().isoformat() + "Z",
                                       "posts": [web(p) for p in merged]}, ensure_ascii=False).encode(),
                      ContentType="application/json; charset=utf-8", CacheControl="no-store, max-age=0")
        # DynamoDB
        now = datetime.datetime.utcnow().isoformat() + "Z"
        for e in new_entries:
            ddb.put_item(Item={
                "postId": e["logNo"], "title": e["title"], "category": e["category"],
                "status": "PUBLISHED", "date": e["date"], "addDate": e["addDate"],
                "thumbnail": e.get("thumbnail"), "bodyKey": f"posts/{e['logNo']}.json",
                "bodyKind": "html", "createdAt": (e["date"] + "T00:00:00.000Z") if e["date"] else now,
                "updatedAt": now, "GSI1PK": "POST", "GSI1SK": e["date"],
                "GSI2PK": e["category"], "GSI2SK": e["date"],
            })
        print(f"\n반영 완료: {len(new_entries)}편. (정적 사이트 SEO 반영은 발행 빌드 1회 필요)")
    elif not APPLY:
        print("\nDRY-RUN. --apply 로 실제 반영.")

if __name__ == "__main__":
    main()
