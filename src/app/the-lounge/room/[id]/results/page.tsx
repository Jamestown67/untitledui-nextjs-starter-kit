"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Microphone01,
  MicrophoneOff01,
  CheckCircle,
  XCircle,
  Flag01,
  BookmarkAdd,
  MessageChatCircle,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";

// ── Avatar data ─────────────────────────────────────────────────────────────
const AVATARS = {
  sarah: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMMr9Q0CHyn3nEixsnV4Gg9uPwtqi5aRvxRVinc7YjeYxvVLYtI3Ls0GDh6l5F3-eHOIU2mCI6x5u6Gi0az3-ST6TtfinAMq0TORkNm5Ff8AutYBEg2J-1T9O1ykPyMJ2eZJWRlb38gf6ydJ7kYnl93mOCSokd7PaXhDQryPCLn6CuUG-BmUJ0tuDsKTV0hfl5scb8-3LsSm6oY7U9bycaiKGjpp2GXel6urzI29YG5AiDKK5JLAaU3zKVkqi-wUlBRJAjlK3VVA",
  alex: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaDVPO_H9fb7Vi4GNkZxnb1cqxRnKnSjVOlNDMMVLvn5sXtLjh9Zqbou_xsG38pO8QDckuwkJMpS6YB3WZFpF1ISfX_Z00g--ODlj4KI13VQ3tryjZ4zf1cSRcphRQC7u54BcP1zn2N612ze6hl8XRbyqzbUn_RNXIygO91cMJBdfGCsbfjjLa_4dh71oW-_lQnYwvLfTxd8rWkYjKNH8fZc4_Dgz5wLHuWuxd195LVfpa2MnDu04OfbrBG7GKFu2u_lqzOO5t8Q",
  james: null, // "You"
};

// ── Types ────────────────────────────────────────────────────────────────────
type DotState = "correct" | "wrong" | "skipped";
type ChoiceState = "normal" | "struck" | "mine-wrong" | "mine-right" | "correct";

type MemberAnswer = {
  name: string;
  avatarSrc: string | null;
  initials: string;
  answer: string;
  correct: boolean;
};

type QuestionResult = {
  num: number;
  section: string;
  dotState: DotState;
  flagged: boolean;
  type: string;
  timeSpent: string;
  myAnswer: string;
  correctAnswer: string;
  stem: string;
  passage?: string;
  highlights?: string[]; // highlighted substrings in passage/stem
  choices: { letter: string; text: string; state: ChoiceState }[];
  memberAnswers: MemberAnswer[];
};

type Section = {
  id: string;
  label: string;
  score: number;
  total: number;
};

// ── Static data ──────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  { id: "lr1", label: "LR I", score: 22, total: 26 },
  { id: "lr2", label: "LR II", score: 19, total: 26 },
  { id: "lg", label: "LG", score: 22, total: 23 },
  { id: "rc", label: "RC", score: 20, total: 27 },
];

const LEADERBOARD = [
  { name: "You", initials: "JL", avatarSrc: null, scaled: 163, raw: 83, isMe: true },
  { name: "Sarah M.", initials: "SM", avatarSrc: AVATARS.sarah, scaled: 169, raw: 87, isMe: false },
  { name: "Alex K.", initials: "AK", avatarSrc: AVATARS.alex, scaled: 156, raw: 78, isMe: false },
];

