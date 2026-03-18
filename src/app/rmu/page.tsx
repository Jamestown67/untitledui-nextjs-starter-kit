"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  X,
  Check,
  Edit01,
  SearchLg,
  FilterLines,
  Copy01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";

/* ─── Mock RMU data ─────────────────────────────────────────────────────── */

type TagType = "@ Instinct" | "@ Insight" | "@ Principle" | "@ Attack Me";

type RMUEntry = {
  id: number;
  tag: TagType;
  choice: string | null;
  body: string;
  source: string;   // e.g. "PT 72 · S2 · Q14"
  date: string;
  pinned?: boolean;
};

const INITIAL_ENTRIES: RMUEntry[] = [
  // ── Today — PT 72 ───────────────────────────────────────────────────────
  {
    id: 1,
    tag: "@ Instinct",
    choice: "A",
    body: "Felt like it directly broke the link between cutting emissions and air quality. Moved fast, didn't stress-test.",
    source: "PT 72 · S2 · Q14",
    date: "Today",
    pinned: false,
  },
  {
    id: 2,
    tag: "@ Insight",
    choice: "Didn't stress-test",
    body: "A does weaken, but only partially. 'Significantly' is the key word — a 40% cut to one dominant source can still produce a significant improvement. A introduces noise, doesn't cut the root.",
    source: "PT 72 · S2 · Q14",
    date: "Today",
    pinned: true,
  },
  {
    id: 3,
    tag: "@ Insight",
    choice: "Degree of weakening",
    body: "Degree is what separates a weakener from the 'most serious' weakener. You need to break the core chain, not just introduce doubt at the margins. (via Attack Me · Alex K.)",
    source: "PT 72 · S2 · Q14",
    date: "Today",
    pinned: true,
  },
  {
    id: 4,
    tag: "@ Principle",
    choice: "Degree matters",
    body: "'Weakens' ≠ 'most seriously weakens'. Every time the stem says 'most seriously', pause and ask: does this break the assumption at its root, or just chip at the edges?",
    source: "PT 72 · S2 · Q14",
    date: "Today",
    pinned: false,
  },
  {
    id: 5,
    tag: "@ Attack Me",
    choice: null,
    body: "If industrial emissions are the primary driver and we cut them 40%, why doesn't that 'significantly' improve air quality — what am I missing about the word 'significantly' here?",
    source: "PT 72 · S2 · Q14",
    date: "Today",
    pinned: false,
  },
  {
    id: 6,
    tag: "@ Instinct",
    choice: "C",
    body: "This one felt like a classic assumption bridge — went fast. Got it right but couldn't fully articulate why C works over B.",
    source: "PT 72 · S1 · Q6",
    date: "Today",
    pinned: false,
  },
  {
    id: 7,
    tag: "@ Insight",
    choice: "Confused correlation/cause",
    body: "The stimulus never said X caused Y — I inferred causation from temporal sequence. The author's assumption is that the correlation is causal, which is exactly what C identifies.",
    source: "PT 72 · S1 · Q6",
    date: "Today",
    pinned: true,
  },
  // ── Yesterday — PT 71 ───────────────────────────────────────────────────
  {
    id: 8,
    tag: "@ Insight",
    choice: "Missed scope shift",
    body: "'Primary contributor' ≠ 'sole contributor'. I read the stimulus too fast and treated it as an exclusive claim. This scoped-down language cost me on three weaken questions this session.",
    source: "PT 71 · S3 · Q8",
    date: "Yesterday",
    pinned: true,
  },
  {
    id: 9,
    tag: "@ Principle",
    choice: "Scope must match",
    body: "When the conclusion uses hedged language ('primarily', 'mostly', 'largely'), a weakener needs to attack that specific degree — not the whole claim.",
    source: "PT 71 · S3 · Q8",
    date: "Yesterday",
    pinned: false,
  },
  {
    id: 10,
    tag: "@ Instinct",
    choice: "D",
    body: "Felt like a necessary condition question so I went for D — it eliminated a potential exception. Correct, but I was pattern-matching, not reasoning.",
    source: "PT 71 · S1 · Q19",
    date: "Yesterday",
    pinned: false,
  },
  {
    id: 11,
    tag: "@ Insight",
    choice: "Necessary vs. sufficient",
    body: "Assumption questions for sufficient-condition arguments need the contrapositive to hold. I keep finding the sufficient condition and forgetting to check if the necessary direction was actually assumed.",
    source: "PT 71 · S1 · Q19",
    date: "Yesterday",
    pinned: true,
  },
  {
    id: 12,
    tag: "@ Attack Me",
    choice: null,
    body: "When a stimulus says 'A is required for B', and the conclusion says B occurred, what exactly does the flaw answer need to identify — does it need to say A never happened, or just that A wasn't established?",
    source: "PT 71 · S1 · Q19",
    date: "Yesterday",
    pinned: false,
  },
  // ── Mar 15 — PT 70 ──────────────────────────────────────────────────────
  {
    id: 13,
    tag: "@ Instinct",
    choice: "B",
    body: "Went with B immediately — felt like a classic irrelevant comparison trap. Right answer, but couldn't explain it until I reviewed.",
    source: "PT 70 · S1 · Q22",
    date: "Mar 15",
    pinned: false,
  },
  {
    id: 14,
    tag: "@ Principle",
    choice: "Correlation ≠ causation",
    body: "Any time a stimulus observes two things happening together and the conclusion leaps to one causing the other — slow down. The flaw is almost always this, and the correct flaw answer will say exactly 'fails to establish that X causes Y'.",
    source: "PT 70 · S1 · Q22",
    date: "Mar 15",
    pinned: true,
  },
  {
    id: 15,
    tag: "@ Insight",
    choice: "Over-literal reading",
    body: "I eliminated the correct answer because it used 'some' and the stimulus said 'many'. On strengthen/weaken, 'some' is enough — I don't need a perfect quantity match.",
    source: "PT 70 · S3 · Q11",
    date: "Mar 15",
    pinned: false,
  },
  {
    id: 16,
    tag: "@ Principle",
    choice: "Check extreme language",
    body: "'Must', 'always', 'never', 'all' — when these appear in an answer choice for a strengthen question, they're almost always wrong because they go beyond what the argument needs.",
    source: "PT 70 · S3 · Q11",
    date: "Mar 15",
    pinned: true,
  },
];

