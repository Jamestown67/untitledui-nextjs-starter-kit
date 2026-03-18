"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Flag01,
  Edit01,
  Strikethrough01,
  AlignLeft01,
  Send01,
  ChevronDown,
  ChevronUp,
  X,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";

const AVATARS = {
  sarah: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMMr9Q0CHyn3nEixsnV4Gg9uPwtqi5aRvxRVinc7YjeYxvVLYtI3Ls0GDh6l5F3-eHOIU2mCI6x5u6Gi0az3-ST6TtfinAMq0TORkNm5Ff8AutYBEg2J-1T9O1ykPyMJ2eZJWRlb38gf6ydJ7kYnl93mOCSokd7PaXhDQryPCLn6CuUG-BmUJ0tuDsKTV0hfl5scb8-3LsSm6oY7U9bycaiKGjpp2GXel6urzI29YG5AiDKK5JLAaU3zKVkqi-wUlBRJAjlK3VVA",
  alex: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaDVPO_H9fb7Vi4GNkZxnb1cqxRnKnSjVOlNDMMVLvn5sXtLjh9Zqbou_xsG38pO8QDckuwkJMpS6YB3WZFpF1ISfX_Z00g--ODlj4KI13VQ3tryjZ4zf1cSRcphRQC7u54BcP1zn2N612ze6hl8XRbyqzbUn_RNXIygO91cMJBdfGCsbfjjLa_4dh71oW-_lQnYwvLfTxd8rWkYjKNH8fZc4_Dgz5wLHuWuxd195LVfpa2MnDu04OfbrBG7GKFu2u_lqzOO5t8Q",
};

const QUESTION = {
  id: 7,
  type: "Weaken",
  stimulus: [
    "Economist: In countries that adopt free-market economic systems, the standard of living initially declines before it improves. This pattern holds across all documented transitions from command to market economies over the past century.",
    "The economist concludes that any nation currently considering a transition to a free-market economy should therefore expect a period of economic hardship before experiencing long-term growth. The conclusion follows logically from the evidence provided.",
  ],
  stem: "Which one of the following, if true, most seriously weakens the argument?",
  choices: [
    {
      letter: "A",
      text: "The economist's data only includes transitions that were implemented rapidly, while gradual transitions have consistently shown immediate improvements in living standards.",
    },
    {
      letter: "B",
      text: "Citizens of countries with command economies generally prefer economic stability over rapid growth.",
    },
    {
      letter: "C",
      text: "Long-term economic growth is the most important factor that nations should consider when evaluating economic systems.",
    },
    {
      letter: "D",
      text: "Several countries that have successfully transitioned to free-market economies have subsequently reversed course.",
    },
    {
      letter: "E",
      text: "The economist's conclusion applies only to nations with populations over ten million people.",
    },
  ],
};

type FontSize = "sm" | "md" | "lg" | "xl";
type ChatMsg = { speaker: string; text: string; isMe?: boolean };

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: "text-xs leading-relaxed",
  md: "text-sm leading-relaxed",
  lg: "text-base leading-relaxed",
  xl: "text-lg leading-relaxed",
};

