"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Microphone01,
  MicrophoneOff01,
  X,
  AlignLeft01,
  Copy01,
  Check,
  Plus,
} from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";

/* ─── Mock data ─────────────────────────────────────────────────────────── */

const QUESTION = {
  ref:                "PT 72 · Section 2 · Q14",
  type:               "LR · Weaken",
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

const SARAH_SRC = "https://lh3.googleusercontent.com/aida-public/AB6AXuCnbr_RgeBja1oRPub4d53HJwxc59L88Tixo5xhqrPC7Xtx4uJ4hgvC3vZJ4KOoH6aoHkKkN3FYaOxBMBKsd2Cmhd-YF3dbmVeotH86rG6AwUfYRqEAMXWA44lEIjKfaYAvlbDUPQOldmCjz7M0rNvOJk1D7x-uC1A_r3UbJMOy0hI1tz3JjKduStCSH1u7RVX89OQGtwKNRwNRwRcs1O3B1PMOqtTcsw1CBwUb0gzZKn1qeY_zCa6y3SHXFpQZ-UB5KC8dvVuvYQ";

const TRANSCRIPT_LINES = [
  { speaker: "Sarah", isMe: false, time: "0:08", text: "I picked A thinking it directly undermines the link between cutting emissions and improving air quality." },
  { speaker: "You",   isMe: true,  time: "0:23", text: "Right — A does weaken it, but the key word is 'significantly'. A 40% cut to one source can still produce significant improvement." },
  { speaker: "Sarah", isMe: false, time: "0:41", text: "Oh — so A weakens but doesn't cut the conclusion at the root?" },
  { speaker: "You",   isMe: true,  time: "0:55", text: "Exactly. 'Most seriously weakens' needs to break the whole chain, not just introduce some doubt." },
];

/* ─── Timer ──────────────────────────────────────────────────────────────── */

function useTick(active: boolean) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
  return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
}

type Phase = "requesting" | "live";

const LIVE_NOTES = [
  { tag: "@ Instinct",  choice: "A",                   accent: "border-l-gray-300",   wrap: "border-secondary bg-secondary",  label: "text-tertiary",   body: "Felt like it directly broke the link between cutting emissions and air quality. Moved fast, didn't stress-test." },
  { tag: "@ Insight",   choice: "Didn't stress-test",   accent: "border-l-blue-200",   wrap: "border-blue-100 bg-blue-50",     label: "text-blue-600",   body: "A does weaken, but only partially. 'Significantly' is the key word — a 40% cut to one dominant source can still produce a significant improvement." },
  { tag: "@ Principle", choice: "Degree matters",       accent: "border-l-violet-200", wrap: "border-violet-100 bg-violet-50", label: "text-violet-600", body: "Keep treating 'weakens' and 'most seriously weakens' as the same. Need to check: does this break the core assumption, or just introduce mild doubt?" },
  { tag: "@ Attack Me", choice: null, ref: "@ Insight", accent: "border-l-brand-200",  wrap: "border-brand-200 bg-brand-50",  label: "text-brand-600",  body: "But the explanation says (B) is wrong because it's irrelevant — I'm confused because I thought (A) directly attacks the assumption. Why is (A) not the answer here?" },
];

/* ─── Note composer options ─────────────────────────────────────────────── */
const COMPOSER_OPTS = [
  { type: "@ Instinct",  accentCls: "border-l-gray-300",   labelCls: "text-tertiary",   wrapCls: "bg-primary border-secondary",    dot: "bg-gray-400",   desc: "What your gut said",       subtypes: ["Sounded right", "Process of elim.", "Too extreme", "Time pressure"] as string[] },
  { type: "@ Insight",   accentCls: "border-l-blue-200",   labelCls: "text-blue-600",   wrapCls: "bg-blue-50 border-blue-100",     dot: "bg-blue-400",   desc: "Something you learned",    subtypes: ["Causal link", "Scope / degree", "Conditional logic", "Argument structure"] as string[] },
  { type: "@ Principle", accentCls: "border-l-violet-200", labelCls: "text-violet-600", wrapCls: "bg-violet-50 border-violet-100", dot: "bg-violet-400", desc: "A rule to remember",       subtypes: ["Sufficient vs. necessary", "Most seriously weakens", "Contrapositive", "Scope shift"] as string[] },
  { type: "@ Attack Me", accentCls: "border-l-brand-200",  labelCls: "text-brand-600",  wrapCls: "bg-brand-50 border-brand-200",   dot: "bg-brand-400",  desc: "Open question to address", subtypes: [] as string[] },
];
type AddedNote = { id: string; opt: typeof COMPOSER_OPTS[number]; subtype: string | null; body: string };
let _liveid = 0;

