"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle,
  BookmarkAdd,
  Copy01,
  Microphone01,
  X,
  Check,
  Star01,
  Plus,
} from "@untitledui/icons";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";

/* ─── Avatars ────────────────────────────────────────────────────────────── */
const AV = {
  sarah: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMMr9Q0CHyn3nEixsnV4Gg9uPwtqi5aRvxRVinc7YjeYxvVLYtI3Ls0GDh6l5F3-eHOIU2mCI6x5u6Gi0az3-ST6TtfinAMq0TORkNm5Ff8AutYBEg2J-1T9O1ykPyMJ2eZJWRlb38gf6ydJ7kYnl93mOCSokd7PaXhDQryPCLn6CuUG-BmUJ0tuDsKTV0hfl5scb8-3LsSm6oY7U9bycaiKGjpp2GXel6urzI29YG5AiDKK5JLAaU3zKVkqi-wUlBRJAjlK3VVA",
  alex:  "https://lh3.googleusercontent.com/aida-public/AB6AXuAaDVPO_H9fb7Vi4GNkZxnb1cqxRnKnSjVOlNDMMVLvn5sXtLjh9Zqbou_xsG38pO8QDckuwkJMpS6YB3WZFpF1ISfX_Z00g--ODlj4KI13VQ3tryjZ4zf1cSRcphRQC7u54BcP1zn2N612ze6hl8XRbyqzbUn_RNXIygO91cMJBdfGCsbfjjLa_4dh71oW-_lQnYwvLfTxd8rWkYjKNH8fZc4_Dgz5wLHuWuxd195LVfpa2MnDu04OfbrBG7GKFu2u_lqzOO5t8Q",
};

/* ─── Tag options ─────────────────────────────────────────────────────────── */
const TAG_OPTS = [
  { type: "@ Instinct",  accentCls: "border-l-gray-300",   labelCls: "text-tertiary",   wrapCls: "bg-primary border-secondary",    dot: "bg-gray-400",   desc: "What your gut said",       subtypes: ["Sounded right", "Process of elim.", "Too extreme", "Time pressure"] },
  { type: "@ Insight",   accentCls: "border-l-blue-200",   labelCls: "text-blue-600",   wrapCls: "bg-blue-50 border-blue-100",     dot: "bg-blue-400",   desc: "Something you learned",    subtypes: ["Causal link", "Scope / degree", "Conditional logic", "Argument structure"] },
  { type: "@ Principle", accentCls: "border-l-violet-200", labelCls: "text-violet-600", wrapCls: "bg-violet-50 border-violet-100", dot: "bg-violet-400", desc: "A rule to remember",       subtypes: ["Sufficient vs. necessary", "Most seriously weakens", "Contrapositive", "Scope shift"] },
  { type: "@ Attack Me", accentCls: "border-l-brand-200",  labelCls: "text-brand-600",  wrapCls: "bg-brand-50 border-brand-200",   dot: "bg-brand-400",  desc: "Open question to address", subtypes: [] },
] as const;

type TagType = typeof TAG_OPTS[number]["type"];

type Tag = {
  id: string;
  type: TagType;
  choice: string | null;
  ref: string | null;
  accentCls: string;
  labelCls: string;
  wrapCls: string;
  dot: string;
  body: string;
  savedFrom?: { speaker: string; time: string };
};

/* ─── Data ───────────────────────────────────────────────────────────────── */
type QStatus = "discussing" | "resolved" | "open" | "quiet";

