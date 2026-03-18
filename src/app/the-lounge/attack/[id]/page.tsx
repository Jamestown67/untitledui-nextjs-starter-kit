"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  Send01,
  Microphone01,
  CheckCircle,
  BookmarkAdd,
  Copy01,
  Heart,
  Plus,
  X,
  Check,
} from "@untitledui/icons";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";

/* ─── Mock data ─────────────────────────────────────────────────────────── */

const QUESTION = {
  ref:   "PT 72 · Section 2 · Q14",
  type:  "LR · Weaken",
  stimulusPre:        "A new environmental regulation will reduce industrial emissions in the region by 40 percent over the next decade.",
  stimulusConclusion: "Since industrial emissions are the primary contributor to poor air quality in urban areas, this regulation will significantly improve air quality in those areas.",
  stem:    "Which one of the following, if true, most seriously weakens the argument?",
  choices: [
    { letter: "A", text: "Industrial emissions are not the only source of air pollution in urban areas." },
    { letter: "B", text: "The regulation was supported by a broad coalition of environmental groups." },
    { letter: "C", text: "Some industrial facilities have already voluntarily reduced their emissions." },
    { letter: "D", text: "The cost of implementing the regulation will be distributed unevenly across industries." },
    { letter: "E", text: "The concentration of other urban air pollutants has increased significantly in recent years." },
  ],
  sarahPicked: "A",
  correct:     "E",
};

// RMU tag system — @ Instinct / @ Insight / @ Principle / @ Attack Me
// Each of the first three has sub-choices the student selects in RMU
const RMU_TAGS = [
  {
    tag:       "@ Instinct",
    choice:    "A",
    accentCls: "border-l-gray-300",
    wrap:      "border-secondary bg-secondary",
    label:     "text-tertiary",
    text:      "text-secondary",
    body:      "Felt like it directly broke the link between cutting emissions and air quality. Moved fast, didn't stress-test.",
  },
  {
    tag:       "@ Insight",
    choice:    "Didn't stress-test",
    accentCls: "border-l-blue-200",
    wrap:      "border-blue-100 bg-blue-50",
    label:     "text-blue-600",
    text:      "text-secondary",
    body:      "A does weaken, but only partially. 'Significantly' is the key word — a 40% cut to one dominant source can still produce a significant improvement. A introduces noise, doesn't cut the root.",
  },
  {
    tag:       "@ Principle",
    choice:    "Degree matters",
    accentCls: "border-l-violet-200",
    wrap:      "border-violet-100 bg-violet-50",
    label:     "text-violet-600",
    text:      "text-secondary",
    body:      "Keep treating 'weakens' and 'most seriously weakens' as the same. Need to check: does this break the core assumption, or just introduce mild doubt?",
  },
  {
    tag:       "@ Attack Me",
    choice:    null,
    ref:       "@ Insight",
    accentCls: "border-l-brand-200",
    wrap:      "border-brand-200 bg-brand-50",
    label:     "text-brand-600",
    text:      "text-primary",
    body:      "But the explanation says (B) is wrong because it's irrelevant — I'm confused because I thought (A) directly attacks the assumption. Why is (A) not the answer here?",
  },
];

