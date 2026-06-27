"use client";

import { useState, useEffect, useRef, FormEvent, Fragment, ReactNode } from "react";
import Link from "next/link";
import { ArrowUp, Phone } from "lucide-react";
import { answerQuestion, QUICK_QUESTIONS, type ChatAnswer, type ChatLink, GREETING } from "./chatLogic";
import { SsuMascot } from "./SsuMascot";

type Message =
  | { role: "bot"; text: string; suggestions?: string[]; links?: ChatLink[] }
  | { role: "user"; text: string };

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
      return (
        <sup key={i} className="text-[10px] text-ink-400 mx-0.5">
          [{num}]
        </sup>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function AskChatEmbed() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: GREETING, suggestions: QUICK_QUESTIONS.slice(0, 4) },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex flex-col rounded-[24px] overflow-hidden border border-ink-200 shadow-[0_20px_60px_-20px_rgba(26,20,16,0.22)] bg-paper">

      {/* 헤더 */}
      <div className="relative px-5 py-4 text-white overflow-hidden shrink-0">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #053330 0%, #0a4a45 60%, #0f5d56 100%)" }}
        />
        <div className="relative flex items-center gap-3">
          <div className="rounded-full bg-paper p-1 shadow-md">
            <SsuMascot size={38} />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-herb-100 font-bold leading-none mb-1">
              Isuhani · 쑤
            </div>
            <div className="font-serif text-[16px] font-black tracking-[-0.02em] leading-none">
              무엇이 궁금하세요?
            </div>
          </div>
          <div className="ml-auto text-[11px] text-white/50">
            AI 길잡이 · 진단 아님
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-paper min-h-[300px] max-h-[420px] md:max-h-[480px]"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex gap-2.5 items-end"}
          >
            {m.role === "bot" && (
              <div className="shrink-0 mb-0.5">
                <SsuMascot size={26} />
              </div>
            )}
            <div
              className={[
                "inline-block max-w-[82%] text-[14px] leading-[1.7] shadow-[0_2px_8px_-2px_rgba(26,20,16,0.06)]",
                m.role === "user"
                  ? "bg-ink-900 text-white px-4 py-2.5 rounded-2xl rounded-br-md"
                  : "bg-white border border-ink-200 px-4 py-3 rounded-2xl rounded-bl-md",
              ].join(" ")}
            >
              {m.role === "bot" ? (
                <div className="whitespace-pre-line">
                  {renderTextWithFootnotes(m.text, m.links, () => {})}
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
              <SsuMascot size={26} />
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
      <div className="px-4 pb-5 pt-3 bg-white border-t border-ink-100 shrink-0">
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
  );
}
