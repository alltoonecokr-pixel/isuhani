'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Link2, Sparkles, ChevronDown, Printer } from 'lucide-react';

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
    setTimeout(() => setCopied(false), 2000);
  };

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <>
      {/* ── 툴바 행 ── */}
      <div
        className="article-toolbar-row flex items-center justify-between gap-4 py-3 border-y overflow-x-auto my-6"
        style={{ borderColor: '#e3e8e5', scrollbarWidth: 'none' }}
      >
        {/* 왼쪽: 공유 + Summary */}
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="tbar-btn" title="Facebook">
              <Facebook size={16} />
            </a>
            <a href={twUrl} target="_blank" rel="noopener noreferrer" className="tbar-btn" title="Twitter / X">
              <Twitter size={16} />
            </a>
            <a href={liUrl} target="_blank" rel="noopener noreferrer" className="tbar-btn" title="LinkedIn">
              <Linkedin size={16} />
            </a>
            <button onClick={handleCopy} className="tbar-btn relative" title={copied ? '복사됨!' : '링크 복사'}>
              <Link2 size={16} />
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[11px] bg-[#2d6e5a] text-white px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
                  복사됨!
                </span>
              )}
            </button>
          </div>

          {hasSummary && (
            <>
              <span className="text-[#ddd] select-none">|</span>
              <button
                onClick={() => setSummaryOpen(v => !v)}
                className="tbar-btn flex items-center gap-1.5"
                aria-expanded={summaryOpen}
                aria-label="AI Summary"
              >
                <Sparkles size={15} />
                <span className="text-[13px] font-medium">Summary</span>
                <ChevronDown
                  size={15}
                  style={{
                    transform: summaryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            </>
          )}
        </div>

        {/* 오른쪽: 폰트 크기 + 인쇄 */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div
            className="flex items-center border rounded overflow-hidden"
            style={{ borderColor: '#e3e8e5' }}
          >
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setFs(i)}
                className="px-2 py-1 transition-colors"
                style={{
                  fontSize: ['11px', '13px', '15px'][i],
                  color: fs === i ? '#2d6e5a' : '#bbb',
                  fontWeight: fs === i ? 700 : 400,
                }}
                title={['작게', '보통', '크게'][i]}
                aria-label={['Small font size', 'Medium font size', 'Large font size'][i]}
              >A</button>
            ))}
          </div>
          <button
            onClick={() => window.print()}
            className="tbar-btn p-1.5 border rounded"
            style={{ borderColor: '#e3e8e5' }}
            title="인쇄"
            aria-label="Print article"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* ── 핵심 요약 박스 (Summary 버튼으로 토글) ── */}
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