const QUESTIONS: {
  id: string; section: string; num: number; type: string;
  correct: string; groupPicks: { you: string; sarah: string; alex: string };
  status: QStatus; flag?: boolean;
}[] = [
  { id: "s1q3",  section: "S1", num: 3,  type: "LR · NA",        correct: "D", groupPicks: { you: "B", sarah: "D", alex: "D" }, status: "resolved" },
  { id: "s1q7",  section: "S1", num: 7,  type: "LR · Flaw",      correct: "A", groupPicks: { you: "A", sarah: "A", alex: "A" }, status: "quiet" },
  { id: "s1q11", section: "S1", num: 11, type: "LR · Weaken",    correct: "E", groupPicks: { you: "C", sarah: "C", alex: "B" }, status: "discussing", flag: true },
  { id: "s1q14", section: "S1", num: 14, type: "LR · Weaken",    correct: "E", groupPicks: { you: "A", sarah: "C", alex: "E" }, status: "discussing", flag: true },
  { id: "s1q19", section: "S1", num: 19, type: "LR · PSA",       correct: "B", groupPicks: { you: "D", sarah: "B", alex: "D" }, status: "open" },
  { id: "s2q4",  section: "S2", num: 4,  type: "LG · Hybrid",    correct: "E", groupPicks: { you: "E", sarah: "E", alex: "E" }, status: "quiet" },
  { id: "s2q8",  section: "S2", num: 8,  type: "LG · Sequence",  correct: "A", groupPicks: { you: "C", sarah: "A", alex: "C" }, status: "open", flag: true },
  { id: "s2q12", section: "S2", num: 12, type: "LG · Grouping",  correct: "B", groupPicks: { you: "B", sarah: "C", alex: "B" }, status: "quiet" },
  { id: "s2q17", section: "S2", num: 17, type: "LG · In/Out",    correct: "C", groupPicks: { you: "A", sarah: "A", alex: "C" }, status: "discussing", flag: true },
  { id: "s3q5",  section: "S3", num: 5,  type: "RC · Science",   correct: "C", groupPicks: { you: "C", sarah: "C", alex: "C" }, status: "quiet" },
  { id: "s3q9",  section: "S3", num: 9,  type: "RC · Law",       correct: "B", groupPicks: { you: "D", sarah: "B", alex: "D" }, status: "open" },
  { id: "s3q15", section: "S3", num: 15, type: "RC · Author",    correct: "E", groupPicks: { you: "A", sarah: "A", alex: "E" }, status: "discussing", flag: true },
  { id: "s3q21", section: "S3", num: 21, type: "RC · Inference", correct: "B", groupPicks: { you: "B", sarah: "D", alex: "B" }, status: "quiet" },
];

function wrongOf(q: typeof QUESTIONS[number]) {
  const w: string[] = [];
  if (q.groupPicks.you   !== q.correct) w.push("You");
  if (q.groupPicks.sarah !== q.correct) w.push("Sarah");
  if (q.groupPicks.alex  !== q.correct) w.push("Alex");
  return w;
}

const QUESTION = {
  ref: "PT 89 · S1 · Q14", type: "LR · Weaken",
  stimulusPre: "A new environmental regulation will reduce industrial emissions in the region by 40% over the next decade.",
  stimulusHL: "Since industrial emissions are the primary contributor to poor air quality in urban areas, this regulation will significantly improve air quality in those areas.",
  stem: "Which one of the following, if true, most seriously weakens the argument?",
  choices: [
    { letter: "A", text: "Industrial emissions are not the only source of air pollution in urban areas." },
    { letter: "B", text: "The regulation was supported by a broad coalition of environmental groups." },
    { letter: "C", text: "Some industrial facilities have already voluntarily reduced their emissions." },
    { letter: "D", text: "The cost of implementing the regulation will be distributed unevenly across industries." },
    { letter: "E", text: "The concentration of other urban air pollutants has increased significantly in recent years." },
  ],
  picks: { "You": "A", "Sarah M.": "C", "Alex K.": "E" },
  correct: "E",
};

const INIT_TAGS: Tag[] = [
  { id: "t0", ...TAG_OPTS[0], choice: "A",                 ref: null,        body: "Felt like it directly broke the link between cutting emissions and air quality. Moved fast, didn't stress-test." },
  { id: "t1", ...TAG_OPTS[1], choice: "Didn't stress-test", ref: null,       body: "A does weaken, but only partially. 'Significantly' is the key word — reducing one dominant source can still produce a significant improvement." },
  { id: "t2", ...TAG_OPTS[2], choice: "Degree matters",     ref: null,       body: "Keep treating 'weakens' and 'most seriously weakens' as the same. Check: does this break the core assumption, or just introduce mild doubt?" },
  { id: "t3", ...TAG_OPTS[3], choice: null,                 ref: "@ Insight", body: "Why is (A) not the answer? I thought it directly attacks the assumption that industrial emissions are the primary cause." },
];