export default function ExamPage() {
  const TOTAL_Q = 26;
  const [currentQ, setCurrentQ] = useState(7);
  const [answered, setAnswered] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [flagged, setFlagged] = useState<number[]>([3]);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [struckChoices, setStruckChoices] = useState<string[]>([]);
  const [strikeMode, setStrikeMode] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(false);
  const [scratchText, setScratchText] = useState("");
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { speaker: "Sarah", text: "this section is brutal lol" },
    { speaker: "Alex", text: "q5 got me rethinking my life choices" },
  ]);
  const [seconds, setSeconds] = useState(35 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Simulate incoming message after 8s
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages((prev) => [...prev, { speaker: "Sarah", text: "almost done with this section 💀" }]);
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const timerWarning = seconds <= 300;

  function goToQ(n: number) {
    if (selectedAns && !answered.includes(currentQ)) {
      setAnswered((prev) => [...prev, currentQ]);
    }
    setCurrentQ(n);
    setSelectedAns(null);
    setStruckChoices([]);
  }

  function handleChoiceClick(letter: string) {
    if (strikeMode) {
      setStruckChoices((prev) =>
        prev.includes(letter) ? prev.filter((c) => c !== letter) : [...prev, letter]
      );
      return;
    }
    if (struckChoices.includes(letter)) return;
    setSelectedAns(selectedAns === letter ? null : letter);
  }

  function toggleFlag() {
    setFlagged((prev) =>
      prev.includes(currentQ) ? prev.filter((q) => q !== currentQ) : [...prev, currentQ]
    );
  }

  function sendChat() {
    const val = chatInput.trim();
    if (!val) return;
    setMessages((prev) => [...prev, { speaker: "You", text: val, isMe: true }]);
    setChatInput("");
  }

  const isFlagged = flagged.includes(currentQ);

  return (
    <div className="min-h-screen bg-primary overflow-x-hidden">

      {/* ── Top room bar ──────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-secondary bg-primary">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 h-14">

          {/* Room + section */}
          <div className="flex shrink-0 items-center gap-3">
            <span className="size-2 rounded-full bg-error-500 animate-pulse inline-block" />
            <span className="text-sm font-semibold text-primary">PT 89</span>
            <span className="text-border">·</span>
            <span className="text-xs text-tertiary">Section 2 — LR</span>
          </div>

          {/* Timer */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-secondary bg-secondary px-3 py-1.5">
            <span className="text-xs text-tertiary">⏱</span>
            <span className={`font-mono text-sm font-semibold tabular-nums ${timerWarning ? "text-error-600 animate-pulse" : "text-primary"}`}>
              {formatTime(seconds)}
            </span>
          </div>

          <div className="flex-1" />

          {/* Members + chat toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex -space-x-2">
              <Avatar src={AVATARS.sarah} size="xs" contrastBorder />
              <Avatar src={AVATARS.alex} size="xs" contrastBorder />
              <Avatar initials="Me" size="xs" contrastBorder className="bg-brand-100! text-brand-700!" />
            </div>
            <span className="text-xs text-tertiary">3 in room</span>
            {chatOpen ? <ChevronUp className="size-4 text-quaternary" /> : <ChevronDown className="size-4 text-quaternary" />}
          </button>

          {/* Q counter */}
          <div className="shrink-0 text-xs text-tertiary">
            Q <span className="font-semibold text-primary">{currentQ}</span> / {TOTAL_Q}
          </div>
        </div>

        {/* Collapsible chat panel */}
        {chatOpen && (
          <div className="border-t border-secondary bg-primary">
            <div className="mx-auto max-w-5xl flex gap-4 px-5 py-3">

              {/* Members strip */}
              <div className="w-36 shrink-0 space-y-2 border-r border-secondary pr-4">
                <p className="text-[9px] uppercase tracking-widest text-quaternary mb-2">In Room</p>
                {[
                  { src: AVATARS.sarah, name: "Sarah M.", q: 9 },
                  { src: AVATARS.alex, name: "Alex K.", q: 6 },
                ].map((m) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <Avatar src={m.src} size="xxs" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[10px] font-medium text-primary">{m.name}</p>
                      <p className="text-[9px] text-tertiary">Q {m.q}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Avatar initials="Me" size="xxs" className="bg-brand-100! text-brand-700!" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[10px] font-medium text-primary">You</p>
                    <p className="text-[9px] text-tertiary">Q {currentQ}</p>
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="flex flex-1 min-w-0 flex-col gap-2">
                <div className="scrollbar-hide max-h-24 space-y-1.5 overflow-y-auto">
                  {messages.map((msg, i) => (
                    <div key={i} className="flex items-baseline gap-1.5">
                      <span className={`shrink-0 text-[10px] font-semibold ${msg.isMe ? "text-brand-600" : "text-secondary"}`}>
                        {msg.speaker}
                      </span>
                      <p className="text-xs text-secondary">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Message the room…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChat()}
                    className="flex-1 rounded-lg border border-secondary bg-secondary px-3 py-1.5 text-xs text-primary placeholder:text-placeholder focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                  />
                  <button
                    onClick={sendChat}
                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-brand-600 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl flex gap-8 px-5 pt-20 pb-28">

        {/* Left: Question navigator (sticky) */}
        <div className="hidden lg:block w-48 shrink-0 pt-2">
          <div className="sticky top-20">
            <p className="mb-3 text-[9px] uppercase tracking-widest text-quaternary">Questions</p>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: TOTAL_Q }, (_, i) => i + 1).map((n) => {
                const isCurrent = n === currentQ;
                const isAnswered = answered.includes(n);
                const isFlaggedQ = flagged.includes(n);
                return (
                  <button
                    key={n}
                    onClick={() => goToQ(n)}
                    className={`size-7 rounded-lg text-[10px] font-semibold transition-all ${
                      isCurrent
                        ? "bg-secondary border-2 border-gray-900 text-primary"
                        : isFlaggedQ
                        ? "border-2 border-warning-400 bg-warning-50 text-warning-700"
                        : isAnswered
                        ? "bg-gray-900 text-white"
                        : "border border-secondary bg-primary text-tertiary hover:border-primary"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            {/* Legend */}
            <div className="mt-4 space-y-1.5">
              {[
                { cls: "bg-gray-900", label: "Answered" },
                { cls: "border border-secondary bg-primary", label: "Unanswered" },
                { cls: "border-2 border-warning-400 bg-warning-50", label: "Flagged" },
                { cls: "border-2 border-gray-900 bg-secondary", label: "Current" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-[10px] text-tertiary">
                  <span className={`inline-block size-3 rounded-sm ${item.cls}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Question */}
        <div className="flex-1 min-w-0">

          {/* Q header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-quaternary uppercase tracking-widest">Question</span>
              <span className="text-xl font-semibold text-primary">{currentQ}</span>
              <Badge type="pill-color" color="gray" size="sm">{QUESTION.type}</Badge>
            </div>
            <button
              onClick={toggleFlag}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isFlagged ? "text-warning-600" : "text-tertiary hover:text-warning-600"
              }`}
            >
              <Flag01 className="size-4" />
              {isFlagged ? "Flagged" : "Flag"}
            </button>
          </div>

          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-secondary pb-4">
            <button
              onClick={() => { setStrikeMode(false); }}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                !strikeMode && false ? "bg-gray-900 border-gray-900 text-white" : "border-secondary text-secondary hover:border-primary hover:text-primary"
              }`}
            >
              <Edit01 className="size-3.5" />
              Highlight
            </button>
            <button
              onClick={() => setStrikeMode(!strikeMode)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                strikeMode ? "bg-gray-900 border-gray-900 text-white" : "border-secondary text-secondary hover:border-primary hover:text-primary"
              }`}
            >
              <Strikethrough01 className="size-3.5" />
              Eliminate
            </button>
            <button
              onClick={() => setScratchOpen(!scratchOpen)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                scratchOpen ? "bg-gray-900 border-gray-900 text-white" : "border-secondary text-secondary hover:border-primary hover:text-primary"
              }`}
            >
              <AlignLeft01 className="size-3.5" />
              Scratch Pad
            </button>

            <span className="mx-1 h-5 w-px bg-border" />

            {/* Font size picker */}
            <div className="flex overflow-hidden rounded-lg border border-secondary">
              {(["sm", "md", "lg", "xl"] as FontSize[]).map((s, i) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`px-2.5 py-1.5 font-medium transition-colors ${
                    i < 3 ? "border-r border-secondary" : ""
                  } ${
                    fontSize === s
                      ? "bg-gray-900 text-white"
                      : "text-tertiary hover:bg-secondary hover:text-primary"
                  }`}
                  style={{ fontSize: s === "sm" ? 10 : s === "md" ? 12 : s === "lg" ? 14 : 16 }}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          {/* Stimulus */}
          <div className="mb-6 rounded-xl border border-secondary bg-primary p-5">
            {QUESTION.stimulus.map((para, i) => (
              <p
                key={i}
                className={`text-secondary leading-relaxed ${FONT_SIZE_CLASSES[fontSize]} ${i > 0 ? "mt-3" : ""}`}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Stem */}
          <p className={`mb-4 font-semibold text-primary ${FONT_SIZE_CLASSES[fontSize]}`}>
            {QUESTION.stem}
          </p>

          {/* Answer choices */}
          <div className="space-y-2.5 mb-8">
            {QUESTION.choices.map((c) => {
              const isStruck = struckChoices.includes(c.letter);
              const isSelected = selectedAns === c.letter;
              return (
                <button
                  key={c.letter}
                  onClick={() => handleChoiceClick(c.letter)}
                  className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-gray-900 bg-secondary"
                      : isStruck
                      ? "border-secondary opacity-40"
                      : "border-secondary hover:bg-secondary"
                  } ${strikeMode ? "cursor-crosshair" : "cursor-pointer"}`}
                >
                  <div
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? "border-gray-900 bg-gray-900" : "border-secondary"
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${isSelected ? "text-white" : "text-tertiary"}`}>
                      {c.letter}
                    </span>
                  </div>
                  <p
                    className={`${FONT_SIZE_CLASSES[fontSize]} text-secondary leading-relaxed ${
                      isStruck ? "line-through decoration-tertiary" : ""
                    }`}
                  >
                    {c.text}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Scratch pad ───────────────────────────────────────── */}
      {scratchOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-72">
          <div className="flex h-64 flex-col overflow-hidden rounded-xl border border-secondary bg-primary shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-secondary bg-secondary px-3 py-2">
              <div className="flex items-center gap-1.5">
                <AlignLeft01 className="size-3.5 text-tertiary" />
                <span className="text-xs font-medium text-secondary">Scratch Pad</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setScratchText("")}
                  className="text-[10px] text-tertiary hover:text-error-600 px-1.5 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setScratchOpen(false)}
                  className="flex size-5 items-center justify-center text-tertiary hover:text-primary transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
            <textarea
              value={scratchText}
              onChange={(e) => setScratchText(e.target.value)}
              placeholder={"Work through logic here…\n\ne.g.\nP1: All rapid transitions → initial decline\nCon: Any nation → expect hardship\nWeaken: show gradual ≠ decline (A)"}
              className="flex-1 w-full resize-none bg-primary px-3 py-2.5 font-mono text-xs text-primary placeholder:text-placeholder focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* ── Bottom nav ────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-secondary bg-primary">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <button
            onClick={() => currentQ > 1 && goToQ(currentQ - 1)}
            disabled={currentQ <= 1}
            className="flex items-center gap-1.5 rounded-lg border border-secondary px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="size-4" />
            Prev
          </button>

          {/* Progress bar */}
          <div className="hidden lg:flex flex-1 items-center gap-3">
            <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gray-900 transition-all duration-300"
                style={{ width: `${(answered.length / TOTAL_Q) * 100}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] text-tertiary">{currentQ} / {TOTAL_Q}</span>
          </div>

          {/* Mobile counter */}
          <div className="lg:hidden text-xs text-tertiary">
            Q <span className="font-semibold text-primary">{currentQ}</span> / {TOTAL_Q}
          </div>

          {currentQ < TOTAL_Q ? (
            <button
              onClick={() => goToQ(currentQ + 1)}
              className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <Link href="/the-lounge/room/1/results">
              <button className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
                Finish →
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