const TAG_STYLES: Record<TagType, { wrap: string; label: string; dot: string }> = {
  "@ Instinct":  { wrap: "border-secondary bg-secondary",           label: "text-tertiary",   dot: "bg-gray-400" },
  "@ Insight":   { wrap: "border-blue-100 bg-blue-50",              label: "text-blue-600",   dot: "bg-blue-500" },
  "@ Principle": { wrap: "border-violet-100 bg-violet-50",          label: "text-violet-600", dot: "bg-violet-500" },
  "@ Attack Me": { wrap: "border-brand-200 bg-brand-50",            label: "text-brand-600",  dot: "bg-brand-500" },
};

const ALL_TAGS: TagType[] = ["@ Instinct", "@ Insight", "@ Principle", "@ Attack Me"];

/* ─── Note composer options ─────────────────────────────────────────────── */
const COMPOSER_OPTS = [
  { type: "@ Instinct"  as TagType, labelCls: "text-tertiary",   wrapCls: "bg-primary border-secondary",    dot: "bg-gray-400",   desc: "What your gut said",       subtypes: ["Sounded right", "Process of elim.", "Too extreme", "Time pressure"] as string[] },
  { type: "@ Insight"   as TagType, labelCls: "text-blue-600",   wrapCls: "bg-blue-50 border-blue-100",     dot: "bg-blue-400",   desc: "Something you learned",    subtypes: ["Causal link", "Scope / degree", "Conditional logic", "Argument structure"] as string[] },
  { type: "@ Principle" as TagType, labelCls: "text-violet-600", wrapCls: "bg-violet-50 border-violet-100", dot: "bg-violet-400", desc: "A rule to remember",       subtypes: ["Sufficient vs. necessary", "Most seriously weakens", "Contrapositive", "Scope shift"] as string[] },
  { type: "@ Attack Me" as TagType, labelCls: "text-brand-600",  wrapCls: "bg-brand-50 border-brand-200",   dot: "bg-brand-400",  desc: "Open question to address", subtypes: [] as string[] },
];
let _rmuid = 100;

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function RMUPage() {
  const [entries, setEntries] = useState<RMUEntry[]>(INITIAL_ENTRIES);
  const [filterTag, setFilterTag] = useState<TagType | "All">("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  // Note composer
  const [composerOpen,   setComposerOpen]   = useState(false);
  const [composerType,   setComposerType]   = useState<typeof COMPOSER_OPTS[number] | null>(null);
  const [composerSubtype,setComposerSubtype]= useState<string | null>(null);
  const [composerBody,   setComposerBody]   = useState("");
  const [composerSource, setComposerSource] = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  function openComposer() { setComposerOpen(true); setComposerType(null); setComposerSubtype(null); setComposerBody(""); setComposerSource(""); setTimeout(() => composerRef.current?.focus(), 60); }
  function cancelComposer() { setComposerOpen(false); setComposerType(null); setComposerSubtype(null); setComposerBody(""); setComposerSource(""); }
  function submitComposer() {
    if (!composerType) return;
    const newEntry: RMUEntry = { id: _rmuid++, tag: composerType.type, choice: composerSubtype, body: composerBody, source: composerSource || "—", date: "Today", pinned: false };
    setEntries(prev => [newEntry, ...prev]);
    cancelComposer();
  }

  function startEdit(entry: RMUEntry) {
    setEditingId(entry.id);
    setEditBody(entry.body);
  }
  function saveEdit(id: number) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, body: editBody } : e));
    setEditingId(null);
  }
  function deleteEntry(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }
  function togglePin(id: number) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, pinned: !e.pinned } : e));
  }

  const filtered = entries.filter((e) => {
    if (filterTag !== "All" && e.tag !== filterTag) return false;
    if (showPinnedOnly && !e.pinned) return false;
    if (search && !e.body.toLowerCase().includes(search.toLowerCase()) && !e.source.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, RMUEntry[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const tagCounts = ALL_TAGS.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = entries.filter((e) => e.tag === tag).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-primary">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="border-b border-secondary bg-primary sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-8 h-14 flex items-center gap-4">
          <nav className="flex items-center gap-1.5 text-sm text-tertiary">
            <Link href="/the-lounge" className="hover:text-secondary transition-colors">The Lounge</Link>
            <ChevronRight className="size-3.5 text-quaternary" />
            <span className="text-primary font-semibold">RMU Notes</span>
          </nav>
          <div className="flex-1" />
          <span className="text-xs text-quaternary">{entries.length} notes total</span>
          <button onClick={openComposer} className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors">
            <Plus className="size-3.5" />
            Add note
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-8">
        <div className="grid grid-cols-[220px_1fr] gap-8 items-start">

          {/* ── LEFT: filters sidebar ───────────────────────── */}
          <div className="sticky top-20 space-y-6">

            {/* Search */}
            <div className="flex items-center gap-2 rounded-lg border border-secondary bg-secondary px-3 py-2">
              <SearchLg className="size-4 text-quaternary shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="flex-1 bg-transparent text-sm text-primary placeholder:text-placeholder focus:outline-none"
              />
            </div>

            {/* Tag filter */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-quaternary px-1 mb-2">Filter by tag</p>
              <button
                onClick={() => setFilterTag("All")}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  filterTag === "All" ? "bg-gray-900 text-white" : "text-secondary hover:bg-secondary"
                }`}
              >
                <span>All notes</span>
                <span className={`text-[10px] font-bold ${filterTag === "All" ? "text-gray-400" : "text-quaternary"}`}>{entries.length}</span>
              </button>
              {ALL_TAGS.map((tag) => {
                const s = TAG_STYLES[tag];
                const active = filterTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      active ? `${s.wrap} ${s.label} border` : "text-secondary hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${s.dot}`} />
                      <span>{tag}</span>
                    </div>
                    <span className="text-[10px] font-bold text-quaternary">{tagCounts[tag]}</span>
                  </button>
                );
              })}
            </div>

            {/* Pinned filter */}
            <div className="border-t border-secondary pt-4">
              <button
                onClick={() => setShowPinnedOnly((p) => !p)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  showPinnedOnly ? "bg-brand-50 text-brand-600 border border-brand-200" : "text-secondary hover:bg-secondary"
                }`}
              >
                <FilterLines className="size-3.5" />
                Pinned only
              </button>
            </div>

          </div>

          {/* ── RIGHT: note list ─────────────────────────────── */}
          <div className="space-y-8">

            {/* Note composer — shown when "Add note" is clicked */}
            {composerOpen && (
              <div className="rounded-xl border border-secondary bg-primary overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 pt-3.5 pb-3 border-b border-secondary flex-wrap">
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
                <div className="flex items-center gap-3 px-4 pb-3.5 pt-1 border-t border-secondary">
                  <input value={composerSource} onChange={e => setComposerSource(e.target.value)}
                    placeholder="Source (e.g. PT 72 · S2 · Q14)"
                    className="flex-1 text-xs bg-secondary rounded-lg border border-secondary px-3 py-1.5 text-secondary placeholder:text-quaternary focus:outline-none focus:border-brand-300" />
                  <button onClick={cancelComposer} className="text-xs font-semibold text-tertiary hover:text-primary px-2 py-1.5">Cancel</button>
                  <button onClick={submitComposer} disabled={!composerType}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${composerType ? "bg-gray-900 text-white hover:bg-brand-600" : "bg-secondary text-quaternary cursor-not-allowed"}`}>
                    <Plus className="size-3.5" /> Add note
                  </button>
                </div>
              </div>
            )}

            {Object.keys(grouped).length === 0 ? (
              <div className="rounded-xl border border-secondary bg-secondary px-6 py-12 text-center">
                <p className="text-sm text-tertiary">No notes match your filter.</p>
              </div>
            ) : (
              Object.entries(grouped).map(([date, dateEntries]) => (
                <div key={date}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-quaternary mb-3">{date}</p>
                  <div className="space-y-2">
                    {dateEntries.map((entry) => {
                      const s = TAG_STYLES[entry.tag];
                      const isEditing = editingId === entry.id;
                      return (
                        <div key={entry.id} className={`rounded-xl border px-4 py-3 space-y-2 transition-all ${s.wrap} ${entry.pinned ? "ring-1 ring-brand-200" : ""}`}>

                          {/* Header */}
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold uppercase tracking-widest ${s.label}`}>{entry.tag}</span>
                            {entry.choice && (
                              <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${s.wrap} opacity-80`}>
                                {entry.choice}
                              </span>
                            )}
                            <Link
                              href={`/the-lounge/attack/1`}
                              className="ml-1 text-[10px] text-quaternary hover:text-tertiary underline underline-offset-2 transition-colors"
                            >
                              {entry.source}
                            </Link>
                            <div className="ml-auto flex items-center gap-1.5">
                              {/* Pin */}
                              <button
                                onClick={() => togglePin(entry.id)}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                                  entry.pinned ? "text-brand-600 bg-brand-100" : "text-quaternary hover:text-tertiary"
                                }`}
                              >
                                {entry.pinned ? "Pinned" : "Pin"}
                              </button>
                              {/* Edit */}
                              {!isEditing && (
                                <button onClick={() => startEdit(entry)} className="text-quaternary hover:text-secondary transition-colors p-0.5">
                                  <Edit01 className="size-3.5" />
                                </button>
                              )}
                              {/* Delete */}
                              <button onClick={() => deleteEntry(entry.id)} className="text-quaternary hover:text-error-500 transition-colors p-0.5">
                                <X className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Body */}
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                rows={Math.max(2, editBody.split("\n").length + 1)}
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                autoFocus
                                className="w-full resize-none bg-white/60 rounded-lg border border-brand-200 px-3 py-2 text-sm text-primary leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setEditingId(null)} className="text-xs text-tertiary hover:text-secondary px-2 py-1">Cancel</button>
                                <button
                                  onClick={() => saveEdit(entry.id)}
                                  className="flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
                                >
                                  <Check className="size-3" /> Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">{entry.body}</p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center gap-2 pt-1.5 border-t border-black/5">
                            <span className="text-[10px] text-quaternary">{entry.date}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(entry.body)}
                              className="ml-auto flex items-center gap-1 text-[10px] text-quaternary hover:text-tertiary transition-colors"
                            >
                              <Copy01 className="size-3" /> Copy
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