const MOCK_REPLIES = [
  {
    id: 1,
    author: "Alex K.",
    avatarSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaDVPO_H9fb7Vi4GNkZxnb1cqxRnKnSjVOlNDMMVLvn5sXtLjh9Zqbou_xsG38pO8QDckuwkJMpS6YB3WZFpF1ISfX_Z00g--ODlj4KI13VQ3tryjZ4zf1cSRcphRQC7u54BcP1zn2N612ze6hl8XRbyqzbUn_RNXIygO91cMJBdfGCsbfjjLa_4dh71oW-_lQnYwvLfTxd8rWkYjKNH8fZc4_Dgz5wLHuWuxd195LVfpa2MnDu04OfbrBG7GKFu2u_lqzOO5t8Q",
    ago: "2m ago",
    body: "You're on the right track — (A) does weaken it. The key is degree. (A) says industrial emissions aren't the only source, but the conclusion says air quality will improve significantly. Reducing 40% of one source can still produce a significant improvement. (A) weakens but doesn't fully undermine.",
    pinned: true,
  },
  {
    id: 2,
    author: "Sarah M.",
    avatarSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnbr_RgeBja1oRPub4d53HJwxc59L88Tixo5xhqrPC7Xtx4uJ4hgvC3vZJ4KOoH6aoHkKkN3FYaOxBMBKsd2Cmhd-YF3dbmVeotH86rG6AwUfYRqEAMXWA44lEIjKfaYAvlbDUPQOldmCjz7M0rNvOJk1D7x-uC1A_r3UbJMOy0hI1tz3JjKduStCSH1u7RVX89OQGtwKNRwNRwRcs1O3B1PMOqtTcsw1CBwUb0gzZKn1qeY_zCa6y3SHXFpQZ-UB5KC8dvVuvYQ",
    ago: "5m ago",
    body: "Think about what the correct answer needs to do: most undermine. That means cutting the core assumption. The author assumes industrial emissions are the dominant driver. If the correct answer shows that even with a 40% cut, something else negates the improvement — that's a stronger attack.",
    pinned: false,
  },
];

type Reply = { id: number; author: string; avatarSrc?: string; initials?: string; ago: string; body: string; pinned: boolean };