const QUESTIONS: QuestionResult[] = [
  {
    num: 1,
    section: "lr1",
    dotState: "correct",
    flagged: false,
    type: "Necessary Assumption",
    timeSpent: "1m 12s",
    myAnswer: "B",
    correctAnswer: "B",
    stem: "Scientists have found that the bacterium Rhizobium can triple crop yields in nitrogen-poor soil. Therefore, widespread use of Rhizobium inoculant will solve the global food shortage problem.",
    highlights: ["triple crop yields"],
    passage: undefined,
    choices: [
      { letter: "A", text: "Nitrogen-poor soil is found primarily in developing nations.", state: "struck" },
      { letter: "B", text: "Adequate nutrition can be achieved without resolving every cause of food shortage.", state: "mine-right" },
      { letter: "C", text: "All current crop species can be successfully inoculated with Rhizobium.", state: "normal" },
      { letter: "D", text: "Global food shortage stems only from insufficient crop yield.", state: "normal" },
      { letter: "E", text: "Inoculant production costs are low enough for widespread adoption.", state: "normal" },
    ],
    memberAnswers: [
      { name: "Sarah M.", initials: "SM", avatarSrc: AVATARS.sarah, answer: "B", correct: true },
      { name: "Alex K.", initials: "AK", avatarSrc: AVATARS.alex, answer: "D", correct: false },
    ],
  },
  {
    num: 2,
    section: "lr1",
    dotState: "wrong",
    flagged: true,
    type: "Weaken",
    timeSpent: "2m 44s",
    myAnswer: "C",
    correctAnswer: "A",
    stem: "A city installed green roofs on 30% of its buildings and measured a 2°C drop in urban air temperature over five years. Therefore, green roof installations cause reductions in urban heat.",
    highlights: ["2°C drop"],
    passage: undefined,
    choices: [
      { letter: "A", text: "Several comparable cities without green roofs showed identical temperature reductions over the same period.", state: "correct" },
      { letter: "B", text: "The temperature measurements were conducted by an independent agency.", state: "normal" },
      { letter: "C", text: "Urban heat is measured using different methodologies across different climate zones.", state: "mine-wrong" },
      { letter: "D", text: "Some buildings in the study had green roofs installed before the program began.", state: "struck" },
      { letter: "E", text: "The study controlled for changes in industrial activity during the five-year period.", state: "normal" },
    ],
    memberAnswers: [
      { name: "Sarah M.", initials: "SM", avatarSrc: AVATARS.sarah, answer: "A", correct: true },
      { name: "Alex K.", initials: "AK", avatarSrc: AVATARS.alex, answer: "A", correct: true },
    ],
  },
  {
    num: 3,
    section: "lr1",
    dotState: "correct",
    flagged: false,
    type: "Parallel Reasoning",
    timeSpent: "1m 58s",
    myAnswer: "E",
    correctAnswer: "E",
    stem: "Every poet who has won the Meridian Prize studied under Professor Alcott. Maya has not studied under Professor Alcott. Therefore, Maya has not won the Meridian Prize.",
    highlights: [],
    passage: undefined,
    choices: [
      { letter: "A", text: "All championship swimmers trained at altitude. Lena did not train at altitude. So Lena is not a championship swimmer.", state: "mine-right" },
      { letter: "B", text: "No athlete without proper nutrition performs at peak level. So without nutrition, no peak performance.", state: "struck" },
      { letter: "C", text: "Some managers who received promotions completed the leadership seminar.", state: "normal" },
      { letter: "D", text: "All treaties ratified before 1945 were bilateral.", state: "normal" },
      { letter: "E", text: "Every film that received the Grand Jury Award premiered at Sundance. This film did not premiere at Sundance. Therefore it did not receive the Grand Jury Award.", state: "mine-right" },
    ],
    memberAnswers: [
      { name: "Sarah M.", initials: "SM", avatarSrc: AVATARS.sarah, answer: "A", correct: false },
      { name: "Alex K.", initials: "AK", avatarSrc: AVATARS.alex, answer: "E", correct: true },
    ],
  },
  {
    num: 5,
    section: "lr1",
    dotState: "skipped",
    flagged: false,
    type: "Flaw",
    timeSpent: "—",
    myAnswer: "—",
    correctAnswer: "C",
    stem: "No questions were skipped intentionally — this one was not reached before time expired.",
    highlights: [],
    choices: [
      { letter: "A", text: "It treats a necessary condition as though it were a sufficient condition.", state: "normal" },
      { letter: "B", text: "It relies on ambiguous use of a key term.", state: "normal" },
      { letter: "C", text: "It confuses correlation with causation.", state: "correct" },
      { letter: "D", text: "It attacks the source rather than the argument.", state: "normal" },
      { letter: "E", text: "It introduces an irrelevant consideration.", state: "normal" },
    ],
    memberAnswers: [
      { name: "Sarah M.", initials: "SM", avatarSrc: AVATARS.sarah, answer: "C", correct: true },
      { name: "Alex K.", initials: "AK", avatarSrc: AVATARS.alex, answer: "B", correct: false },
    ],
  },
];

const TRANSCRIPT_LINES = [
  { speaker: "Sarah M.", time: "0:02", text: "Q2 in LR I caught me — went with C but I knew it was a coin flip." },
  { speaker: "Alex K.", time: "0:15", text: "Classic Weaken. You need to sever the causal link, not just raise a measurement issue." },
  { speaker: "You", time: "0:28", text: "Yeah C felt like an alternate explanation but it doesn't actually touch the conclusion." },
  { speaker: "Sarah M.", time: "0:41", text: "Right. A shows the effect happens without the cause. That kills the argument." },
  { speaker: "Alex K.", time: "0:55", text: "I drilled 20 Weaken stems last week. Once you pattern-match 'control group,' it clicks." },
];

