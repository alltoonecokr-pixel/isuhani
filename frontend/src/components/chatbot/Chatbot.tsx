"use client";

import {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ReactNode,
  useCallback,
} from "react";
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Mic,
  MicOff,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  sendMessage,
  QUICK_QUESTIONS,
  GREETING_TEXT,
  DISCLAIMER,
  type ChatMessage,
} from "./chatApi";

const COLLAPSE_KEY = "isuhani-chat-collapsed-v1";

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Chatbot Wrapper Component
 *
 * - Desktop (lg+): 우측 고정 사이드 도크 (380px), 항상 노출, 토글로 접기 가능
 * - Mobile (<lg): 하단 큰 도크 (80px) + 탭하면 풀스크린 패널
 *
 * 자식 콘텐츠를 감싸 레이아웃 패딩을 자동 조정합니다 (CSS 변수).
 *
 * Agentic 확장 지점: messages state에 외부에서 proactive message를 push하려면
 * 이 컴포넌트에 ref 또는 context를 노출하도록 추후 확장.
 */
export function Chatbot({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      text: GREETING_TEXT,
      suggestions: QUICK_QUESTIONS,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);

  // 초기화: collapsed 상태 불러오기 + 음성지원 체크
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved === "1") setCollapsed(true);
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // collapsed 상태 → CSS 변수 + localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.style.setProperty(
      "--chat-w-lg",
      collapsed ? "0px" : "400px"
    );
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  // 자동 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  // 모바일 풀스크린 → body 스크롤 잠금
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        id: genId(),
        role: "user",
        text: trimmed,
      };
      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput("");
      setIsTyping(true);

      try {
        const { reply, suggestions, link } = await sendMessage(
          trimmed,
          nextHistory
        );
        setMessages((m) => [
          ...m,
          {
            id: genId(),
            role: "assistant",
            text: reply,
            suggestions,
            link,
          },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: genId(),
            role: "assistant",
            text: "답변을 불러오지 못했습니다. 02-584-1075 로 전화 부탁드립니다.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping]
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    handleSend(input);
  }

  // 음성 입력 (Web Speech API)
  function toggleVoice() {
    if (!voiceSupported) return;
    if (isListening) {
      recRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "ko-KR";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) {
        setInput(text);
        // 자동 전송하지 않고 사용자가 확인 후 보내도록 둠
      }
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recRef.current = rec;
    rec.start();
    setIsListening(true);
  }

  // 재사용 가능한 패널 본문 (데스크톱 사이드 + 모바일 풀스크린 공통)
  const panelBody = (
    <>
      {/* 헤더 */}
      <div className="px-5 md:px-6 py-5 bg-gradient-to-br from-herb-500 to-herb-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold">이수한의원 AI 안내</div>
            <div className="text-sm text-white/85 mt-0.5">
              무엇이든 편하게 물어보세요
            </div>
          </div>
          {/* 모바일 닫기 */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="닫기"
            className="lg:hidden w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            <X size={22} />
          </button>
          {/* 데스크톱 접기 */}
          <button
            onClick={() => setCollapsed(true)}
            aria-label="사이드 패널 접기"
            title="접기"
            className="hidden lg:flex w-10 h-10 rounded-full hover:bg-white/15 items-center justify-center transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-5 py-5 bg-herb-50/30 space-y-4"
      >
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            msg={m}
            onSuggestion={(text) => handleSend(text)}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* 디스클레이머 */}
      <div className="px-4 md:px-5 py-2.5 bg-ink-100/50 border-t border-ink-100">
        <p className="text-xs text-ink-500 leading-relaxed">{DISCLAIMER}</p>
      </div>

      {/* 입력창 */}
      <form
        onSubmit={onSubmit}
        className="px-3 py-3 border-t border-ink-100 bg-white flex items-center gap-2"
      >
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            aria-label={isListening ? "음성 입력 중지" : "음성 입력 시작"}
            title={isListening ? "음성 입력 중지" : "음성으로 말하기"}
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-herb-50 text-herb-700 hover:bg-herb-100"
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "듣고 있어요..." : "궁금한 점을 적어주세요"}
          disabled={isTyping}
          className="flex-1 px-4 py-3 rounded-full bg-ink-100/60 text-base text-ink-900 placeholder-ink-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-herb-500/40"
          aria-label="메시지 입력"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          aria-label="전송"
          className="w-12 h-12 rounded-full bg-herb-500 text-white flex items-center justify-center disabled:bg-ink-300 disabled:cursor-not-allowed hover:bg-herb-600 transition-colors shrink-0"
        >
          <Send size={18} />
        </button>
      </form>

      {/* 항상 보이는 전화 CTA */}
      <a
        href="tel:0285841075"
        className="flex items-center justify-center gap-2 py-4 bg-ink-900 text-white text-base font-bold hover:bg-ink-700 transition-colors"
      >
        <Phone size={18} />
        02-584-1075 전화 예약
      </a>
    </>
  );

  return (
    <>
      {/* 콘텐츠 영역 — 데스크톱은 우측 패딩으로 사이드바 공간 확보, 모바일은 하단 패딩 */}
      <div className="lg:transition-[padding] lg:duration-300 lg:[padding-right:var(--chat-w-lg,400px)] pb-[100px] lg:pb-0">
        {children}
      </div>

      {/* === 데스크톱: 우측 사이드 도크 (lg+) === */}
      {!collapsed && (
        <aside
          className="hidden lg:flex fixed top-0 right-0 bottom-0 w-[400px] bg-white border-l border-ink-100 shadow-2xl z-40 flex-col"
          aria-label="이수한의원 AI 안내"
        >
          {panelBody}
        </aside>
      )}

      {/* 데스크톱 접힌 상태 — 얇은 strip + 펼치기 버튼 */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="AI 안내 펼치기"
          className="hidden lg:flex fixed top-1/2 right-0 -translate-y-1/2 z-40 flex-col items-center gap-3 px-3 py-6 bg-herb-500 hover:bg-herb-600 text-white rounded-l-2xl shadow-2xl transition-colors"
        >
          <ChevronLeft size={20} />
          <Sparkles size={24} />
          <span
            className="text-sm font-bold tracking-widest"
            style={{ writingMode: "vertical-rl" }}
          >
            AI 안내
          </span>
        </button>
      )}

      {/* === 모바일: 하단 큰 도크 (lg 미만) === */}
      <div className="lg:hidden fixed left-0 right-0 bottom-0 z-40 bg-white border-t border-ink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-4"
          aria-label="AI 안내 열기"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-herb-500 to-herb-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-herb-500/30">
            <Sparkles size={22} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-base font-bold text-ink-900">
              무엇이든 물어보세요
            </div>
            <div className="text-xs text-ink-500 mt-0.5">
              진료시간 · 위치 · 예약 안내
            </div>
          </div>
          <a
            href="tel:0285841075"
            onClick={(e) => e.stopPropagation()}
            aria-label="전화걸기"
            className="w-12 h-12 rounded-full bg-ink-900 text-white flex items-center justify-center shrink-0"
          >
            <Phone size={20} />
          </a>
        </button>
      </div>

      {/* === 모바일: 풀스크린 패널 === */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col animate-[slideUp_0.25s_ease-out]"
          role="dialog"
          aria-label="이수한의원 AI 안내"
        >
          {panelBody}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

function MessageBubble({
  msg,
  onSuggestion,
}: {
  msg: ChatMessage;
  onSuggestion: (text: string) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line ${
            isUser
              ? "bg-herb-500 text-white rounded-2xl rounded-br-sm"
              : "bg-white text-ink-900 rounded-2xl rounded-bl-sm border border-ink-100 shadow-sm"
          }`}
        >
          {msg.text}
        </div>

        {msg.link && (
          <a
            href={msg.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-herb-700 bg-herb-50 border border-herb-100 rounded-full hover:bg-herb-100 transition-colors"
          >
            {msg.link.label} →
          </a>
        )}

        {msg.suggestions && msg.suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {msg.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="text-sm px-4 py-2 rounded-full bg-white border border-herb-200 text-herb-700 font-medium hover:bg-herb-50 hover:border-herb-500 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-sm border border-ink-100 shadow-sm flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-ink-300 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-ink-300 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-ink-300 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