const SAVED_TAG: Tag = {
  id: "saved0", ...TAG_OPTS[1], choice: null, ref: null,
  body: "You're on the right track — (A) does weaken it. The key is degree. Reducing 40% of the dominant source can still produce a significant improvement.",
  savedFrom: { speaker: "Alex K.", time: "8m ago" },
};

const TRANSCRIPT = [
  { speaker: "Sarah M.", isMe: false, time: "0:04", text: "Q14 tripped me up — I went with C but I knew it was a coin flip between C and A." },
  { speaker: "Alex K.",  isMe: false, time: "0:15", text: "Classic Weaken trap. You need to sever the causal link, not just raise a measurement issue." },
  { speaker: "You",      isMe: true,  time: "0:28", text: "Yeah, C felt like an alternate explanation but it doesn't actually touch the conclusion." },
  { speaker: "Sarah M.", isMe: false, time: "0:41", text: "Right. E shows the effect happens without the cause — that kills the argument entirely." },
  { speaker: "Alex K.",  isMe: false, time: "0:55", text: "I drilled 20 Weaken stems last week. Once you pattern-match it clicks immediately." },
  { speaker: "You",      isMe: true,  time: "1:08", text: "Does the answer make the conclusion impossible, or just less certain? If impossible — best weakener." },
  { speaker: "Sarah M.", isMe: false, time: "1:22", text: "'Most seriously' means cut the core assumption at the root, not just poke a hole." },
  { speaker: "Alex K.",  isMe: false, time: "1:35", text: "The 'significantly improve' in the conclusion is doing a lot of work." },
  { speaker: "You",      isMe: true,  time: "1:48", text: "So A is a partial weakener. E introduces a countervailing factor that makes the conclusion false." },
  { speaker: "Sarah M.", isMe: false, time: "2:01", text: "Flagging this for my RMU — degree of weakening is something I keep missing." },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function accentBar(wrong: string[]) {
  if (wrong.length === 0)                         return "bg-success-400";
  if (wrong.includes("You") && wrong.length >= 2) return "bg-error-500";
  if (wrong.includes("You"))                      return "bg-error-400";
  return "bg-warning-400";
}

const STATUS_CFG = {
  discussing: { label: "Active",   cls: "text-warning-700 bg-warning-50 border-warning-200" },
  resolved:   { label: "Resolved", cls: "text-success-700 bg-success-50 border-success-200" },
  open:       { label: "Open",     cls: "text-brand-600 bg-brand-50 border-brand-200" },
  quiet:      null,
} as const;

function speakerDot(s: string, me: boolean) {
  if (me)                    return "bg-brand-500";
  if (s.startsWith("Sarah")) return "bg-purple-400";
  return "bg-teal-400";
}
function speakerColor(s: string, me: boolean) {
  if (me)                    return "text-brand-600";
  if (s.startsWith("Sarah")) return "text-purple-600";
  return "text-teal-700";
}

const MEMBERS = [
  { key: "you"   as const, init: "Y" },
  { key: "sarah" as const, init: "S" },
  { key: "alex"  as const, init: "A" },
];

type FilterKey = "all" | "my-errors" | "active" | "resolved";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "my-errors", label: "My errors" },
  { key: "active",    label: "Active" },
  { key: "resolved",  label: "Resolved" },
];

const SEC_LABELS: Record<string, string> = { S1: "Section 1", S2: "Section 2", S3: "Section 3" };