// ── Dot ─────────────────────────────────────────────────────────────────────
function Dot({ state, q, section }: { state: DotState; q: number; section: string }) {
  const colors: Record<DotState, string> = {
    correct: "bg-gray-900",
    wrong: "bg-error-500",
    skipped: "bg-secondary",
  };
  return (
    <div
      title={`${section.toUpperCase()} · Q${q} · ${state.charAt(0).toUpperCase() + state.slice(1)}`}
      className={`size-4 rounded-sm cursor-default transition-transform hover:scale-125 ${colors[state]}`}
    />
  );
}

// ── Choice pill (in discussion panel) ───────────────────────────────────────
function ChoicePill({ letter, text, state }: { letter: string; text: string; state: ChoiceState }) {
  const wrap: Record<ChoiceState, string> = {
    normal: "border-secondary bg-primary text-secondary",
    struck: "border-secondary bg-primary text-placeholder line-through opacity-50",
    "mine-wrong": "border-error-300 bg-error-50 text-error-700",
    "mine-right": "border-success-300 bg-success-50 text-success-700",
    correct: "border-success-300 bg-success-50 text-success-700 ring-2 ring-success-200",
  };
  const badge: Record<ChoiceState, string> = {
    normal: "bg-secondary text-secondary",
    struck: "bg-secondary text-placeholder",
    "mine-wrong": "bg-error-100 text-error-700",
    "mine-right": "bg-success-100 text-success-700",
    correct: "bg-success-100 text-success-700",
  };
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${wrap[state]}`}>
      <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badge[state]}`}>
        {letter}
      </span>
      <span className="leading-relaxed flex-1">{text}</span>
      {state === "mine-wrong" && <XCircle className="ml-auto mt-0.5 size-4 shrink-0 text-error-500" />}
      {(state === "mine-right" || state === "correct") && (
        <CheckCircle className="ml-auto mt-0.5 size-4 shrink-0 text-success-500" />
      )}
    </div>
  );
}

// Discussion status per question (mock — in prod derived from discuss page state)
const DISCUSS_STATUS: Record<number, "active" | "resolved"> = {
  2: "active",
  3: "active",
};

