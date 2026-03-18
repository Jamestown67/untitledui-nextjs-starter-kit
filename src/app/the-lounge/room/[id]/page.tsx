"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send01,
  Minus,
  UserPlus01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";

const AVATARS = {
  sarah: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMMr9Q0CHyn3nEixsnV4Gg9uPwtqi5aRvxRVinc7YjeYxvVLYtI3Ls0GDh6l5F3-eHOIU2mCI6x5u6Gi0az3-ST6TtfinAMq0TORkNm5Ff8AutYBEg2J-1T9O1ykPyMJ2eZJWRlb38gf6ydJ7kYnl93mOCSokd7PaXhDQryPCLn6CuUG-BmUJ0tuDsKTV0hfl5scb8-3LsSm6oY7U9bycaiKGjpp2GXel6urzI29YG5AiDKK5JLAaU3zKVkqi-wUlBRJAjlK3VVA",
  alex: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaDVPO_H9fb7Vi4GNkZxnb1cqxRnKnSjVOlNDMMVLvn5sXtLjh9Zqbou_xsG38pO8QDckuwkJMpS6YB3WZFpF1ISfX_Z00g--ODlj4KI13VQ3tryjZ4zf1cSRcphRQC7u54BcP1zn2N612ze6hl8XRbyqzbUn_RNXIygO91cMJBdfGCsbfjjLa_4dh71oW-_lQnYwvLfTxd8rWkYjKNH8fZc4_Dgz5wLHuWuxd195LVfpa2MnDu04OfbrBG7GKFu2u_lqzOO5t8Q",
};

type MemberStatus = "waiting" | "ready";
type ChatMsg = { speaker: string; text: string; isSystem?: boolean; isMe?: boolean };