let _nextId = 10;
function newId() { return `t${_nextId++}`; }

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function RoomDiscussPage() {
  const [selectedQ, setSelectedQ]   = useState("s1q14");
  const [filter, setFilter]         = useState<FilterKey>("all");
  const [isResolved, setIsResolved] = useState(false);
  const [uploaded, setUploaded]     = useState(false);

  // Unified tag state
  const [tags, setTags]             = useState<Tag[]>(INIT_TAGS);
  const [savedTag, setSavedTag]     = useState<Tag | null>(SAVED_TAG);

  // Note composer
  const [composerOpen,    setComposerOpen]    = useState(false);
  const [composerType,    setComposerType]    = useState<typeof TAG_OPTS[number] | null>(null);
  const [composerSubtype, setComposerSubtype] = useState<string | null>(null);
  const [composerBody,    setComposerBody]    = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Transcript tag picker
  const [pickerLine, setPickerLine] = useState<number | null>(null);

  // Filter logic
  const filteredQs = QUESTIONS.filter(q => {
    const wrong = wrongOf(q);
    if (filter === "all")       return true;
    if (filter === "my-errors") return wrong.includes("You");
    if (filter === "active")    return q.status === "discussing";
    if (filter === "resolved")  return q.status === "resolved";
    return true;
  });
  const sections = Array.from(new Set(filteredQs.map(q => q.section)));

  const counts: Record<FilterKey, number> = {
    all:         QUESTIONS.length,
    "my-errors": QUESTIONS.filter(q => wrongOf(q).includes("You")).length,
    active:      QUESTIONS.filter(q => q.status === "discussing").length,
    resolved:    QUESTIONS.filter(q => q.status === "resolved").length,
  };

  // Tag helpers
  function updateTag(id: string, body: string) {
    setTags(prev => prev.map(t => t.id === id ? { ...t, body } : t));
    setUploaded(false);
  }
  function deleteTag(id: string) {
    setTags(prev => prev.filter(t => t.id !== id));
  }
  function appendToTag(id: string, line: typeof TRANSCRIPT[number]) {
    const text = `${line.speaker}: ${line.text}`;
    setTags(prev => prev.map(t =>
      t.id === id ? { ...t, body: t.body + (t.body ? "\n" : "") + text } : t
    ));
    setPickerLine(null);
  }

  // Note composer helpers
  function openComposer() {
    setComposerOpen(true);
    setComposerType(null);
    setComposerSubtype(null);
    setComposerBody("");
    setTimeout(() => composerRef.current?.focus(), 60);
  }
  function cancelComposer() {
    setComposerOpen(false);
    setComposerType(null);
    setComposerSubtype(null);
    setComposerBody("");
  }
  function submitComposer() {
    if (!composerType) return;
    const newTag: Tag = { id: newId(), ...composerType, choice: composerSubtype, ref: null, body: composerBody };
    setTags(prev => [...prev, newTag]);
    cancelComposer();
  }

  const allTags = [...tags, ...(savedTag ? [savedTag] : [])];

  return (
    <div className="h-screen bg-primary flex flex-col overflow-hidden">

      {/* ── Top nav ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-secondary h-12 flex items-center justify-between px-6">
        <nav className="flex items-center gap-1.5 text-sm text-tertiary">
          <Link href="/the-lounge" className="hover:text-primary transition-colors">The Lounge</Link>
          <ChevronRight className="size-3.5 text-quaternary" />
          <Link href="/the-lounge/room/1" className="hover:text-primary transition-colors">PT 89: Full Flex</Link>
          <ChevronRight className="size-3.5 text-quaternary" />
          <span className="text-primary font-semibold">Discussion</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-success-600">
            <span className="size-1.5 rounded-full bg-success-400 animate-pulse" />Live
          </span>
          <div className="flex -space-x-2">
            <Avatar src={AV.sarah} size="xxs" contrastBorder />
            <Avatar src={AV.alex}  size="xxs" contrastBorder />
            <Avatar initials="Me"  size="xxs" contrastBorder className="bg-brand-100! text-brand-700!" />
          </div>
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden justify-center">
        <div className="flex flex-1 overflow-hidden max-w-6xl w-full">

        {/* ══ LEFT: Question + Notes (main) ══════════════════════════════ */}
        <main className="flex-1 min-w-0 overflow-y-auto scrollbar-hide">

          {/* Sticky question header */}
          <div className="sticky top-0 z-10 bg-primary/95 backdrop-blur-sm border-b border-secondary px-7 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                  <span className="text-sm font-semibold text-primary">{QUESTION.ref}</span>
                  <span className="text-xs text-tertiary">{QUESTION.type}</span>
                  {isResolved
                    ? <Badge type="pill-color" color="success" size="sm">Resolved</Badge>
                    : <BadgeWithDot type="pill-color" color="warning" size="sm">Discussing</BadgeWithDot>
                  }
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(QUESTION.picks).map(([name, pick]) => {
                    const wrong = pick !== QUESTION.correct;
                    return (
                      <span key={name} className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 border ${
                        wrong ? "border-error-200 bg-error-50 text-error-700"
                               : "border-success-200 bg-success-50 text-success-700"
                      }`}>
                        {name === "You" ? "You" : name.split(" ")[0]}
                        <span className="font-bold">→ {pick}</span>
                        {wrong ? "✗" : "✓"}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => setIsResolved(r => !r)}
                className={`shrink-0 flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isResolved ? "text-success-600" : "text-tertiary hover:text-primary"
                }`}
              >
                <CheckCircle className="size-4" />
                {isResolved ? "Resolved" : "Mark resolved"}
              </button>
            </div>
          </div>

          {/* ── Question display ─────────────────────────────────────── */}
          <div className="px-7 pt-6 pb-2">
            <div className="max-w-2xl ml-auto mr-4">
            <div className="rounded-2xl border border-secondary overflow-hidden">

              {/* Stimulus */}
              <div className="px-6 py-5 bg-secondary border-b border-secondary">
                <p className="text-[11px] font-bold uppercase tracking-widest text-quaternary mb-3">Stimulus</p>
                <p className="text-sm text-secondary leading-[1.85]">
                  {QUESTION.stimulusPre}{" "}
                  <mark style={{ background: "#fef9c3", borderRadius: "3px", padding: "2px 5px" }}>
                    {QUESTION.stimulusHL}
                  </mark>
                </p>
              </div>

              {/* Stem */}
              <div className="px-6 py-4 bg-brand-50/40 border-b border-secondary">
                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-2">Question</p>
                <p className="text-sm font-semibold text-primary leading-relaxed">{QUESTION.stem}</p>
              </div>

              {/* Choices */}
              <div className="px-6 py-5 space-y-2 bg-primary">
                {QUESTION.choices.map(c => {
                  const myPick    = c.letter === QUESTION.picks["You"];
                  const isCorrect = c.letter === QUESTION.correct;
                  const others    = Object.entries(QUESTION.picks)
                    .filter(([n, p]) => n !== "You" && p === c.letter)
                    .map(([n]) => n.split(" ")[0]);
                  return (
                    <div key={c.letter} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                      isCorrect ? "border-success-200 bg-success-50"
                      : myPick  ? "border-error-200 bg-error-50"
                      : "border-secondary"
                    }`}>
                      <span className={`mt-px shrink-0 flex size-6 items-center justify-center rounded-full text-xs font-bold border ${
                        isCorrect ? "border-success-400 bg-success-100 text-success-700"
                        : myPick  ? "border-error-300 bg-error-100 text-error-700"
                        : "border-secondary text-tertiary bg-primary"
                      }`}>{c.letter}</span>
                      <p className={`flex-1 text-sm leading-relaxed ${
                        isCorrect ? "font-medium text-success-900"
                        : myPick  ? "text-error-800"
                        : "text-secondary"
                      }`}>
                        {c.text}
                        {myPick   && <span className="ml-2 text-xs font-semibold text-error-400">← you</span>}
                        {isCorrect && <span className="ml-2 text-xs font-semibold text-success-600">✓ correct</span>}
                      </p>
                      {others.length > 0 && (
                        <span className="shrink-0 text-xs text-tertiary font-medium mt-0.5">{others.join(", ")}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            </div>{/* /max-w-2xl */}
          </div>

          {/* ── Notes section separator ──────────────────────────────── */}
          <div className="px-7">
            <div className="max-w-2xl ml-auto mr-4">
              <div className="flex items-center gap-4 pt-8 pb-5">
                <div className="flex-1 h-px bg-secondary" />
                <span className="text-xs font-bold uppercase tracking-widest text-quaternary">My Notes</span>
                <div className="flex-1 h-px bg-secondary" />
              </div>
            </div>
          </div>

          {/* ── RMU tags ─────────────────────────────────────────────── */}
          <div className="px-7">
          <div className="max-w-2xl ml-auto mr-4 space-y-3">

            {tags.map(t => (
              <div key={t.id} className={`rounded-2xl border border-l-4 ${t.accentCls} ${t.wrapCls} px-5 py-4`}>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={`text-xs font-bold uppercase tracking-widest ${t.labelCls}`}>{t.type}</span>
                  {t.choice && (
                    <span className="text-xs font-medium text-tertiary bg-white/60 rounded-full px-2.5 py-0.5 border border-secondary">
                      {t.choice}
                    </span>
                  )}
                  {t.ref && (
                    <span className="text-xs font-medium text-brand-600 bg-brand-100 border border-brand-200 rounded-full px-2.5 py-0.5">
                      re: {t.ref}
                    </span>
                  )}
                  <button
                    onClick={() => deleteTag(t.id)}
                    className="ml-auto text-quaternary hover:text-error-500 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <textarea
                  rows={Math.max(2, t.body.split("\n").length + 1)}
                  value={t.body}
                  onChange={e => updateTag(t.id, e.target.value)}
                  className="w-full resize-none bg-transparent text-sm text-secondary leading-relaxed focus:outline-none"
                />
              </div>
            ))}

            {/* Saved from discussion */}
            {savedTag && (
              <div className="rounded-2xl border border-l-4 border-l-gray-300 border-gray-200 bg-gray-50 px-5 py-4">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-widest text-quaternary">Saved from Discussion</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-gray-800 text-white px-2.5 py-0.5">
                    <BookmarkAdd className="size-3" />{savedTag.savedFrom?.speaker}
                  </span>
                  <span className="text-xs text-quaternary ml-auto">{savedTag.savedFrom?.time}</span>
                  <button onClick={() => setSavedTag(null)} className="text-quaternary hover:text-error-500 transition-colors">
                    <X className="size-3.5" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={savedTag.body}
                  onChange={e => setSavedTag(s => s ? { ...s, body: e.target.value } : null)}
                  className="w-full resize-none bg-transparent text-sm text-secondary leading-relaxed focus:outline-none"
                />
                <div className="flex items-center gap-2 pt-3 mt-1 border-t border-gray-200">
                  <span className="text-xs text-quaternary">Tagged as</span>
                  <span className="text-xs font-semibold rounded-full border border-blue-100 bg-blue-50 text-blue-600 px-2.5 py-0.5">
                    @ Insight · Degree of weakening
                  </span>
                </div>
              </div>
            )}

            {/* ── Note composer ────────────────────────────────────── */}
            {!composerOpen ? (
              <button
                onClick={openComposer}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-secondary bg-primary px-5 py-3 text-sm text-quaternary hover:text-tertiary hover:border-tertiary transition-colors"
              >
                <Plus className="size-4" />
                New note
              </button>
            ) : (
              <div className="rounded-2xl border border-secondary bg-primary overflow-hidden">

                {/* Type selector */}
                <div className="flex items-center gap-1.5 px-4 pt-3.5 pb-3 border-b border-secondary flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-quaternary mr-1">Type</span>
                  {TAG_OPTS.map(opt => {
                    const active = composerType?.type === opt.type;
                    return (
                      <button
                        key={opt.type}
                        onClick={() => { setComposerType(active ? null : opt); setComposerSubtype(null); }}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                          active
                            ? `${opt.wrapCls} ${opt.labelCls}`
                            : "border-secondary text-tertiary hover:border-tertiary hover:text-primary bg-primary"
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${active ? opt.dot : "bg-gray-300"}`} />
                        {opt.type.replace("@ ", "")}
                      </button>
                    );
                  })}
                </div>

                {/* Subtype row — only shown when type has subtypes */}
                {composerType && composerType.subtypes.length > 0 && (
                  <div className="flex items-center gap-1.5 px-4 pt-2.5 pb-3 border-b border-secondary flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-quaternary mr-1">Subtype</span>
                    {composerType.subtypes.map(sub => {
                      const active = composerSubtype === sub;
                      return (
                        <button
                          key={sub}
                          onClick={() => setComposerSubtype(active ? null : sub)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all ${
                            active
                              ? `${composerType.wrapCls} ${composerType.labelCls}`
                              : "border-secondary text-tertiary hover:border-tertiary hover:text-primary bg-primary"
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Body textarea */}
                <textarea
                  ref={composerRef}
                  rows={3}
                  value={composerBody}
                  onChange={e => setComposerBody(e.target.value)}
                  placeholder={composerType ? `${composerType.desc}…` : "Select a type above, then write your note…"}
                  className="w-full resize-none bg-transparent px-4 py-3 text-sm text-secondary placeholder:text-quaternary focus:outline-none leading-relaxed"
                />

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 px-4 pb-3.5 pt-1 border-t border-secondary">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelComposer}
                      className="text-xs font-semibold text-tertiary hover:text-primary transition-colors px-2 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitComposer}
                      disabled={!composerType}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        composerType
                          ? "bg-gray-900 text-white hover:bg-brand-600 cursor-pointer"
                          : "bg-secondary text-quaternary cursor-not-allowed"
                      }`}
                    >
                      <Plus className="size-3.5" />
                      Add note
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
          </div>{/* /px-7 */}

          {/* Upload row */}
          <div className="px-7 py-6 mt-2">
          <div className="flex items-center justify-between gap-3 max-w-2xl ml-auto mr-4">
            <Link href="/rmu" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              Open in RMU <ChevronRight className="size-4" />
            </Link>
            <div className="flex items-center gap-3">
              {uploaded && (
                <span className="flex items-center gap-1.5 text-sm text-success-600 font-medium">
                  <Check className="size-4" />Uploaded
                </span>
              )}
              <button
                onClick={() => setUploaded(true)}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                <Copy01 className="size-4" />Save to RMU
              </button>
            </div>
          </div>
          </div>{/* /px-7 */}
        </main>

        {/* ══ RIGHT: Question list (top) + Transcript (bottom) ═══════════ */}
        <aside className="w-[300px] shrink-0 border-l border-secondary flex flex-col overflow-hidden bg-primary">

          {/* ── Question list ─────────────────────────────────────────── */}
          <div className="flex flex-col overflow-hidden flex-1">

            {/* List header */}
            <div className="px-4 pt-4 pb-3 shrink-0">
              <p className="text-sm font-semibold text-primary mb-0.5">PT 89 Questions</p>
              <p className="text-xs text-tertiary">
                <span className="font-semibold text-error-500">{QUESTIONS.filter(q => wrongOf(q).includes("You")).length} your errors</span>
                <span className="mx-1.5 text-quaternary">·</span>
                <span className="font-semibold text-success-600">{QUESTIONS.filter(q => q.status === "resolved").length} resolved</span>
              </p>
            </div>

            {/* Filter chips */}
            <div className="px-4 pb-3 shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border transition-all ${
                      filter === f.key
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-secondary text-secondary hover:border-tertiary hover:text-primary bg-primary"
                    }`}
                  >
                    {f.label}
                    <span className={`text-[10px] font-bold ${filter === f.key ? "text-white/60" : "text-quaternary"}`}>
                      {counts[f.key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question list scroll */}
            <div className="flex-1 overflow-y-auto scrollbar-hide border-t border-secondary">
              {sections.map(sec => {
                const qs = filteredQs.filter(q => q.section === sec);
                if (!qs.length) return null;
                return (
                  <div key={sec}>
                    <div className="flex items-center gap-2 px-4 pt-3.5 pb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-quaternary">{SEC_LABELS[sec]}</span>
                      <div className="flex-1 h-px bg-secondary" />
                    </div>
                    {qs.map(q => {
                      const isSelected = selectedQ === q.id;
                      const wrong      = wrongOf(q);
                      const allCorrect = wrong.length === 0;
                      const cfg        = STATUS_CFG[q.status];
                      return (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQ(q.id)}
                          className={`w-full text-left flex items-stretch transition-colors ${
                            isSelected ? "bg-brand-50" : "hover:bg-secondary"
                          }`}
                        >
                          <div className={`w-[3px] shrink-0 ${accentBar(wrong)} ${q.status === "discussing" ? "animate-pulse" : ""}`} />
                          <div className="flex-1 min-w-0 px-3.5 py-2.5">
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`text-sm font-bold shrink-0 ${isSelected ? "text-brand-700" : "text-primary"}`}>
                                  Q{q.num}
                                </span>
                                <span className="text-xs text-tertiary truncate">{q.type}</span>
                                {q.flag && <Star01 className="size-3 text-warning-400 shrink-0" />}
                              </div>
                              {cfg && (
                                <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cfg.cls}`}>
                                  {cfg.label}
                                </span>
                              )}
                            </div>
                            {allCorrect ? (
                              <span className="text-xs font-medium text-success-600">All correct</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                {MEMBERS.map(m => {
                                  const isWrong = q.groupPicks[m.key] !== q.correct;
                                  return (
                                    <span key={m.key} className={`text-xs font-bold rounded px-1.5 py-0.5 ${
                                      isWrong
                                        ? "bg-error-50 text-error-600 border border-error-100"
                                        : "bg-success-50 text-success-600 border border-success-100"
                                    }`}>
                                      {m.init}<span className="text-[9px]">{isWrong ? "✗" : "✓"}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <div className="h-4" />
            </div>
          </div>

          {/* ── Divider ────────────────────────────────────────────────── */}
          <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 border-t-2 border-secondary bg-secondary">
            <Microphone01 className="size-3.5 text-quaternary" />
            <span className="text-xs font-bold uppercase tracking-widest text-tertiary">Transcript</span>
            <div className="flex -space-x-1.5 ml-auto">
              <Avatar src={AV.sarah} size="xxs" contrastBorder />
              <Avatar src={AV.alex}  size="xxs" contrastBorder />
              <Avatar initials="Me"  size="xxs" contrastBorder className="bg-brand-100! text-brand-700!" />
            </div>
          </div>

          {/* ── Transcript ────────────────────────────────────────────── */}
          <div className="overflow-y-auto scrollbar-hide px-3 py-2.5 space-y-0.5 bg-primary" style={{ height: "460px" }}>
            {TRANSCRIPT.map((line, i) => (
              <div key={i} className="group relative rounded-xl px-3 py-2 -mx-1 hover:bg-secondary transition-colors">
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 shrink-0 size-1.5 rounded-full ${speakerDot(line.speaker, line.isMe)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span className={`text-xs font-semibold ${speakerColor(line.speaker, line.isMe)}`}>
                        {line.speaker}
                      </span>
                      <span className="text-[10px] text-quaternary opacity-0 group-hover:opacity-100 transition-opacity">{line.time}</span>
                      {i === TRANSCRIPT.length - 1 && (
                        <div className="flex items-end gap-px ml-0.5">
                          {[3,5,4,6,3].map((h,j) => (
                            <div key={j} className="w-px rounded-full bg-brand-400 animate-pulse"
                              style={{ height: `${h}px`, animationDelay: `${j * 0.12}s` }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">{line.text}</p>
                  </div>

                  {/* + note button → tag picker */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setPickerLine(pickerLine === i ? null : i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg px-1.5 py-0.5 text-[10px] font-semibold text-brand-600 bg-brand-50 border border-brand-200 hover:bg-brand-100 whitespace-nowrap"
                    >
                      + note
                    </button>

                    {/* Tag picker popover */}
                    {pickerLine === i && (
                      <>
                        <div className="fixed inset-0 z-40" onMouseDown={() => setPickerLine(null)} />
                      <div
                        className="absolute right-0 bottom-full mb-1.5 z-50 w-52 rounded-xl border border-secondary bg-primary shadow-lg overflow-hidden"
                      >
                        <div className="px-3 pt-2.5 pb-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-quaternary">Add to note</p>
                        </div>
                        {allTags.length === 0 ? (
                          <p className="px-3 pb-3 text-xs text-quaternary">No notes yet — type @ to create one.</p>
                        ) : (
                          allTags.map(t => (
                            <button
                              key={t.id}
                              onClick={() => {
                                if (t.id.startsWith("saved")) {
                                  setSavedTag(s => s ? { ...s, body: s.body + (s.body ? "\n" : "") + `${line.speaker}: ${line.text}` } : null);
                                  setPickerLine(null);
                                } else {
                                  appendToTag(t.id, line);
                                }
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors text-left"
                            >
                              <span className={`shrink-0 size-1.5 rounded-full ${t.dot}`} />
                              <div className="min-w-0 flex-1">
                                <p className={`text-[11px] font-bold ${t.labelCls} truncate`}>{t.type}</p>
                                {t.body && (
                                  <p className="text-[10px] text-quaternary truncate">{t.body.slice(0, 40)}{t.body.length > 40 ? "…" : ""}</p>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>

        </aside>
        </div>{/* /max-w-6xl */}
      </div>
    </div>
  );
}
