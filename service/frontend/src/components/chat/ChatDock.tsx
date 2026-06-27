"use client";

import { useState, useEffect, useRef, FormEvent, Fragment, ReactNode } from "react";
import Link from "next/link";
import { X, ArrowUp, Phone } from "lucide-react";
import { answerQuestion, QUICK_QUESTIONS, type ChatAnswer, type ChatLink, GREETING } from "./chatLogic";
import { SsuMascot } from "./SsuMascot";

type Message =
  | { role: "bot"; text: string; suggestions?: string[]; links?: ChatLink[] }
  | { role: "user"; text: string };

/**
 * 봇 본문 안의 [1] [2] 각주를 클릭 가능한 superscript로 변환.
 * 각주 번호와 일치하는 link가 있으면 Next Link로 감싸 챗 닫고 글로 이동.
 */
function renderTextWithFootnotes(
  text: string,
  links: ChatLink[] | undefined,
  onNavigate: () => void,
): ReactNode[] {
  if (!text) return [];
  const map = new Map<number, ChatLink>();
  links?.forEach((l) => {
    if (typeof l.n === "number") map.set(l.n, l);
  });

  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (m) {
      const num = parseInt(m[1], 10);
      const link = map.get(num);
      if (link) {
        return (
          <Link
            key={i}
            href={link.href}
            onClick={onNavigate}
            title={link.label}
            className="inline-flex items-baseline align-baseline px-1 -my-0.5 text-[10px] font-bold text-herb-700 hover:text-white hover:bg-herb-700 rounded transition-colors"
          >
            <sup>[{num}]</sup>
          </Link>
        );
      }
      // 매칭 link 없으면 회색 superscript로
      return (
        <sup key={i} className="text-[10px] text-ink-400 mx-0.5">
          [{num}]
        </sup>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const STORAGE_KEY = "isuhani-ssu-open-v1";

export function ChatDock() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: GREETING,
      suggestions: QUICK_QUESTIONS.slice(0, 4),
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved === "1") setOpen(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {}
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || pending) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setPending(true);
    try {
      const a: ChatAnswer = await answerQuestion(q);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: a.text, suggestions: a.suggestions, links: a.links },
      ]);
    } finally {
      setPending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  if (!mounted) return null;

  return (
    <>
      {/* 닫힘 — 모바일: 작은 마스코트 FAB / 데스크톱: 카드 */}
      {!open && (
        <>
          {/* 모바일 FAB — 마스코트 원형 버튼 */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="쑤와 대화하기"
            className="md:hidden group fixed bottom-20 right-4 z-40 outline-none"
          >
            <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
              <div className="w-[52px] h-[52px] rounded-full bg-paper shadow-[0_10px_28px_-8px_rgba(26,20,16,0.35)] flex items-center justify-center border border-ink-100">
                <SsuMascot size={38} />
              </div>
              <span
                className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-herb-700 ring-2 ring-paper animate-pulse"
                aria-hidden
              />
            </div>
          </button>

          {/* 데스크톱 카드 — 마스코트가 카드 위로 튀어나오는 디자인 */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="쑤와 대화하기"
            className="hidden md:block group fixed bottom-6 right-6 z-40 outline-none"
          >
            <div className="relative">
              <div className="absolute -top-7 left-4 z-10 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-6deg]">
                <div className="rounded-full bg-paper p-1 shadow-[0_8px_20px_-6px_rgba(26,20,16,0.3)]">
                  <SsuMascot size={56} />
                </div>
                <span
                  className="absolute top-1 right-1 w-3 h-3 rounded-full bg-herb-700 ring-2 ring-paper animate-pulse"
                  aria-hidden
                />
              </div>
              <div className="pl-[88px] pr-6 py-4 bg-ink-900 text-white rounded-full shadow-[0_18px_40px_-12px_rgba(26,20,16,0.45)] hover:shadow-[0_24px_56px_-12px_rgba(26,20,16,0.55)] hover:bg-herb-700 transition-all duration-300">
                <div className="text-[10px] tracking-[0.3em] uppercase text-white/70 font-bold leading-none mb-1">
                  Isuhani · Ask Ssu
                </div>
                <div className="font-serif text-[15px] font-black tracking-[-0.02em] leading-none">
                  쑤에게 물어보세요 →
                </div>
              </div>
            </div>
          </button>
        </>
      )}

      {/* 열림 — 둥근 패널 + 부드러운 그림자 */}
      {open && (
        <div
          className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-50 md:w-[400px] md:h-[640px] bg-paper md:rounded-[28px] flex flex-col overflow-hidden border border-ink-200 shadow-[0_40px_100px_-24px_rgba(26,20,16,0.5)] animate-fadein-slow"
        >
          {/* 헤더 — herb 그라디언트 + 마스코트 */}
          <div className="relative px-5 py-5 text-white overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #053330 0%, #0a4a45 60%, #0f5d56 100%)",
              }}
            />
            {/* 미세 그레인 */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.06] mix-blend-screen pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
              }}
            />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-paper p-1 shadow-md">
                  <SsuMascot size={42} />
                </div>
                <div>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-herb-100 font-bold leading-none mb-1.5">
                    Isuhani · 쑤
                  </div>
                  <div className="font-serif text-[18px] font-black tracking-[-0.02em] leading-none">
                    무엇이 궁금하세요?
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-paper">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex gap-2.5 items-end"}
              >
                {m.role === "bot" && (
                  <div className="shrink-0 mb-0.5">
                    <SsuMascot size={28} />
                  </div>
                )}
                <div
                  className={[
                    "inline-block max-w-[80%] text-[14px] leading-[1.7] shadow-[0_2px_8px_-2px_rgba(26,20,16,0.06)]",
                    m.role === "user"
                      ? "bg-ink-900 text-white px-4 py-2.5 rounded-2xl rounded-br-md"
                      : "bg-white border border-ink-200 px-4 py-3 rounded-2xl rounded-bl-md",
                  ].join(" ")}
                >
                  {m.role === "bot" ? (
                    <div className="whitespace-pre-line">
                      {renderTextWithFootnotes(m.text, m.links, () => setOpen(false))}
                    </div>
                  ) : (
                    <div className="whitespace-pre-line">{m.text}</div>
                  )}
                  {m.role === "bot" && m.links && m.links.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-ink-100 flex flex-col gap-1.5">
                      <div className="text-[10px] tracking-[0.2em] uppercase text-ink-400 font-bold mb-0.5">
                        Sources
                      </div>
                      {m.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-ink-200 hover:border-herb-700 hover:bg-herb-50 text-[13px] transition-colors"
                        >
                          {typeof l.n === "number" && (
                            <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] font-bold group-hover:bg-herb-700">
                              {l.n}
                            </span>
                          )}
                          <span className="flex-1 truncate font-medium text-ink-800 group-hover:text-herb-900">
                            {l.label}
                          </span>
                          <span aria-hidden className="text-[12px] text-ink-400 group-hover:text-herb-700">→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {m.role === "bot" && m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => send(s)}
                          className="text-[12px] px-3 py-1.5 rounded-full bg-paper-100 hover:bg-herb-700 hover:text-white border border-ink-200 hover:border-herb-700 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex gap-2.5 items-end">
                <div className="shrink-0 mb-0.5">
                  <SsuMascot size={28} />
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white border border-ink-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-[0_2px_8px_-2px_rgba(26,20,16,0.06)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="px-4 pb-5 pt-3 bg-white border-t border-ink-100">
            <a
              href="tel:0285841075"
              className="flex items-center justify-center gap-1.5 mb-3 text-[11px] text-ink-400 hover:text-herb-700 font-medium transition-colors"
            >
              <Phone size={11} />
              직접 통화 02-584-1075
            </a>
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 bg-ink-50 rounded-2xl px-4"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="쑤에게 무엇이든 물어보세요"
                className="flex-1 bg-transparent outline-none border-0 py-3.5 text-[14px] text-ink-900 placeholder:text-ink-400 min-w-0"
              />
              <button
                type="submit"
                aria-label="보내기"
                disabled={!input.trim() || pending}
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-ink-900 text-white hover:bg-herb-700 transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0 my-1.5"
              >
                <ArrowUp size={15} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