export default function RoomDetailPage() {
  const searchParams = useSearchParams();
  const [isHost, setIsHost] = useState(searchParams.get("role") === "host");
  const [joined, setJoined] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { speaker: "Alex K.", text: "Anyone want to do a quick warmup before we start?" },
    { speaker: "Sarah M.", text: "Nah let's just go when everyone's ready" },
  ]);

  // Host is always "in" the room; member needs to join first
  const effectivelyJoined = isHost || joined;
  const readyCount = 1 + (isReady ? 1 : 0); // Alex always ready + me

  function handleJoin() {
    setJoined(true);
    addMsg({ speaker: "System", text: "You joined the room.", isSystem: true });
  }

  function addMsg(msg: ChatMsg) {
    setMessages((prev) => [...prev, msg]);
  }

  function sendChat() {
    const val = chatInput.trim();
    if (!val) return;
    addMsg({ speaker: "You", text: val, isMe: true });
    setChatInput("");
  }

  function toggleReady() {
    const next = !isReady;
    setIsReady(next);
    addMsg({
      speaker: "System",
      text: next ? "You are now Ready." : "You set yourself back to Waiting.",
      isSystem: true,
    });
  }

  const allReady = readyCount >= 2;

  return (
    <div className="min-h-screen bg-primary pb-32">

      {/* ── Prototype view switcher ───────────────────────────── */}
      <div className="border-b border-secondary bg-secondary/50">
        <div className="mx-auto max-w-3xl px-6 py-2 flex items-center gap-3">
          <span className="text-xs text-quaternary font-medium">Prototype view:</span>
          <div className="flex rounded-lg border border-secondary overflow-hidden">
            {[
              { id: false, label: "Member" },
              { id: true,  label: "Host" },
            ].map(({ id, label }) => (
              <button
                key={String(id)}
                onClick={() => { setIsHost(id); setJoined(false); setIsReady(false); }}
                className={`px-3 py-1 text-xs font-semibold transition-colors border-r border-secondary last:border-r-0 ${
                  isHost === id ? "bg-gray-900 text-white" : "bg-primary text-secondary hover:bg-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-quaternary">
            {isHost ? "You created this room — you can start when everyone's ready." : "You're browsing as a member."}
          </span>
        </div>
      </div>

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-6">
        <nav className="flex items-center gap-1.5 text-sm text-tertiary">
          <Link href="/the-lounge" className="hover:text-secondary transition-colors">
            The Lounge
          </Link>
          <ChevronRight className="size-3.5 text-quaternary" />
          <span className="text-secondary">PT Rooms</span>
          <ChevronRight className="size-3.5 text-quaternary" />
          <span className="text-primary font-medium">PT 89: Full Flex</span>
        </nav>
      </div>

      <main className="mx-auto max-w-3xl px-6">

        {/* ── Room header ───────────────────────────────────── */}
        <div className="pb-7 border-b border-secondary">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <BadgeWithDot type="pill-color" color="success" size="sm">Open</BadgeWithDot>
            <Badge type="pill-color" color="gray" size="sm">Instant Room</Badge>
          </div>
          <h1 className="text-display-sm font-semibold text-primary tracking-tight mb-2">
            PT 89: Full Flex
          </h1>
          <p className="text-md text-secondary leading-relaxed">
            Full PT under strict timing. Looking for 3 people serious about drilling the whole
            thing start to finish. No breaks.
          </p>

          {/* Expandable details */}
          <div className="mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 text-sm text-tertiary hover:text-secondary transition-colors"
            >
              {showDetails ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              {showDetails ? "Less details" : "More details"}
            </button>
            {showDetails && (
              <div className="mt-3 rounded-xl border border-secondary bg-secondary px-4 py-3">
                <p className="text-sm text-secondary leading-relaxed">
                  Aiming for a full 4-section PT with no breaks between sections. Strict 35-min
                  per section. If you're not ready to commit to the full thing, this room probably
                  isn't for you. Join if you're targeting 170+.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Room meta ─────────────────────────────────────── */}
        <div className="py-6 border-b border-secondary grid grid-cols-3 gap-6">
          {[
            { label: "Activity", value: "Full PT", sub: "PT 89 · 4 Sections" },
            { label: "Time Limit", value: "Official Timing", sub: "35 min / section" },
            { label: "Players", value: "2 / 4 joined", sub: "2 spots left" },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-xs font-semibold text-quaternary uppercase tracking-widest mb-1.5">
                {m.label}
              </p>
              <p className="text-sm font-semibold text-primary">{m.value}</p>
              <p className="text-xs text-tertiary mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Members ───────────────────────────────────────── */}
        <div className={`py-7 ${isHost ? "" : "border-b border-secondary"}`}>
          <h2 className="text-lg font-semibold text-primary mb-5">Who's in the room</h2>
          <div className="space-y-3">

            {/* Host row — "You (Host)" when isHost, otherwise Sarah */}
            {isHost ? (
              <div className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
                <Avatar initials="Me" size="md" className="bg-brand-100! text-brand-700!" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-primary">You</p>
                    <Badge type="pill-color" color="brand" size="sm">Host</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-tertiary">
                    <span>Avg Score <span className="text-secondary font-semibold">163</span></span>
                    <span className="text-border">·</span>
                    <span>Ability <span className="text-secondary font-semibold">168</span></span>
                  </div>
                </div>
                <BadgeWithDot type="pill-color" color="success" size="sm">Ready</BadgeWithDot>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-secondary bg-primary p-4">
                <Avatar src={AVATARS.sarah} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-primary">Sarah M.</p>
                    <Badge type="pill-color" color="gray" size="sm">Host</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-tertiary">
                    <span>Avg Score <span className="text-secondary font-semibold">163</span></span>
                    <span className="text-border">·</span>
                    <span>Ability <span className="text-secondary font-semibold">168</span></span>
                  </div>
                </div>
                <BadgeWithDot type="pill-color" color="warning" size="sm">Waiting</BadgeWithDot>
              </div>
            )}

            {/* Alex — ready */}
            <div className="flex items-center gap-4 rounded-xl border border-secondary bg-primary p-4">
              <Avatar src={AVATARS.alex} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary mb-0.5">Alex K.</p>
                <div className="flex items-center gap-3 text-xs text-tertiary">
                  <span>Avg Score <span className="text-secondary font-semibold">160</span></span>
                  <span className="text-border">·</span>
                  <span>Ability <span className="text-secondary font-semibold">165</span></span>
                </div>
              </div>
              <BadgeWithDot type="pill-color" color="success" size="sm">Ready</BadgeWithDot>
            </div>

            {/* Empty slots */}
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-dashed border-secondary p-4"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                  <UserPlus01 className="size-5 text-quaternary" />
                </div>
                <p className="text-sm text-quaternary">Waiting for someone to join…</p>
              </div>
            ))}
          </div>

          {/* Room avg */}
          <div className="mt-5 flex items-center gap-6 rounded-xl border border-secondary bg-secondary px-4 py-3">
            <span className="text-xs text-tertiary">Room average</span>
            <div className="flex items-center gap-4 text-xs">
              <span>Score <span className="font-semibold text-primary">161.5</span></span>
              <span className="text-border">·</span>
              <span>Ability <span className="font-semibold text-primary">166.5</span></span>
            </div>
          </div>
        </div>

        {/* ── Host Controls ─────────────────────────────────── */}
        {isHost && (
          <div className="py-7 border-t border-secondary">

            {/* Section header */}
            <h2 className="text-lg font-semibold text-primary mb-1">Ready to start?</h2>
            <p className="text-sm text-tertiary mb-6">
              You can start as soon as all members mark themselves ready.
            </p>

            {/* Exam preview card */}
            <div className="rounded-xl border border-secondary bg-secondary p-5 mb-6">
              <p className="text-xs font-semibold text-quaternary uppercase tracking-widest mb-3">What you're starting</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Exam", value: "PT 89" },
                  { label: "Format", value: "4 Sections" },
                  { label: "Timing", value: "Official · 35 min" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-tertiary mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-tertiary">
              Not all members are ready — you can still start and they'll join when ready.
            </p>
          </div>
        )}

      </main>

      {/* ── Sticky host bar ───────────────────────────────────── */}
      {isHost && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-secondary bg-primary z-30">
          <div className="mx-auto max-w-3xl px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                <Avatar initials="Me" size="xs" contrastBorder className="bg-brand-100! text-brand-700!" />
                <Avatar src={AVATARS.alex} size="xs" contrastBorder />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">2 / 4 ready</p>
                <p className="text-xs text-tertiary">Waiting for 2 more members</p>
              </div>
            </div>
            <Link href="/the-lounge/room/1/exam">
              <Button color="primary" size="md" iconTrailing={ChevronRight}>
                Start Room
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Sticky join bar (before joining, member only) ─────── */}
      {!isHost && !joined && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-secondary bg-primary z-30">
          <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">PT 89: Full Flex</p>
              <p className="text-xs text-tertiary">2 / 4 joined · Instant Room · Official Timing</p>
            </div>
            <Button color="primary" size="md" iconTrailing={ChevronRight} onClick={handleJoin}>
              Join Room
            </Button>
          </div>
        </div>
      )}

      {/* ── Collapsed bubble ─────────────────────────────────── */}
      {effectivelyJoined && !bubbleOpen && (
        <button
          onClick={() => setBubbleOpen(true)}
          className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-gray-900 shadow-lg flex items-center justify-center hover:bg-brand-600 transition-colors"
        >
          <div className="flex -space-x-1.5">
            <Avatar src={AVATARS.sarah} size="xxs" contrastBorder />
            <Avatar src={AVATARS.alex} size="xxs" contrastBorder />
            <Avatar initials="Me" size="xxs" contrastBorder className="bg-brand-100! text-brand-700!" />
          </div>
        </button>
      )}

      {/* ── Expanded bubble panel ────────────────────────────── */}
      {effectivelyJoined && bubbleOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-secondary bg-primary shadow-2xl overflow-hidden">

          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-secondary px-4 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <BadgeWithDot type="pill-color" color="success" size="sm">PT 89: Full Flex</BadgeWithDot>
            </div>
            <button
              onClick={() => setBubbleOpen(false)}
              className="flex size-7 items-center justify-center rounded-lg text-quaternary hover:bg-secondary hover:text-tertiary transition-colors"
            >
              <Minus className="size-4" />
            </button>
          </div>

          {/* Members */}
          <div className="space-y-2 border-b border-secondary px-4 py-3">
            {/* Host = "You" when isHost, otherwise Sarah */}
            {!isHost && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar src={AVATARS.sarah} size="xs" />
                  <p className="text-xs font-medium text-primary">
                    Sarah M. <span className="text-tertiary font-normal">(Host)</span>
                  </p>
                </div>
                <BadgeWithDot type="pill-color" color="warning" size="sm">Waiting</BadgeWithDot>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar src={AVATARS.alex} size="xs" />
                <p className="text-xs font-medium text-primary">Alex K.</p>
              </div>
              <BadgeWithDot type="pill-color" color="success" size="sm">Ready</BadgeWithDot>
            </div>

            {/* Me row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar initials="Me" size="xs" className="bg-brand-100! text-brand-700!" />
                <p className="text-xs font-medium text-primary">
                  You {isHost && <span className="text-brand-600 font-semibold">(Host)</span>}
                </p>
              </div>
              <button
                onClick={toggleReady}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  isReady
                    ? "border-success-200 bg-success-50 text-success-700"
                    : "border-warning-200 bg-warning-50 text-warning-700 hover:border-success-200 hover:bg-success-50 hover:text-success-700"
                }`}
              >
                <span className={`size-1.5 rounded-full inline-block ${isReady ? "bg-success-500" : "bg-warning-500"}`} />
                {isReady ? "Ready ✓" : "Waiting — tap to Ready"}
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="scrollbar-hide max-h-32 space-y-1.5 overflow-y-auto border-b border-secondary px-4 py-3">
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.isSystem ? (
                  <p className="text-[10px] text-tertiary italic">{msg.text}</p>
                ) : (
                  <>
                    <span className={`text-[10px] font-semibold ${msg.isMe ? "text-brand-600" : "text-secondary"}`}>
                      {msg.speaker}
                    </span>
                    <p className="text-xs text-secondary mt-0.5">{msg.text}</p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            <input
              type="text"
              placeholder="Say something…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              className="flex-1 rounded-lg border border-secondary bg-secondary px-3 py-1.5 text-xs text-primary placeholder:text-placeholder focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
            />
            <button
              onClick={sendChat}
              className="flex size-8 items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-brand-600 transition-colors"
            >
              <Send01 className="size-4" />
            </button>
          </div>

          {/* Start button — member only; host has it in main page */}
          {!isHost && (
            <div className="px-3 pb-3">
              <Link href="/the-lounge/room/1/exam">
                <button
                  disabled={!allReady}
                  className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    allReady
                      ? "bg-gray-900 text-white hover:bg-brand-600 cursor-pointer"
                      : "bg-gray-900/20 text-white/40 cursor-not-allowed"
                  }`}
                >
                  {allReady ? "Start Room →" : "Waiting for host to start…"}
                </button>
              </Link>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