/* ─── Note composer options ─────────────────────────────────────────────── */
const COMPOSER_OPTS = [
  { type: "@ Instinct",  accentCls: "border-l-gray-300",   labelCls: "text-tertiary",   wrapCls: "bg-primary border-secondary",    dot: "bg-gray-400",   desc: "What your gut said",       subtypes: ["Sounded right", "Process of elim.", "Too extreme", "Time pressure"] as string[] },
  { type: "@ Insight",   accentCls: "border-l-blue-200",   labelCls: "text-blue-600",   wrapCls: "bg-blue-50 border-blue-100",     dot: "bg-blue-400",   desc: "Something you learned",    subtypes: ["Causal link", "Scope / degree", "Conditional logic", "Argument structure"] as string[] },
  { type: "@ Principle", accentCls: "border-l-violet-200", labelCls: "text-violet-600", wrapCls: "bg-violet-50 border-violet-100", dot: "bg-violet-400", desc: "A rule to remember",       subtypes: ["Sufficient vs. necessary", "Most seriously weakens", "Contrapositive", "Scope shift"] as string[] },
  { type: "@ Attack Me", accentCls: "border-l-brand-200",  labelCls: "text-brand-600",  wrapCls: "bg-brand-50 border-brand-200",   dot: "bg-brand-400",  desc: "Open question to address", subtypes: [] as string[] },
];
type AddedNote = { id: string; opt: typeof COMPOSER_OPTS[number]; subtype: string | null; body: string };
let _attackid = 0;

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function AttackMeSessionPage() {
  const params = useParams();
  const id = params.id as string;
  const [viewAs, setViewAs] = useState<"attacker" | "requester">("attacker");
  const [requesterOnline, setRequesterOnline] = useState(true);
  const [resolved, setResolved] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [replies, setReplies] = useState<Reply[]>(MOCK_REPLIES);
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(new Set([1]));
  const [thankedIds, setThankedIds] = useState<Set<number>>(new Set());
  // RMU export state
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [exportedIds, setExportedIds] = useState<Set<number>>(new Set());
  // Editable note state for requester
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [savedReplyText, setSavedReplyText] = useState("You're on the right track — (A) does weaken it. The key is degree. (A) says industrial emissions aren't the only source, but the conclusion says air quality will improve significantly. Reducing 40% of one source can still produce a significant improvement. (A) weakens but doesn't fully undermine.");
  const [uploaded, setUploaded] = useState(false);
  const [deletedTags, setDeletedTags] = useState<Set<string>>(new Set());
  const [savedReplyDeleted, setSavedReplyDeleted] = useState(false);
  // Note composer
  const [addedNotes,     setAddedNotes]     = useState<AddedNote[]>([]);
  const [composerOpen,   setComposerOpen]   = useState(false);
  const [composerType,   setComposerType]   = useState<typeof COMPOSER_OPTS[number] | null>(null);
  const [composerSubtype,setComposerSubtype]= useState<string | null>(null);
  const [composerBody,   setComposerBody]   = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  function openComposer() { setComposerOpen(true); setComposerType(null); setComposerSubtype(null); setComposerBody(""); setTimeout(() => composerRef.current?.focus(), 60); }
  function cancelComposer() { setComposerOpen(false); setComposerType(null); setComposerSubtype(null); setComposerBody(""); }
  function submitComposer() {
    if (!composerType) return;
    setAddedNotes(prev => [...prev, { id: `an${_attackid++}`, opt: composerType, subtype: composerSubtype, body: composerBody }]);
    cancelComposer();
  }

  function openExport(id: number) {
    setExportingId(exportingId === id ? null : id);
  }

  function toggleThank(id: number) {
    setThankedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function sendReply() {
    const val = replyInput.trim();
    if (!val) return;
    setReplies((prev) => [...prev, { id: Date.now(), author: "You", initials: "Me", ago: "just now", body: val, pinned: false }]);
    setReplyInput("");
  }
  function togglePin(id: number) {
    setPinnedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const isRequester = viewAs === "requester";

  // Attacker sees only @ Insight + @ Attack Me
  const visibleTags = RMU_TAGS.filter((t) => isRequester || t.tag === "@ Insight" || t.tag === "@ Attack Me");

  return (
    <div className="min-h-screen bg-primary">

      {/* ── Prototype switcher ─────────────────────────────── */}
      <div className="border-b border-secondary bg-secondary/50">
        <div className="mx-auto max-w-6xl px-8 py-2 flex items-center gap-3">
          <span className="text-xs text-quaternary font-medium">Viewing as:</span>
          <div className="flex rounded-lg border border-secondary overflow-hidden">
            {(["attacker", "requester"] as const).map((role) => (
              <button key={role} onClick={() => setViewAs(role)}
                className={`px-3 py-1 text-xs font-semibold transition-colors border-r border-secondary last:border-r-0 capitalize ${
                  viewAs === role ? "bg-gray-900 text-white" : "bg-primary text-secondary hover:bg-secondary"
                }`}>
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-8 pt-6 pb-4">
        <nav className="flex items-center gap-1.5 text-sm text-tertiary">
          <Link href="/the-lounge" className="hover:text-secondary transition-colors">The Lounge</Link>
          <ChevronRight className="size-3.5 text-quaternary" />
          <span className="text-secondary">Attack Requests</span>
          <ChevronRight className="size-3.5 text-quaternary" />
          <span className="text-primary font-medium">PT 72 · S2 · Q14</span>
        </nav>
      </div>

      {/* ── Main layout ────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-8 pb-24">
        <div className="grid grid-cols-[1fr_400px] gap-10 items-start">

          {/* ── LEFT: one continuous reading flow ──────────── */}
          <div>

            {/* Who + meta — compact, no card */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative shrink-0">
                {isRequester
                  ? <Avatar initials="Me" size="sm" className="bg-brand-100! text-brand-700!" />
                  : <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnbr_RgeBja1oRPub4d53HJwxc59L88Tixo5xhqrPC7Xtx4uJ4hgvC3vZJ4KOoH6aoHkKkN3FYaOxBMBKsd2Cmhd-YF3dbmVeotH86rG6AwUfYRqEAMXWA44lEIjKfaYAvlbDUPQOldmCjz7M0rNvOJk1D7x-uC1A_r3UbJMOy0hI1tz3JjKduStCSH1u7RVX89OQGtwKNRwNRwRcs1O3B1PMOqtTcsw1CBwUb0gzZKn1qeY_zCa6y3SHXFpQZ-UB5KC8dvVuvYQ" size="sm" />
                }
                <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-primary ${requesterOnline ? "bg-success-500" : "bg-gray-300"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-primary">{isRequester ? "Your question" : "Sarah M."}</p>
                  <span className="text-border">·</span>
                  <p className="text-xs text-brand-600 font-medium">{QUESTION.ref}</p>
                  <span className="text-border">·</span>
                  <p className="text-xs text-tertiary">{QUESTION.type}</p>
                  <span className="text-border">·</span>
                  {resolved
                    ? <Badge type="pill-color" color="success" size="sm">Resolved</Badge>
                    : <BadgeWithDot type="pill-color" color="warning" size="sm">Open</BadgeWithDot>
                  }
                </div>
                <p className={`text-xs mt-0.5 ${requesterOnline ? "text-success-600" : "text-quaternary"}`}>
                  {isRequester ? "You're online" : requesterOnline ? "Online now · ready for voice" : "Away · leave a text reply"}
                </p>
              </div>
              {!isRequester && (
                <button onClick={() => setRequesterOnline(p => !p)}
                  className="text-[10px] text-quaternary border border-secondary rounded px-2 py-0.5 hover:text-tertiary shrink-0">
                  toggle online
                </button>
              )}
            </div>

            {/* Question — no heavy card, subtle bg */}
            <div className="bg-secondary rounded-xl px-5 pt-5 pb-4 space-y-4">

              {/* Stimulus */}
              <div className="flex gap-3">
                <div className="w-0.5 shrink-0 rounded-full bg-gray-300 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-quaternary mb-1.5">Stimulus</p>
                  <p className="text-sm text-secondary leading-relaxed">
                    {QUESTION.stimulusPre}{" "}
                    <mark style={{ background: "rgb(254,249,195)", borderRadius: "3px", padding: "1px 3px" }}>
                      {QUESTION.stimulusConclusion}
                    </mark>
                  </p>
                </div>
              </div>

              {/* Stem */}
              <div className="flex gap-3 pt-3 border-t border-secondary">
                <div className="w-0.5 shrink-0 rounded-full bg-brand-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-500 mb-1.5">Question</p>
                  <p className="text-sm font-semibold text-primary leading-relaxed">{QUESTION.stem}</p>
                </div>
              </div>

              {/* Choices */}
              <div className="space-y-1.5 pl-3">
                {QUESTION.choices.map((c) => {
                  const isSel = c.letter === QUESTION.sarahPicked;
                  const isOk  = c.letter === QUESTION.correct;
                  return (
                    <div key={c.letter} className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${
                      isOk ? "border-success-200 bg-success-50" : isSel ? "border-error-200 bg-error-50" : "border-secondary bg-primary"
                    }`}>
                      <span className={`mt-0.5 shrink-0 flex size-5 items-center justify-center rounded-full text-[10px] font-bold border ${
                        isOk ? "border-success-400 bg-success-100 text-success-700" : isSel ? "border-error-300 bg-error-100 text-error-700" : "border-secondary text-tertiary"
                      }`}>{c.letter}</span>
                      <p className={`text-sm leading-relaxed ${isOk ? "text-success-900 font-medium" : isSel ? "text-error-800" : "text-secondary"}`}>
                        {c.text}
                        {isSel && <span className="ml-2 text-[10px] font-semibold text-error-400">← Sarah picked</span>}
                        {isOk  && <span className="ml-2 text-[10px] font-semibold text-success-600">✓ Correct</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* @ Tags — flow naturally below question, no hard card boundary */}
            <div className="mt-1 pl-1">
              {/* Source label — small, inline */}
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-[10px] text-quaternary">
                  {isRequester ? "Your notes from" : "Sarah's notes from"}{" "}
                  <span className="font-semibold">PT 72 · Review Session</span>
                </p>
                <span className="text-[10px] text-quaternary">Click any note to edit</span>
              </div>

              <div className="space-y-2">
                {visibleTags.filter((t) => !deletedTags.has(t.tag)).map((t) => {
                  const editedBody = noteEdits[t.tag] ?? t.body;
                  return (
                    <div key={t.tag} className={`rounded-2xl border border-l-4 ${t.accentCls} ${t.wrap} px-4 py-3 space-y-2`}>
                      {/* Tag header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${t.label}`}>{t.tag}</span>
                        {t.choice && (
                          <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${t.wrap} opacity-80`}>
                            {t.choice}
                          </span>
                        )}
                        {t.ref && (
                          <span className="text-[10px] text-brand-500 bg-brand-100 border border-brand-200 rounded-full px-2 py-0.5 font-medium">
                            re: {isRequester ? "your" : "her"} {t.ref}
                          </span>
                        )}
                        <button
                          onClick={() => setDeletedTags((prev) => new Set([...prev, t.tag]))}
                          className="ml-auto text-quaternary hover:text-error-500 transition-colors"
                          title="Remove this note"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      {/* Body — editable for all */}
                      <textarea
                        rows={3}
                        value={editedBody}
                        onChange={(e) => {
                          setNoteEdits((prev) => ({ ...prev, [t.tag]: e.target.value }));
                          setUploaded(false);
                        }}
                        className={`w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-300 rounded px-1 -mx-1 transition-all ${t.text} placeholder:text-placeholder`}
                      />
                    </div>
                  );
                })}

                {/* Saved reply from Attack Me — editable for requester */}
                {isRequester && !savedReplyDeleted && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-quaternary">Saved from Attack Me</span>
                      <span className="flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                        <BookmarkAdd className="size-2.5" />
                        Alex K.
                      </span>
                      <span className="text-[10px] text-quaternary ml-auto">2m ago</span>
                      <button
                        onClick={() => setSavedReplyDeleted(true)}
                        className="text-quaternary hover:text-error-500 transition-colors"
                        title="Remove this note"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={savedReplyText}
                      onChange={(e) => { setSavedReplyText(e.target.value); setUploaded(false); }}
                      className="w-full resize-none rounded-lg bg-transparent text-sm text-secondary leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-300 px-1 -mx-1 transition-all"
                    />
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                      <span className="text-[10px] text-quaternary">Tagged as</span>
                      <span className="flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        @ Insight · Degree of weakening
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* User-added notes */}
              {addedNotes.map(n => (
                <div key={n.id} className={`rounded-2xl border border-l-4 ${n.opt.accentCls} ${n.opt.wrapCls} px-4 py-3 space-y-2`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${n.opt.labelCls}`}>{n.opt.type}</span>
                    {n.subtype && <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${n.opt.wrapCls} opacity-80`}>{n.subtype}</span>}
                    <button onClick={() => setAddedNotes(prev => prev.filter(x => x.id !== n.id))} className="ml-auto text-quaternary hover:text-error-500 transition-colors"><X className="size-3.5" /></button>
                  </div>
                  <textarea
                    rows={Math.max(2, n.body.split("\n").length + 1)}
                    value={n.body}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddedNotes(prev => prev.map(x => x.id === n.id ? { ...x, body: val } : x));
                      setUploaded(false);
                    }}
                    className="w-full resize-none bg-transparent text-sm text-secondary leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-300 rounded px-1 -mx-1 transition-all"
                  />
                </div>
              ))}

              {/* Note composer */}
              {!composerOpen ? (
                <button onClick={openComposer} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-secondary bg-primary px-4 py-2.5 text-sm text-quaternary hover:text-tertiary hover:border-tertiary transition-colors">
                  <Plus className="size-4" /> New note
                </button>
              ) : (
                <div className="rounded-xl border border-secondary bg-primary overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 pt-3 pb-2.5 border-b border-secondary flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-quaternary mr-1">Type</span>
                    {COMPOSER_OPTS.map(opt => {
                      const active = composerType?.type === opt.type;
                      return (
                        <button key={opt.type} onClick={() => { setComposerType(active ? null : opt); setComposerSubtype(null); }}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${active ? `${opt.wrapCls} ${opt.labelCls}` : "border-secondary text-tertiary hover:border-tertiary hover:text-primary bg-primary"}`}>
                          <span className={`size-1.5 rounded-full ${active ? opt.dot : "bg-gray-300"}`} />
                          {opt.type.replace("@ ", "")}
                        </button>
                      );
                    })}
                  </div>
                  {composerType && composerType.subtypes.length > 0 && (
                    <div className="flex items-center gap-1.5 px-4 pt-2.5 pb-2.5 border-b border-secondary flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-quaternary mr-1">Subtype</span>
                      {composerType.subtypes.map(sub => (
                        <button key={sub} onClick={() => setComposerSubtype(composerSubtype === sub ? null : sub)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all ${composerSubtype === sub ? `${composerType.wrapCls} ${composerType.labelCls}` : "border-secondary text-tertiary hover:border-tertiary hover:text-primary bg-primary"}`}>
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea ref={composerRef} rows={3} value={composerBody} onChange={e => setComposerBody(e.target.value)}
                    placeholder={composerType ? `${composerType.desc}…` : "Select a type above, then write your note…"}
                    className="w-full resize-none bg-transparent px-4 py-3 text-sm text-secondary placeholder:text-quaternary focus:outline-none leading-relaxed" />
                  <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-1 border-t border-secondary">
                    <button onClick={cancelComposer} className="text-xs font-semibold text-tertiary hover:text-primary px-2 py-1.5">Cancel</button>
                    <button onClick={submitComposer} disabled={!composerType}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${composerType ? "bg-gray-900 text-white hover:bg-brand-600" : "bg-secondary text-quaternary cursor-not-allowed"}`}>
                      <Plus className="size-3.5" /> Add note
                    </button>
                  </div>
                </div>
              )}

              {/* Upload to RMU — available to everyone */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <Link href="/rmu" className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                  Open in RMU
                  <ChevronRight className="size-3.5" />
                </Link>
                <div className="flex items-center gap-3">
                  {uploaded && (
                    <span className="flex items-center gap-1.5 text-xs text-success-600 font-medium">
                      <Check className="size-3.5" /> Uploaded
                    </span>
                  )}
                  <button
                    onClick={() => setUploaded(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
                  >
                    <Copy01 className="size-3.5" />
                    Upload to RMU
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: replies ──────────────────────────────── */}
          <div className="sticky top-6 space-y-4">

            {/* Voice CTA */}
            {requesterOnline ? (
              <Link href={`/the-lounge/attack/${id}/live`}>
                <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-success-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-9 items-center justify-center rounded-xl bg-gray-900">
                      <Microphone01 className="size-4 text-white" />
                      <span className="absolute -top-1 -right-1 size-3 rounded-full bg-success-500 border-2 border-success-50" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">Sarah is online now</p>
                      <p className="text-xs text-success-700">Start a 1-on-1 voice session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5">
                    <Microphone01 className="size-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">Go Live</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-xl border border-secondary bg-secondary px-4 py-3.5 flex items-center justify-between gap-3 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gray-300">
                    <Microphone01 className="size-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">Sarah is away</p>
                    <p className="text-xs text-tertiary">Voice unavailable · leave a text reply</p>
                  </div>
                </div>
                <span className="text-xs text-quaternary">Offline</span>
              </div>
            )}

            {/* Replies header */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">{replies.length} {replies.length === 1 ? "Reply" : "Replies"}</p>
              {isRequester && (
                <button onClick={() => setResolved(r => !r)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${resolved ? "text-success-600" : "text-tertiary hover:text-success-600"}`}>
                  <CheckCircle className="size-4" />
                  {resolved ? "Resolved" : "Mark Resolved"}
                </button>
              )}
            </div>

            {/* Reply cards */}
            <div className="space-y-3">
              {replies.map((reply) => {
                const isPinned  = pinnedIds.has(reply.id);
                const isThanked = thankedIds.has(reply.id);
                const isOwn     = reply.author === "You";
                return (
                  <div key={reply.id} className={`rounded-xl border p-4 transition-colors ${isPinned ? "border-brand-200 bg-brand-50" : "border-secondary bg-primary"}`}>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        {reply.avatarSrc
                          ? <Avatar src={reply.avatarSrc} size="xs" />
                          : <Avatar initials={reply.initials ?? reply.author.slice(0, 2)} size="xs" className="bg-brand-100! text-brand-700!" />
                        }
                        <p className="text-xs font-semibold text-primary">{reply.author}</p>
                        <span className="text-xs text-quaternary">{reply.ago}</span>
                      </div>
                      <button onClick={() => togglePin(reply.id)}
                        className={`flex items-center gap-1 text-[10px] font-semibold transition-colors ${isPinned ? "text-brand-600" : "text-quaternary hover:text-tertiary"}`}>
                        <BookmarkAdd className="size-3.5" />
                        {isPinned ? "Saved" : "Save"}
                      </button>
                    </div>
                    <p className="text-sm text-secondary leading-relaxed mb-3">{reply.body}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-secondary">
                      {!isOwn ? (
                        <button onClick={() => toggleThank(reply.id)}
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                            isThanked ? "bg-error-50 text-error-600 border border-error-200"
                            : "text-quaternary hover:text-error-500 hover:bg-error-50 border border-transparent hover:border-error-100"
                          }`}>
                          <Heart className={`size-3.5 ${isThanked ? "fill-error-500 text-error-500" : ""}`} />
                          {isThanked ? "Thanked" : "Thank"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-quaternary italic">Your reply</span>
                      )}
                      {/* RMU export button — only for requester on non-own replies */}
                      {isRequester && !isOwn && (
                        exportedIds.has(reply.id) ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-success-600">
                            <Check className="size-3" /> Saved to RMU
                          </span>
                        ) : (
                          <button onClick={() => openExport(reply.id)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                            <Plus className="size-3" /> Save to RMU
                          </button>
                        )
                      )}
                    </div>

                    {/* Note-box picker — inline, below footer */}
                    {isRequester && exportingId === reply.id && (
                      <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-600">Add to note</span>
                          <button onClick={() => setExportingId(null)} className="text-quaternary hover:text-secondary">
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {/* Existing RMU note boxes */}
                          {visibleTags.filter((t) => !deletedTags.has(t.tag)).map((t) => (
                            <button
                              key={t.tag}
                              onClick={() => {
                                const existing = noteEdits[t.tag] ?? t.body;
                                setNoteEdits((prev) => ({ ...prev, [t.tag]: existing + (existing ? "\n" : "") + reply.body }));
                                setExportedIds((prev) => { const n = new Set(prev); n.add(reply.id); return n; });
                                setExportingId(null);
                              }}
                              className={`w-full text-left flex items-center gap-2 rounded-lg border px-3 py-2 text-xs hover:opacity-80 transition-opacity ${t.wrap}`}
                            >
                              <span className={`text-[10px] font-semibold ${t.label}`}>{t.tag}</span>
                              {t.choice && <span className="text-[10px] opacity-60">{t.choice}</span>}
                            </button>
                          ))}
                          {/* User-added note boxes */}
                          {addedNotes.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                setAddedNotes((prev) =>
                                  prev.map((x) =>
                                    x.id === n.id
                                      ? { ...x, body: x.body + (x.body ? "\n" : "") + reply.body }
                                      : x
                                  )
                                );
                                setExportedIds((prev) => { const ns = new Set(prev); ns.add(reply.id); return ns; });
                                setExportingId(null);
                              }}
                              className={`w-full text-left flex items-center gap-2 rounded-lg border px-3 py-2 text-xs hover:opacity-80 transition-opacity ${n.opt.wrapCls}`}
                            >
                              <span className={`text-[10px] font-semibold ${n.opt.labelCls}`}>{n.opt.type}</span>
                              {n.subtype && <span className="text-[10px] opacity-60">{n.subtype}</span>}
                            </button>
                          ))}
                          {/* No notes at all */}
                          {visibleTags.filter((t) => !deletedTags.has(t.tag)).length === 0 && addedNotes.length === 0 && (
                            <p className="text-[10px] text-quaternary text-center py-2">No note boxes yet — add one first</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reply input */}
            <div className="rounded-xl border border-secondary bg-primary p-3 space-y-2.5">
              <textarea rows={3}
                placeholder={isRequester ? "Ask a follow-up…" : "Share your explanation…"}
                value={replyInput} onChange={(e) => setReplyInput(e.target.value)}
                className="w-full resize-none rounded-lg border border-secondary bg-secondary px-3.5 py-2.5 text-sm text-primary placeholder:text-placeholder focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-quaternary">{isRequester ? "Still confused? Ask a follow-up." : "Be specific — show your reasoning."}</p>
                <button onClick={sendReply} disabled={!replyInput.trim()}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    replyInput.trim() ? "bg-gray-900 text-white hover:bg-brand-600" : "bg-secondary text-quaternary cursor-not-allowed"
                  }`}>
                  <Send01 className="size-3.5" />
                  {isRequester ? "Follow up" : "Reply"}
                </button>
              </div>
            </div>


          </div>
        </div>
      </main>
    </div>
  );
}