// ── Question row ─────────────────────────────────────────────────────────────
function QuestionRow({ q }: { q: QuestionResult }) {
  const [open, setOpen] = useState(false);
  const dotColors: Record<DotState, string> = {
    correct: "bg-gray-900",
    wrong: "bg-error-500",
    skipped: "bg-secondary",
  };
  const isWrong       = q.dotState === "wrong";
  const isSkipped     = q.dotState === "skipped";
  const discussStatus = DISCUSS_STATUS[q.num] ?? null;

  return (
    <div className={`rounded-xl border overflow-hidden ${isWrong ? "border-error-100" : "border-secondary"}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors text-left"
      >
        <div className={`size-2.5 rounded-full shrink-0 ${dotColors[q.dotState]}`} />
        <span className="text-xs font-bold text-tertiary w-6 shrink-0">Q{q.num}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-primary">{q.type}</span>
          {q.flagged && <Flag01 className="inline ml-1.5 size-3 text-warning-500" />}
        </div>

        {/* Discussion status inline */}
        {discussStatus === "active" && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-warning-200 bg-warning-50 text-warning-700 shrink-0">
            Active
          </span>
        )}
        {discussStatus === "resolved" && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-success-200 bg-success-50 text-success-700 shrink-0">
            Resolved
          </span>
        )}

        <span className="text-xs text-quaternary shrink-0">{q.timeSpent}</span>
        <span className={`text-xs font-semibold shrink-0 ${
          isWrong ? "text-error-600" : isSkipped ? "text-quaternary" : "text-success-600"
        }`}>
          {isSkipped ? "—" : q.myAnswer}
          {isWrong && <span className="text-quaternary font-normal ml-1">→ {q.correctAnswer}</span>}
        </span>
        {open ? <ChevronUp className="size-3.5 text-quaternary shrink-0" /> : <ChevronDown className="size-3.5 text-quaternary shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-secondary px-4 py-4 space-y-4 bg-secondary/20">
          <p className="text-sm text-secondary leading-relaxed italic">"{q.stem}"</p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-quaternary font-medium">Room answers:</span>
            {q.memberAnswers.map((m) => (
              <div key={m.name} className="flex items-center gap-1.5">
                <Avatar src={m.avatarSrc ?? undefined} initials={m.initials} size="xxs" />
                <span className={`text-xs font-semibold ${m.correct ? "text-success-600" : "text-error-600"}`}>
                  {m.answer}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/the-lounge/room/1/discuss"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              isWrong
                ? "bg-gray-900 text-white hover:bg-brand-600"
                : "border border-secondary bg-primary text-secondary hover:bg-secondary"
            }`}
          >
            <MessageChatCircle className="size-4" />
            {discussStatus === "active" ? "Join discussion →" : "Open in Discussion →"}
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const [sectionFilter, setSectionFilter] = useState("all");
  const [micOn, setMicOn] = useState(false);

  const rawScore = SECTIONS.reduce((a, s) => a + s.score, 0);
  const totalQs = SECTIONS.reduce((a, s) => a + s.total, 0);
  const scaledScore = 163;
  const maxScaled = LEADERBOARD.reduce((a, m) => Math.max(a, m.scaled), 0);

  const visibleQs =
    sectionFilter === "all"
      ? QUESTIONS
      : QUESTIONS.filter((q) => q.section === sectionFilter);

  return (
    <div className="min-h-screen bg-primary pb-20">

      {/* ── Voice bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-gray-950 text-white" style={{ height: 64 }}>
        <div className="mx-auto max-w-6xl h-full px-6 flex items-center gap-5">
          {/* Room name */}
          <span className="text-sm font-semibold text-white">PT 89 · Full Test</span>

          <div className="h-4 w-px bg-gray-700" />

          {/* Member voice status */}
          <div className="flex items-center gap-4">
            {[
              { name: "Sarah M.", initials: "SM", src: AVATARS.sarah, speaking: true },
              { name: "Alex K.", initials: "AK", src: AVATARS.alex, speaking: false },
              { name: "You", initials: "JL", src: null, speaking: false },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-2">
                <div className="relative">
                  <Avatar
                    src={m.src ?? undefined}
                    initials={m.initials}
                    size="xxs"
                    contrastBorder
                  />
                  {m.speaking && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success-500 border border-gray-900" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-white leading-none">{m.name}</p>
                  <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                    {m.speaking ? "Speaking" : "Listening"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setMicOn((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                micOn
                  ? "border-success-500 bg-success-900/30 text-success-300"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500"
              }`}
            >
              {micOn ? <Microphone01 className="size-3.5" /> : <MicrophoneOff01 className="size-3.5" />}
              {micOn ? "Muted" : "Unmute"}
            </button>

            <Link href="/the-lounge">
              <Button color="secondary" size="sm">
                Back to Lounge
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 pt-7 pb-4">
        <nav className="flex items-center gap-1.5 text-sm text-tertiary">
          <Link href="/the-lounge" className="hover:text-secondary transition-colors">The Lounge</Link>
          <ChevronRight className="size-3.5 text-quaternary" />
          <Link href="/the-lounge/room/1" className="hover:text-secondary transition-colors">PT 89: Full Flex</Link>
          <ChevronRight className="size-3.5 text-quaternary" />
          <span className="text-primary font-medium">Results</span>
        </nav>
      </div>

      {/* ── Discussion room callout ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 mb-6">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-6 py-4 flex items-center gap-5">
          {/* Avatar strip */}
          <div className="flex -space-x-2 shrink-0">
            <Avatar src={AVATARS.sarah} size="sm" contrastBorder />
            <Avatar src={AVATARS.alex}  size="sm" contrastBorder />
            <Avatar initials="JL" size="sm" contrastBorder className="bg-brand-100! text-brand-700!" />
          </div>

          {/* Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="size-1.5 rounded-full bg-success-400 animate-pulse" />
              <p className="text-sm font-semibold text-primary">Discussion Room is live</p>
            </div>
            <p className="text-xs text-tertiary">
              Sarah and Alex are reviewing errors — <span className="font-medium text-brand-600">4 questions active</span>
              <span className="mx-1.5 text-quaternary">·</span>
              <span className="font-medium text-success-600">1 resolved</span>
              <span className="mx-1.5 text-quaternary">·</span>
              <span className="text-tertiary">6 not started</span>
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/the-lounge/room/1/discuss"
            className="shrink-0 flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            <MessageChatCircle className="size-4" />
            Join Discussion
          </Link>
        </div>
      </div>

      {/* ── Two-column body ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 flex gap-6 items-start">

        {/* ── LEFT COLUMN — Score + Leaderboard ─────────────────────── */}
        <div className="w-72 shrink-0 space-y-5">

          {/* Your Score */}
          <div className="rounded-2xl border border-secondary bg-primary p-5">
            <p className="text-xs font-semibold text-quaternary uppercase tracking-widest mb-2">Your Score</p>
            <div className="flex items-end gap-3 mb-1">
              <span className="text-5xl font-bold text-primary tracking-tight">{scaledScore}</span>
              <span className="text-base text-tertiary mb-1.5">/180</span>
            </div>
            <p className="text-sm text-tertiary mb-4">88th percentile · {rawScore}/{totalQs} raw</p>

            {/* Section breakdown */}
            <div className="space-y-2.5">
              {SECTIONS.map((s) => {
                const pct = Math.round((s.score / s.total) * 100);
                return (
                  <div key={s.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-tertiary">{s.label}</span>
                      <span className="text-xs font-semibold text-primary">{s.score}/{s.total}</span>
                    </div>
                    <div className="relative h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gray-900"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-2xl border border-secondary bg-primary p-5">
            <p className="text-xs font-semibold text-quaternary uppercase tracking-widest mb-4">Leaderboard</p>
            <div className="space-y-4">
              {[...LEADERBOARD]
                .sort((a, b) => b.scaled - a.scaled)
                .map((m, rank) => {
                  const barPct = Math.round((m.scaled / maxScaled) * 100);
                  return (
                    <div key={m.name}>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xs font-bold text-quaternary w-4 shrink-0">{rank + 1}</span>
                        <Avatar
                          src={m.avatarSrc ?? undefined}
                          initials={m.initials}
                          size="xxs"
                        />
                        <span
                          className={`text-sm font-semibold flex-1 ${
                            m.isMe ? "text-brand-600" : "text-primary"
                          }`}
                        >
                          {m.name}
                        </span>
                        <span className="text-sm font-bold text-primary">{m.scaled}</span>
                      </div>
                      <div className="pl-6">
                        <div className="relative h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full ${
                              m.isMe ? "bg-brand-500" : "bg-gray-400"
                            }`}
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Save actions */}
          <div className="flex flex-col gap-2">
            <Button color="secondary" size="md" iconLeading={BookmarkAdd} className="w-full">
              Save to Error Log
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Question Review ────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Section filter tabs + dot grid legend */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex rounded-lg border border-secondary overflow-hidden">
              {[{ id: "all", label: "All" }, ...SECTIONS.map((s) => ({ id: s.id, label: s.label }))].map(
                (tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSectionFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors border-r border-secondary last:border-r-0 ${
                      sectionFilter === tab.id
                        ? "bg-gray-900 text-white"
                        : "bg-primary text-secondary hover:bg-secondary"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-tertiary">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-gray-900 inline-block" />Correct</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-error-500 inline-block" />Wrong</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-secondary inline-block" />Skipped</span>
            </div>
          </div>

          {/* Dot grids by section */}
          {(sectionFilter === "all" ? SECTIONS : SECTIONS.filter((s) => s.id === sectionFilter)).map(
            (sec) => {
              // Build dots from QUESTIONS data + fill remaining with "correct" placeholders
              const sectionQs = QUESTIONS.filter((q) => q.section === sec.id);
              const dotMap = new Map(sectionQs.map((q) => [q.num, q.dotState]));
              const dots: { num: number; state: DotState }[] = Array.from(
                { length: sec.total },
                (_, i) => ({
                  num: i + 1,
                  state: dotMap.get(i + 1) ?? (i + 1 <= sec.score ? ("correct" as DotState) : ("wrong" as DotState)),
                })
              );
              return (
                <div key={sec.id} className="mb-5">
                  <p className="text-xs font-semibold text-tertiary mb-2">{sec.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dots.map((d) => (
                      <Dot key={d.num} state={d.state} q={d.num} section={sec.id} />
                    ))}
                  </div>
                </div>
              );
            }
          )}

          {/* Expandable Q rows */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-primary">Question Review</h2>
              <Badge type="pill-color" color="gray" size="sm">
                {visibleQs.filter((q) => q.dotState === "correct").length} correct ·{" "}
                {visibleQs.filter((q) => q.dotState === "wrong").length} wrong ·{" "}
                {visibleQs.filter((q) => q.dotState === "skipped").length} skipped
              </Badge>
            </div>

            {visibleQs.map((q) => (
              <QuestionRow key={`${q.section}-${q.num}`} q={q} />
            ))}

            <p className="text-xs text-tertiary mt-3 text-center">
              Showing {visibleQs.length} of {sectionFilter === "all" ? totalQs : SECTIONS.find((s) => s.id === sectionFilter)?.total} questions ·{" "}
              <span className="text-brand-600 cursor-pointer hover:underline">Load all</span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
