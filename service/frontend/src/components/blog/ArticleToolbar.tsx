'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Link2, Check, Sparkles, ChevronDown, Printer } from 'lucide-react';

interface Props {
  url: string;
  title: string;
  summaryPoints: string[];
}

export function ArticleToolbar({ url, title, summaryPoints }: Props) {
  const [copied, setCopied] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [fs, setFs] = useState(1); // 0=sm 1=md 2=lg

  const hasSummary = summaryPoints.length >= 2;

  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.naver-body');
    if (el) el.style.fontSize = ['16px', '18px', '21px'][fs];
  }, [fs]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <>
      {/* ── 툴바 ── */}
      <div className="article-toolbar-row">
        {/* 왼쪽 */}
        <div className="tbar-left">
          {/* 링크 복사 — 아이콘 스왑으로 잘림 없이 피드백 */}
          <button
            onClick={handleCopy}
            className={`tbar-icon-btn${copied ? ' tbar-icon-btn--active' : ''}`}
            title="링크 복사"
            aria-label="링크 복사"
          >
            {copied ? <Check size={15} strokeWidth={2.5} /> : <Link2 size={15} />}
          </button>

          <span className="tbar-sep" />

          {/* 소셜 공유 */}
          <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="tbar-icon-btn" title="Facebook 공유">
            <Facebook size={15} />
          </a>
          <a href={twUrl} target="_blank" rel="noopener noreferrer" className="tbar-icon-btn" title="X(트위터) 공유">
            <Twitter size={15} />
          </a>
          <a href={liUrl} target="_blank" rel="noopener noreferrer" className="tbar-icon-btn" title="LinkedIn 공유">
            <Linkedin size={15} />
          </a>

          {hasSummary && (
            <>
              <span className="tbar-sep" />
              <button
                onClick={() => setSummaryOpen(v => !v)}
                className={`tbar-summary-btn${summaryOpen ? ' open' : ''}`}
                aria-expanded={summaryOpen}
                aria-label="요약 보기"
              >
                <Sparkles size={13} />
                <span>요약</span>
                <ChevronDown size={13} className="tbar-chevron" />
              </button>
            </>
          )}
        </div>

        {/* 오른쪽 */}
        <div className="tbar-right">
          <div className="tbar-fontsize">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setFs(i)}
                className={`tbar-fs-btn${fs === i ? ' active' : ''}`}
                title={['작게', '보통', '크게'][i]}
                aria-label={['Small font size', 'Medium font size', 'Large font size'][i]}
                style={{ fontSize: ['11px', '13px', '16px'][i] }}
              >A</button>
            ))}
          </div>
          <button
            onClick={() => window.print()}
            className="tbar-icon-btn"
            title="인쇄"
            aria-label="인쇄"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* ── 요약 박스 ── */}
      {hasSummary && summaryOpen && (
        <div className="article-summary" aria-label="핵심 요약">
          <div className="article-summary-label">이 글의 핵심</div>
          <ul>
            {summaryPoints.map((pt, i) => <li key={i}>{pt}</li>)}
          </ul>
        </div>
      )}
    </>
  );
}