export default function AttackMeLivePage() {
  const [phase, setPhase]                 = useState<Phase>("requesting");
  const [muted, setMuted]                 = useState(false);
  const [sarahSpeaking, setSarahSpeaking] = useState(false);
  const [liveUploaded, setLiveUploaded]   = useState(false);
  const [liveNoteEdits, setLiveNoteEdits] = useState<Record<string, string>>({});
  const [liveDeletedTags, setLiveDeletedTags] = useState<Set<string>>(new Set());
  const duration                          = useTick(phase === "live");
  // Note composer
  const [addedNotes,     setAddedNotes]     = useState<AddedNote[]>([]);
  const [composerOpen,   setComposerOpen]   = useState(false);
  const [composerType,   setComposerType]   = useState<typeof COMPOSER_OPTS[number] | null>(null);
  const [composerSubtype,setComposerSubtype]= useState<string | null>(null);
  const [composerBody,   setComposerBody]   = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const [pickerLine, setPickerLine] = useState<number | null>(null);
  function openComposer() { setComposerOpen(true); setComposerType(null); setComposerSubtype(null); setComposerBody(""); setTimeout(() => composerRef.current?.focus(), 60); }
  function cancelComposer() { setComposerOpen(false); setComposerType(null); setComposerSubtype(null); setComposerBody(""); }
  function submitComposer() {
    if (!composerType) return;
    setAddedNotes(prev => [...prev, { id: `ln${_liveid++}`, opt: composerType, subtype: composerSubtype, body: composerBody }]);
    cancelComposer();
  }

  useEffect(() => {
    const t = setTimeout(() => setPhase("live"), 3000);
    return () => clearTimeout(t);
  }, []);

/* ── CALLING SCREEN ─────────────────────────────────────────────────── */
  if (phase === "requesting") {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-8">
        <div className="relative flex items-center justify-center">
          <span className="absolute size-36 rounded-full bg-brand-100 animate-ping" style={{ animationDuration: "1.5s" }} />
          <span className="absolute size-28 rounded-full bg-brand-50" />
          <div className="relative">
            <Avatar src={SARAH_SRC} size="2xl" />
            <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-success-500 border-2 border-primary" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-primary">Calling Sarah M.</p>
          <p className="text-sm text-tertiary">Sending a voice request · {QUESTION.ref}</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-brand-200 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <Link href="/the-lounge/attack/1">
          <button className="flex items-center gap-2 rounded-full border border-secondary bg-primary px-5 py-2.5 text-sm font-medium text-secondary hover:bg-secondary transition-colors">
            <X className="size-4" />
            Cancel
          </button>
        </Link>
      </div>
    );
  }

  /* ── LIVE SESSION ───────────────────────────────────────────────────── */
  return (
    <div className="h-screen bg-primary flex flex-col overflow-hidden">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="border-b border-secondary bg-primary shrink-0">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 h-14">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-sm font-semibold text-primary">Attack Me · Live</span>
            <span className="text-border">·</span>
            <span className="text-xs text-tertiary">{QUESTION.ref}</span>
            <span className="text-border">·</span>
            <Badge type="pill-color" color="gray" size="sm">{QUESTION.type}</Badge>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-secondary bg-secondary px-3 py-1.5 ml-1">
            <span className="text-xs text-tertiary">⏱</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-primary">{duration}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors ${sarahSpeaking ? "border-success-200 bg-success-50" : "border-secondary"}`}>
              <Avatar src={SARAH_SRC} size="xxs" />
              <span className="text-xs font-medium text-secondary">Sarah</span>
              <span className={`size-1.5 rounded-full ${sarahSpeaking ? "bg-success-500" : "bg-gray-300"}`} />
            </div>
            <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors ${!muted ? "border-brand-200 bg-brand-50" : "border-secondary"}`}>
              <Avatar initials="Me" size="xxs" className="bg-brand-100! text-brand-700!" />
              <span className="text-xs font-medium text-secondary">You</span>
              <span className={`size-1.5 rounded-full ${!muted ? "bg-brand-500" : "bg-gray-300"}`} />
            </div>
          </div>
          <button
            onClick={() => setSarahSpeaking((p) => !p)}
            className="text-[10px] text-quaternary border border-secondary rounded px-2 py-0.5 hover:text-tertiary"
          >
            toggle speaking
          </button>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden mx-auto w-full max-w-6xl px-6">

        {/* Question zone */}
        <div className="border-b border-secondary py-4 overflow-y-auto shrink-0" style={{ maxHeight: "42%" }}>
          <div className="space-y-3">

            {/* Stimulus */}
            <div className="flex gap-3">
              <div className="w-0.5 shrink-0 rounded-full bg-gray-200" />
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
            <div className="flex gap-3 pt-2 border-t border-secondary">
              <div className="w-0.5 shrink-0 rounded-full bg-brand-400" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-500 mb-1.5">Question</p>
                <p className="text-sm font-semibold text-primary leading-relaxed">{QUESTION.stem}</p>
              </div>
            </div>

            {/* Choices */}
            <div className="space-y-1.5 pl-3 mb-1">
              {QUESTION.choices.map((c) => {
                const isSelected = c.letter === QUESTION.sarahPicked;
                const isCorrect  = c.letter === QUESTION.correct;
                return (
                  <div
                    key={c.letter}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${
                      isCorrect  ? "border-success-200 bg-success-50"
                      : isSelected ? "border-error-200 bg-error-50"
                      : "border-secondary bg-primary"
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 flex size-5 items-center justify-center rounded-full text-[10px] font-bold border ${
                      isCorrect  ? "border-success-400 bg-success-100 text-success-700"
                      : isSelected ? "border-error-300 bg-error-100 text-error-700"
                      : "border-secondary text-tertiary"
                    }`}>
                      {c.letter}
                    </span>
                    <p className={`text-sm leading-relaxed ${
                      isCorrect  ? "text-success-800 font-medium"
                      : isSelected ? "text-error-700"
                      : "text-secondary"
                    }`}>
                      {c.text}
                      {isSelected && <span className="ml-2 text-[10px] font-semibold text-error-400">← Sarah picked</span>}
                      {isCorrect  && <span className="ml-2 text-[10px] font-semibold text-success-600">✓ Correct</span>}
                    </p>
                  </div>
                );
              })}
            </div>

          {/* @ Tags — compact context strip */}
          <div className="flex items-center gap-2 pt-3 border-t border-secondary flex-wrap">
            <span className="text-[10px] text-quaternary shrink-0">Sarah's notes:</span>
            {[
              { tag: "@ Instinct", choice: "A",                 wrap: "border-secondary bg-secondary text-tertiary" },
              { tag: "@ Insight",  choice: "Didn't stress-test", wrap: "border-blue-100 bg-blue-50 text-blue-600" },
              { tag: "@ Principle",choice: "Degree matters",    wrap: "border-violet-100 bg-violet-50 text-violet-600" },
            ].map((t) => (
              <span key={t.tag} className={`flex items-center gap-1 text-[10px] font-semibold rounded-full border px-2.5 py-1 ${t.wrap}`}>
                {t.tag}
                <span className="opacity-60">·</span>
                <span className="opacity-70">{t.choice}</span>
              </span>
            ))}
            <span className="text-[10px] text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-2.5 py-1 font-semibold">
              @ Attack Me <span className="opacity-60">·</span> <span className="opacity-70">re: @ Insight</span>
            </span>
          </div>

          </div>
        </div>

        {/* Bottom zone — My Notes (57%) + Live Transcript (43%) */}
        <div className="flex flex-1 divide-x divide-secondary overflow-hidden">

          {/* My Notes */}
          <div className="flex flex-col overflow-hidden" style={{ width: "62%" }}>
            <div className="px-4 pt-3 pb-2 flex items-center gap-2 shrink-0">
              <AlignLeft01 className="size-4 text-quaternary" />
              <span className="text-xs font-semibold text-tertiary uppercase tracking-wide">My Notes</span>
            </div>

            {/* RMU notes — editable for everyone */}
            <div className="flex-1 overflow-y-auto scroll-smooth px-4 py-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-quaternary">Your notes · PT 72 Review Session</p>
                <span className="text-[10px] text-quaternary">Click any note to edit</span>
              </div>
              {LIVE_NOTES.filter((t) => !liveDeletedTags.has(t.tag)).map((t) => {
                const body = liveNoteEdits[t.tag] ?? t.body;
                return (
                  <div key={t.tag} className={`rounded-xl border border-l-4 ${t.accent} ${t.wrap} px-3 py-2 space-y-1.5`}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold uppercase tracking-widest ${t.label}`}>{t.tag}</span>
                      {t.choice && (
                        <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${t.wrap} opacity-80`}>{t.choice}</span>
                      )}
                      {t.ref && (
                        <span className="text-[10px] text-brand-500 bg-brand-100 border border-brand-200 rounded-full px-2 py-0.5 font-medium">re: {t.ref}</span>
                      )}
                      <button
                        onClick={() => setLiveDeletedTags((prev) => new Set([...prev, t.tag]))}
                        className="ml-auto text-quaternary hover:text-error-500 transition-colors"
                        title="Remove this note"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                    <textarea
                      rows={Math.max(2, body.split("\n").length + 1)}
                      value={body}
                      onChange={(e) => {
                        setLiveNoteEdits((prev) => ({ ...prev, [t.tag]: e.target.value }));
                        setLiveUploaded(false);
                      }}
                      className="w-full resize-none bg-transparent text-xs text-secondary leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-300 rounded px-0.5 -mx-0.5 transition-all"
                    />
                  </div>
                );
              })}
              {/* User-added notes */}
              {addedNotes.map(n => (
                <div key={n.id} className={`rounded-xl border border-l-4 ${n.opt.accentCls} ${n.opt.wrapCls} px-3 py-2 space-y-1.5`}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${n.opt.labelCls}`}>{n.opt.type}</span>
                    {n.subtype && <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${n.opt.wrapCls} opacity-80`}>{n.subtype}</span>}
                    <button onClick={() => setAddedNotes(prev => prev.filter(x => x.id !== n.id))} className="ml-auto text-quaternary hover:text-error-500 transition-colors"><X className="size-3" /></button>
                  </div>
                  <textarea
                    rows={Math.max(2, n.body.split("\n").length + 1)}
                    value={n.body}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddedNotes(prev => prev.map(x => x.id === n.id ? { ...x, body: val } : x));
                      setLiveUploaded(false);
                    }}
                    className="w-full resize-none bg-transparent text-xs text-secondary leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-300 rounded px-0.5 -mx-0.5 transition-all"
                  />
                </div>
              ))}

              {/* Note composer */}
              {!composerOpen ? (
                <button onClick={openComposer} className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-secondary bg-primary px-3 py-2 text-xs text-quaternary hover:text-tertiary hover:border-tertiary transition-colors">
                  <Plus className="size-3.5" /> New note
                </button>
              ) : (
                <div className="rounded-lg border border-secondary bg-primary overflow-hidden">
                  <div className="flex items-center gap-1 px-3 pt-2.5 pb-2 border-b border-secondary flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-quaternary mr-1">Type</span>
                    {COMPOSER_OPTS.map(opt => {
                      const active = composerType?.type === opt.type;
                      return (
                        <button key={opt.type} onClick={() => { setComposerType(active ? null : opt); setComposerSubtype(null); }}
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border transition-all ${active ? `${opt.wrapCls} ${opt.labelCls}` : "border-secondary text-tertiary hover:border-tertiary bg-primary"}`}>
                          <span className={`size-1.5 rounded-full ${active ? opt.dot : "bg-gray-300"}`} />
                          {opt.type.replace("@ ", "")}
                        </button>
                      );
                    })}
                  </div>
                  {composerType && composerType.subtypes.length > 0 && (
                    <div className="flex items-center gap-1 px-3 pt-2.5 pb-2.5 border-b border-secondary flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-quaternary mr-1">Subtype</span>
                      {composerType.subtypes.map(sub => (
                        <button key={sub} onClick={() => setComposerSubtype(composerSubtype === sub ? null : sub)}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium border transition-all ${composerSubtype === sub ? `${composerType.wrapCls} ${composerType.labelCls}` : "border-secondary text-tertiary hover:border-tertiary bg-primary"}`}>
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea ref={composerRef} rows={2} value={composerBody} onChange={e => setComposerBody(e.target.value)}
                    placeholder={composerType ? `${composerType.desc}…` : "Select a type…"}
                    className="w-full resize-none bg-transparent px-3 py-2 text-xs text-secondary placeholder:text-quaternary focus:outline-none leading-relaxed" />
                  <div className="flex items-center justify-end gap-1.5 px-3 pb-2 pt-1 border-t border-secondary">
                    <button onClick={cancelComposer} className="text-[10px] font-semibold text-tertiary hover:text-primary px-2 py-1">Cancel</button>
                    <button onClick={submitComposer} disabled={!composerType}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all ${composerType ? "bg-gray-900 text-white hover:bg-brand-600" : "bg-secondary text-quaternary cursor-not-allowed"}`}>
                      <Plus className="size-3" /> Add note
                    </button>
                  </div>
                </div>
              )}

              {/* Upload button */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <Link href="/rmu" className="flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                  Open in RMU <span className="text-brand-400">→</span>
                </Link>
                <div className="flex items-center gap-2">
                  {liveUploaded && (
                    <span className="flex items-center gap-1 text-[10px] text-success-600 font-medium">
                      <Check className="size-3" /> Uploaded
                    </span>
                  )}
                  <button
                    onClick={() => setLiveUploaded(true)}
                    className="flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-brand-600 transition-colors"
                  >
                    <Copy01 className="size-3" />
                    Save to RMU
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Live Transcript */}
          <div className="flex flex-col overflow-hidden" style={{ width: "38%" }}>
            <div className="px-4 pt-3 pb-2 flex items-center gap-2 shrink-0">
              <Microphone01 className="size-4 text-quaternary" />
              <span className="text-xs font-semibold text-tertiary uppercase tracking-wide">Live Transcript</span>
            </div>
            <div className="flex-1 overflow-y-auto scroll-smooth px-4 py-2 space-y-0.5">
              {TRANSCRIPT_LINES.map((line, i) => (
                <div
                  key={i}
                  className="group relative rounded-lg px-2 py-2 -mx-2 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {/* Speaker dot */}
                    <span className={`mt-1.5 shrink-0 size-1.5 rounded-full ${line.isMe ? "bg-brand-400" : "bg-gray-300"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[10px] font-semibold ${line.isMe ? "text-brand-600" : "text-secondary"}`}>{line.speaker}</span>
                        <span className="text-[10px] text-quaternary opacity-0 group-hover:opacity-100 transition-opacity">{line.time}</span>
                        {i === TRANSCRIPT_LINES.length - 1 && (
                          <div className="flex items-end gap-px ml-0.5">
                            {[3, 5, 4, 6, 3].map((h, j) => (
                              <div key={j} className="w-0.5 rounded-full bg-brand-400 animate-pulse" style={{ height: `${h}px`, animationDelay: `${j * 0.1}s` }} />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">{line.text}</p>
                    </div>
                    {/* Add to notes — appears on hover, toggles picker */}
                    <button
                      onClick={() => setPickerLine(pickerLine === i ? null : i)}
                      className={`shrink-0 transition-opacity mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold text-brand-600 bg-brand-50 border border-brand-200 hover:bg-brand-100 ${pickerLine === i ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      + note
                    </button>
                  </div>
                  {/* Note picker popover */}
                  {pickerLine === i && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setPickerLine(null)} />
                      <div className="relative z-50 mt-1.5 ml-5 rounded-lg border border-secondary bg-primary shadow-md overflow-hidden">
                        <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-quaternary border-b border-secondary">Add to note</p>
                        <div className="py-0.5">
                          {LIVE_NOTES.filter((t) => !liveDeletedTags.has(t.tag)).map((t) => (
                            <button
                              key={t.tag}
                              onClick={() => {
                                setLiveNoteEdits((prev) => {
                                  const existing = prev[t.tag] ?? t.body;
                                  return { ...prev, [t.tag]: existing + (existing ? "\n" : "") + `${line.speaker}: ${line.text}` };
                                });
                                setLiveUploaded(false);
                                setPickerLine(null);
                              }}
                              className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-[10px] hover:bg-secondary transition-colors`}
                            >
                              <span className={`font-semibold ${t.label}`}>{t.tag}</span>
                              {t.choice && <span className="opacity-50">{t.choice}</span>}
                            </button>
                          ))}
                          {addedNotes.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                setAddedNotes((prev) =>
                                  prev.map((x) =>
                                    x.id === n.id
                                      ? { ...x, body: x.body + (x.body ? "\n" : "") + `${line.speaker}: ${line.text}` }
                                      : x
                                  )
                                );
                                setLiveUploaded(false);
                                setPickerLine(null);
                              }}
                              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-[10px] hover:bg-secondary transition-colors"
                            >
                              <span className={`font-semibold ${n.opt.labelCls}`}>{n.opt.type}</span>
                              {n.subtype && <span className="opacity-50">{n.subtype}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {sarahSpeaking && (
                <div className="rounded-lg px-2 py-2 -mx-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 shrink-0 size-1.5 rounded-full bg-success-400 animate-pulse" />
                    <div>
                      <span className="text-[10px] font-semibold text-secondary">Sarah</span>
                      <div className="flex items-end gap-px ml-2 inline-flex">
                        {[4, 6, 5, 7, 4].map((h, j) => (
                          <div key={j} className="w-0.5 rounded-full bg-success-400 animate-pulse" style={{ height: `${h}px`, animationDelay: `${j * 0.08}s` }} />
                        ))}
                      </div>
                      <p className="text-xs text-quaternary italic mt-0.5">Speaking…</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom voice bar ──────────────────────────────────── */}
      <div className="border-t border-secondary bg-gray-900 shrink-0 h-16 flex items-center px-8">
        <div className="mx-auto max-w-6xl w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border transition-colors ${sarahSpeaking ? "border-success-500/40 bg-success-500/10" : "border-white/10 bg-white/5"}`}>
              <Avatar src={SARAH_SRC} size="xxs" />
              <div className="flex items-end gap-px">
                {[3, 5, 4, 6, 3].map((h, j) => (
                  <span key={j} className={`w-0.5 rounded-full transition-all ${sarahSpeaking ? "bg-success-400" : "bg-gray-600"}`} style={{ height: sarahSpeaking ? `${h}px` : "3px" }} />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">Sarah</span>
            </div>
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border transition-colors ${!muted ? "border-brand-500/40 bg-brand-600/10" : "border-white/10 bg-white/5"}`}>
              <Avatar initials="Me" size="xxs" className="bg-brand-600! text-white!" />
              <div className="flex items-end gap-px">
                {[4, 6, 5, 7, 4].map((h, j) => (
                  <span key={j} className={`w-0.5 rounded-full transition-all ${!muted ? "bg-brand-400" : "bg-gray-600"}`} style={{ height: !muted ? `${h}px` : "3px" }} />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">You</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMuted((p) => !p)}
              className={`flex size-10 items-center justify-center rounded-full transition-all ${muted ? "bg-error-600 hover:bg-error-700" : "bg-white/10 hover:bg-white/20"}`}
            >
              {muted ? <MicrophoneOff01 className="size-4 text-white" /> : <Microphone01 className="size-4 text-white" />}
            </button>
            <Link href="/the-lounge/attack/1">
              <button className="flex h-10 items-center gap-2 rounded-full bg-error-600 px-5 text-sm font-semibold text-white hover:bg-error-700 transition-colors">
                <X className="size-3.5" />
                End Session
              </button>
            </Link>
          </div>
          <div className="w-48" />
        </div>
      </div>

    </div>
  );
}
