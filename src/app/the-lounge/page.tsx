"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookmarkAdd,
  ChevronRight,
  X,
  ChevronDown,
  Target01,
  Microphone01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";

/* ─── data ──────────────────────────────────────────────────────────────── */

const ptRooms = [
  {
    id: 1,
    title: "PT 89: Full Flex",
    subtitle: "Strict timing · 3 Sections",
    status: "live" as const,
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMMr9Q0CHyn3nEixsnV4Gg9uPwtqi5aRvxRVinc7YjeYxvVLYtI3Ls0GDh6l5F3-eHOIU2mCI6x5u6Gi0az3-ST6TtfinAMq0TORkNm5Ff8AutYBEg2J-1T9O1ykPyMJ2eZJWRlb38gf6ydJ7kYnl93mOCSokd7PaXhDQryPCLn6CuUG-BmUJ0tuDsKTV0hfl5scb8-3LsSm6oY7U9bycaiKGjpp2GXel6urzI29YG5AiDKK5JLAaU3zKVkqi-wUlBRJAjlK3VVA",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAaDVPO_H9fb7Vi4GNkZxnb1cqxRnKnSjVOlNDMMVLvn5sXtLjh9Zqbou_xsG38pO8QDckuwkJMpS6YB3WZFpF1ISfX_Z00g--ODlj4KI13VQ3tryjZ4zf1cSRcphRQC7u54BcP1zn2N612ze6hl8XRbyqzbUn_RNXIygO91cMJBdfGCsbfjjLa_4dh71oW-_lQnYwvLfTxd8rWkYjKNH8fZc4_Dgz5wLHuWuxd195LVfpa2MnDu04OfbrBG7GKFu2u_lqzOO5t8Q",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnbr_RgeBja1oRPub4d53HJwxc59L88Tixo5xhqrPC7Xtx4uJ4hgvC3vZJ4KOoH6aoHkKkN3FYaOxBMBKsd2Cmhd-YF3dbmVeotH86rG6AwUfYRqEAMXWA44lEIjKfaYAvlbDUPQOldmCjz7M0rNvOJk1D7x-uC1A_r3UbJMOy0hI1tz3JjKduStCSH1u7RVX89OQGtwKNRwNRwRcs1O3B1PMOqtTcsw1CBwUb0gzZKn1qeY_zCa6y3SHXFpQZ-UB5KC8dvVuvYQ",
    ],
    extra: "+4",
    meta: "Starting in 2m",
  },
  {
    id: 2,
    title: "Logic Games Drill",
    subtitle: "Hybrid & Sequencing · Untimed",
    status: "open" as const,
    initials: [{ letters: "AL" }, { letters: "MK" }],
    meta: "3 / 5 Slots",
  },
  {
    id: 3,
    title: "Weekend Warrior PT",
    subtitle: "PT 90–92 Review · 4 Sections",
    status: "scheduled" as const,
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMMr9Q0CHyn3nEixsnV4Gg9uPwtqi5aRvxRVinc7YjeYxvVLYtI3Ls0GDh6l5F3-eHOIU2mCI6x5u6Gi0az3-ST6TtfinAMq0TORkNm5Ff8AutYBEg2J-1T9O1ykPyMJ2eZJWRlb38gf6ydJ7kYnl93mOCSokd7PaXhDQryPCLn6CuUG-BmUJ0tuDsKTV0hfl5scb8-3LsSm6oY7U9bycaiKGjpp2GXel6urzI29YG5AiDKK5JLAaU3zKVkqi-wUlBRJAjlK3VVA",
    ],
    extra: "+12",
    meta: "Sat 10:00 AM",
  },
  {
    id: 4,
    title: "LR Speed Run",
    subtitle: "LR I + II · Strict timing",
    status: "open" as const,
    initials: [{ letters: "RJ" }, { letters: "PP" }],
    meta: "2 / 5 Slots",
  },
];

const attackRequests = [
  {
    id: 1,
    status: "open" as const,
    ref: "PT 72 · S2 · Q14",
    type: "LR · Flaw",
    question: "Why is (B) wrong? I keep reading it as circular but the explanation says otherwise.",
    replies: 2,
    avatarSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnbr_RgeBja1oRPub4d53HJwxc59L88Tixo5xhqrPC7Xtx4uJ4hgvC3vZJ4KOoH6aoHkKkN3FYaOxBMBKsd2Cmhd-YF3dbmVeotH86rG6AwUfYRqEAMXWA44lEIjKfaYAvlbDUPQOldmCjz7M0rNvOJk1D7x-uC1A_r3UbJMOy0hI1tz3JjKduStCSH1u7RVX89OQGtwKNRwNRwRcs1O3B1PMOqtTcsw1CBwUb0gzZKn1qeY_zCa6y3SHXFpQZ-UB5KC8dvVuvYQ",
    author: "Sarah M.",
    ago: "3m ago",
    requesterOnline: true,
    voiceAvailable: true,   // online + chose voice → top
  },
  {
    id: 2,
    status: "open" as const,
    ref: "PT 88 · S3 · Q7",
    type: "LG · Hybrid",
    question: "The 'if A, not B' rule is throwing off my whole board. Can someone diagram this?",
    replies: 0,
    initials: "JD",
    author: "John D.",
    ago: "12m ago",
    requesterOnline: true,
    voiceAvailable: false,  // online but chose text-only → bottom
  },
  {
    id: 3,
    status: "resolved" as const,
    ref: "PT 85 · S4 · Q22",
    type: "RC · Science",
    question: "Is the author arguing for the new theory or just presenting it neutral?",
    replies: 5,
    avatarSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaDVPO_H9fb7Vi4GNkZxnb1cqxRnKnSjVOlNDMMVLvn5sXtLjh9Zqbou_xsG38pO8QDckuwkJMpS6YB3WZFpF1ISfX_Z00g--ODlj4KI13VQ3tryjZ4zf1cSRcphRQC7u54BcP1zn2N612ze6hl8XRbyqzbUn_RNXIygO91cMJBdfGCsbfjjLa_4dh71oW-_lQnYwvLfTxd8rWkYjKNH8fZc4_Dgz5wLHuWuxd195LVfpa2MnDu04OfbrBG7GKFu2u_lqzOO5t8Q",
    author: "Alex K.",
    ago: "1h ago",
    requesterOnline: false,
    voiceAvailable: false,  // offline + text-only → bottom
  },
];

const attackMeLive = [
  {
    id: 1,
    ref: "PT 72 · S2 · Q14",
    type: "LR · Flaw",
    question: "Why is (B) circular reasoning?",
    author: "Sarah M.",
    avatarSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnbr_RgeBja1oRPub4d53HJwxc59L88Tixo5xhqrPC7Xtx4uJ4hgvC3vZJ4KOoH6aoHkKkN3FYaOxBMBKsd2Cmhd-YF3dbmVeotH86rG6AwUfYRqEAMXWA44lEIjKfaYAvlbDUPQOldmCjz7M0rNvOJk1D7x-uC1A_r3UbJMOy0hI1tz3JjKduStCSH1u7RVX89OQGtwKNRwNRwRcs1O3B1PMOqtTcsw1CBwUb0gzZKn1qeY_zCa6y3SHXFpQZ-UB5KC8dvVuvYQ",
    status: "waiting" as const,
    requesterOnline: true,
    voiceAvailable: true,   // can do voice → top
  },
  {
    id: 2,
    ref: "PT 88 · S1 · Q3",
    type: "LR · NA",
    question: "Can't figure out the gap between premise and conclusion here.",
    author: "James L.",
    initials: "JL",
    status: "live" as const,
    attacker: "Alex K.",
    attackerSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaDVPO_H9fb7Vi4GNkZxnb1cqxRnKnSjVOlNDMMVLvn5sXtLjh9Zqbou_xsG38pO8QDckuwkJMpS6YB3WZFpF1ISfX_Z00g--ODlj4KI13VQ3tryjZ4zf1cSRcphRQC7u54BcP1zn2N612ze6hl8XRbyqzbUn_RNXIygO91cMJBdfGCsbfjjLa_4dh71oW-_lQnYwvLfTxd8rWkYjKNH8fZc4_Dgz5wLHuWuxd195LVfpa2MnDu04OfbrBG7GKFu2u_lqzOO5t8Q",
    requesterOnline: true,
    voiceAvailable: true,   // live voice session → top
  },
  {
    id: 3,
    ref: "PT 85 · S2 · Q18",
    type: "LR · SA",
    question: "What assumption bridges the gap in this sufficient assumption question?",
    author: "Amy K.",
    initials: "AK",
    status: "waiting" as const,
    requesterOnline: true,
    voiceAvailable: false,  // online but text-only → bottom
  },
];

const strategies = [
  {
    id: 1,
    category: "Logical Reasoning",
    title: "Necessary Assumption Negation Test",
    body: "How to properly negate conditional statements to verify necessity.",
    tags: ["Advanced"],
  },
  {
    id: 2,
    category: "Reading Comp",
    title: "Tackling Science Passages",
    body: "Focus on the relationship between phenomena and hypothesis, not the jargon.",
    tags: ["Structure"],
  },
  {
    id: 3,
    category: "Logic Games",
    title: "Grouping: In/Out Selection",
    body: "Setting up the Anti-Group and managing conditional rules in selection games.",
    tags: ["Drill"],
  },
];

/* ─── helpers ───────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: "live" | "open" | "scheduled" }) {
  if (status === "live")
    return <BadgeWithDot type="pill-color" color="success" size="sm">Live</BadgeWithDot>;
  if (status === "scheduled")
    return <Badge type="pill-color" color="blue" size="sm">Scheduled</Badge>;
  return <Badge type="pill-color" color="gray" size="sm">Open</Badge>;
}

function Carousel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="scrollbar-hide flex snap-x gap-4 overflow-x-auto pb-1">
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16"
        style={{ background: "linear-gradient(to left, var(--color-bg-primary, #fff), transparent)" }}
      />
    </div>
  );
}

/* ─── Modal ─────────────────────────────────────────────────────────────── */
function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [activity, setActivity] = useState("full-pt");
  const [roomType, setRoomType] = useState("instant");
  const [maxPlayers, setMaxPlayers] = useState("3");
  const [timeLimit, setTimeLimit] = useState("official");
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-primary shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-secondary px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100">
              <Target01 className="size-5 text-brand-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-primary">Create a PT Room</p>
              <p className="text-sm text-tertiary">Set up a live practice room for your peers.</p>
            </div>
          </div>
          <button onClick={onClose} className="flex size-9 items-center justify-center rounded-lg text-quaternary hover:bg-secondary transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-secondary">Activity</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {[["full-pt","Full PT"],["playlist","Playlist"],["playlist-plus","Playlist + Activity"],["sections","Section(s)"]].map(([val, label]) => (
                <label key={val} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-sm font-medium transition-colors ${activity === val ? "border-brand-600 bg-brand-50 text-brand-700" : "border-secondary text-secondary hover:bg-secondary"}`}>
                  <input type="radio" name="activity" value={val} checked={activity === val} onChange={() => setActivity(val)} className="accent-brand-600" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary">Room Title</label>
            <input type="text" placeholder="e.g. PT 90 Full Run — Strict Timing" className="w-full rounded-lg border border-secondary bg-primary px-3.5 py-2.5 text-sm text-primary placeholder:text-placeholder shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary">Short Description</label>
            <input type="text" placeholder="One sentence about what you're doing" className="w-full rounded-lg border border-secondary bg-primary px-3.5 py-2.5 text-sm text-primary placeholder:text-placeholder shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
          </div>

          <div>
            <button type="button" onClick={() => setShowDetails(!showDetails)} className="flex w-full items-center justify-between text-sm font-medium text-secondary mb-1.5">
              <span>Details <span className="font-normal text-tertiary">(optional, max 140 chars)</span></span>
              <ChevronDown className={`size-4 text-quaternary transition-transform ${showDetails ? "rotate-180" : ""}`} />
            </button>
            {showDetails && (
              <textarea maxLength={140} placeholder="Any extra context — difficulty level, focus area, etc." rows={3} className="w-full resize-none rounded-lg border border-secondary bg-primary px-3.5 py-2.5 text-sm text-primary placeholder:text-placeholder shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            )}
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-secondary">Start Time</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {[["instant","Instant Room","Go live now, wait for others"],["scheduled","Scheduled Room","Set a time in advance"]].map(([val, label, sub]) => (
                <label key={val} className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors ${roomType === val ? "border-brand-600 bg-brand-50" : "border-secondary hover:bg-secondary"}`}>
                  <input type="radio" name="room-type" value={val} checked={roomType === val} onChange={() => setRoomType(val)} className="mt-0.5 accent-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-primary">{label}</p>
                    <p className="text-xs text-tertiary">{sub}</p>
                  </div>
                </label>
              ))}
            </div>
            {roomType === "scheduled" && (
              <input type="datetime-local" className="mt-2.5 w-full rounded-lg border border-secondary bg-primary px-3.5 py-2.5 text-sm text-primary shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            )}
          </fieldset>

          <div>
            <p className="mb-1.5 text-sm font-medium text-secondary">Max Players <span className="font-normal text-tertiary">(1–5)</span></p>
            <div className="flex gap-2">
              {["1","2","3","4","5"].map((n) => (
                <label key={n} className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-2.5 text-sm font-semibold transition-colors ${maxPlayers === n ? "border-brand-600 bg-brand-50 text-brand-700" : "border-secondary text-secondary hover:bg-secondary"}`}>
                  <input type="radio" name="max-players" value={n} checked={maxPlayers === n} onChange={() => setMaxPlayers(n)} className="sr-only" />
                  {n}
                </label>
              ))}
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-secondary">Time Limit</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {[["official","Official Timing","Standard LSAT time limits"],["custom","Custom","Set your own duration"]].map(([val, label, sub]) => (
                <label key={val} className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors ${timeLimit === val ? "border-brand-600 bg-brand-50" : "border-secondary hover:bg-secondary"}`}>
                  <input type="radio" name="time-limit" value={val} checked={timeLimit === val} onChange={() => setTimeLimit(val)} className="mt-0.5 accent-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-primary">{label}</p>
                    <p className="text-xs text-tertiary">{sub}</p>
                  </div>
                </label>
              ))}
            </div>
            {timeLimit === "custom" && (
              <div className="mt-2.5 flex items-center gap-2">
                <input type="number" min={1} max={999} placeholder="35" className="w-24 rounded-lg border border-secondary bg-primary px-3.5 py-2.5 text-sm text-primary shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
                <span className="text-sm text-tertiary">minutes per section</span>
              </div>
            )}
          </fieldset>
        </div>

        <div className="flex gap-3 border-t border-secondary px-6 py-4">
          <Button color="secondary" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button color="primary" size="md" className="flex-1" iconTrailing={ChevronRight} onClick={() => router.push("/the-lounge/room/1?role=host")}>Create Room</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function TheLoungeHub() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("attack");
  const [activeRoomTab, setActiveRoomTab] = useState<"pt" | "attack-me">("pt");

  return (
    <div className="min-h-screen bg-primary">
      <main className="mx-auto max-w-5xl px-8 pb-28">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="pt-12 pb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-quaternary mb-2">
            The Lounge
          </p>
          <h1 className="text-display-sm font-semibold text-primary tracking-tight">
            Practice Together.
          </h1>
        </div>

        {/* ══════════════════════════════════════════════════════════
            PT ROOM HERO — restrained dark banner
        ══════════════════════════════════════════════════════════ */}
        <div className="mb-12 rounded-2xl bg-gray-900 px-8 py-8 flex items-center justify-between gap-8">
          {/* Left: just the essentials */}
          <div className="flex-1">
            <BadgeWithDot type="pill-color" color="success" size="sm" className="mb-4">
              4 rooms active
            </BadgeWithDot>
            <h2 className="text-xl font-semibold text-white mb-2 leading-snug">
              Take a full PT with your study group.
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-sm leading-relaxed">
              Shared timer, live voice debrief, and a full results breakdown — all in one room.
            </p>
            <div className="flex gap-3">
              <Button color="primary" size="sm" iconLeading={Plus} onClick={() => setShowModal(true)}>
                Create Room
              </Button>
              <Button color="secondary" size="sm" iconTrailing={ChevronRight}>
                Browse All
              </Button>
            </div>
          </div>

          {/* Right: one featured live room */}
          <Link href="/the-lounge/room/1" className="shrink-0 w-64 block">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.08] transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <BadgeWithDot type="pill-color" color="success" size="sm">Live now</BadgeWithDot>
              </div>
              <p className="text-sm font-semibold text-white mb-0.5">PT 89: Full Flex</p>
              <p className="text-xs text-gray-400 mb-4">Strict timing · 3 Sections</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {ptRooms[0].avatars?.slice(0, 3).map((src, i) => (
                    <Avatar key={i} src={src} size="xs" contrastBorder />
                  ))}
                  <Avatar initials="+4" size="xs" contrastBorder className="bg-gray-700!" />
                </div>
                <span className="text-xs text-success-400 font-medium">Starting in 2m</span>
              </div>
            </div>
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════════
            ACTIVE ROOMS — PT Rooms / Attack Me tabs
        ══════════════════════════════════════════════════════════ */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-secondary bg-secondary p-1">
              {([
                { id: "pt",        label: "PT Rooms" },
                { id: "attack-me", label: "Attack Me" },
              ] as const).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveRoomTab(id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeRoomTab === id
                      ? "bg-primary text-primary shadow-xs"
                      : "text-tertiary hover:text-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button color="tertiary" size="sm" iconTrailing={ChevronRight} className="text-brand-600!">
              View all
            </Button>
          </div>

          {/* PT Rooms carousel */}
          {activeRoomTab === "pt" && (
            <Carousel>
              {ptRooms.map((room) => (
                <Link key={room.id} href={`/the-lounge/room/${room.id}`}>
                  <div className="min-w-[260px] shrink-0 snap-start cursor-pointer rounded-xl border border-secondary bg-primary p-5 hover:border-brand-200 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <StatusBadge status={room.status} />
                    </div>
                    <p className="text-sm font-semibold text-primary mb-0.5">{room.title}</p>
                    <p className="text-xs text-tertiary mb-4">{room.subtitle}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {room.avatars?.slice(0, 3).map((src, i) => <Avatar key={i} src={src} size="xs" contrastBorder />)}
                        {room.initials?.map((a, i) => <Avatar key={i} initials={a.letters} size="xs" contrastBorder />)}
                        {room.extra && <Avatar initials={room.extra} size="xs" contrastBorder className="bg-secondary!" />}
                      </div>
                      <span className="text-xs text-tertiary">{room.meta}</span>
                    </div>
                  </div>
                </Link>
              ))}
              <div
                onClick={() => setShowModal(true)}
                className="flex min-w-[180px] shrink-0 snap-start cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-secondary px-6 py-8 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-brand-50">
                  <Plus className="size-4 text-brand-600" />
                </div>
                <p className="text-sm font-medium text-tertiary">New Room</p>
              </div>
            </Carousel>
          )}

          {/* Attack Me live sessions carousel */}
          {activeRoomTab === "attack-me" && (
            <Carousel>
              {[...attackMeLive].sort((a, b) => (b.voiceAvailable ? 1 : 0) - (a.voiceAvailable ? 1 : 0)).map((session) => (
                <Link key={session.id} href={`/the-lounge/attack/${session.id}`}>
                  <div className={`min-w-[280px] shrink-0 snap-start cursor-pointer rounded-xl border border-secondary bg-primary p-5 hover:border-brand-200 hover:shadow-sm transition-all ${!session.voiceAvailable ? "opacity-60" : ""}`}>
                    {/* Status row */}
                    <div className="flex items-center justify-between mb-3">
                      {session.status === "live"
                        ? <BadgeWithDot type="pill-color" color="success" size="sm">Live · In Session</BadgeWithDot>
                        : <BadgeWithDot type="pill-color" color="warning" size="sm">Waiting for Attacker</BadgeWithDot>
                      }
                      {/* Mode chip */}
                      {session.voiceAvailable
                        ? <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-600">
                            <Microphone01 className="size-3" /> Voice
                          </span>
                        : <span className="text-[10px] font-medium text-quaternary">Text only</span>
                      }
                    </div>
                    {/* Question ref */}
                    <p className="text-xs font-semibold text-brand-600 mb-1">{session.ref}</p>
                    <p className="text-xs text-tertiary mb-2">{session.type}</p>
                    {/* Question snippet */}
                    <p className="text-sm font-medium text-primary leading-snug mb-4 line-clamp-2">
                      "{session.question}"
                    </p>
                    {/* People */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          {session.avatarSrc
                            ? <Avatar src={session.avatarSrc} size="xs" contrastBorder />
                            : <Avatar initials={"initials" in session ? session.initials : "?"} size="xs" contrastBorder />
                          }
                          <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-primary ${session.requesterOnline ? "bg-success-500" : "bg-gray-300"}`} />
                        </div>
                        <span className="text-xs text-tertiary">
                          {session.status === "live"
                            ? `${session.author} + ${"attacker" in session ? session.attacker : ""}`
                            : session.author
                          }
                        </span>
                      </div>
                      {session.status === "waiting" && session.voiceAvailable && (
                        <span className="text-xs font-semibold text-brand-600">Attack →</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </Carousel>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════════
            COMMUNITY — tabs + content
        ══════════════════════════════════════════════════════════ */}
        <section>
          {/* Tabs */}
          <div className="border-b border-secondary mb-7">
            <nav className="flex gap-6">
              {[
                { id: "attack", label: "Attack Requests" },
                { id: "strategies", label: "Strategies" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-brand-600 text-brand-600"
                      : "border-transparent text-tertiary hover:text-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Attack Requests */}
          {activeTab === "attack" && (
            <Carousel>
              {[...attackRequests]
                .sort((a, b) => (b.voiceAvailable ? 1 : 0) - (a.voiceAvailable ? 1 : 0))
                .map((req) => (
                <Link key={req.id} href={`/the-lounge/attack/${req.id}`}>
                  <div className={`flex min-w-[300px] shrink-0 snap-start cursor-pointer flex-col rounded-xl border border-secondary bg-primary p-5 hover:border-brand-200 hover:shadow-sm transition-all ${
                    !req.voiceAvailable ? "opacity-60" : ""
                  }`}>
                    {/* Ref + status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        {/* Voice/text mode indicator dot */}
                        <span className={`size-1.5 rounded-full shrink-0 ${req.voiceAvailable ? "bg-brand-500" : "bg-gray-300"}`} />
                        <p className="text-xs font-semibold text-brand-600">{req.ref}</p>
                      </div>
                      {req.status === "resolved"
                        ? <Badge type="pill-color" color="success" size="sm">Resolved</Badge>
                        : <BadgeWithDot type="pill-color" color="warning" size="sm">Open</BadgeWithDot>
                      }
                    </div>
                    {/* Type tag */}
                    <p className="text-xs text-tertiary mb-2">{req.type}</p>
                    {/* Question */}
                    <p className="text-sm font-medium text-primary leading-snug mb-4 flex-1 line-clamp-2">
                      "{req.question}"
                    </p>
                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          {req.avatarSrc
                            ? <Avatar src={req.avatarSrc} size="xs" />
                            : <Avatar initials={req.initials} size="xs" />
                          }
                          <span className={`absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-primary ${req.requesterOnline ? "bg-success-500" : "bg-gray-300"}`} />
                        </div>
                        <span className="text-xs text-tertiary">{req.author}</span>
                        <span className="text-border">·</span>
                        {req.voiceAvailable
                          ? <span className="flex items-center gap-0.5 text-xs font-medium text-brand-600">
                              <Microphone01 className="size-3" /> Voice
                            </span>
                          : <span className="text-xs font-medium text-quaternary">Text only</span>
                        }
                      </div>
                      <span className="text-xs text-tertiary">{req.replies} {req.replies === 1 ? "reply" : "replies"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </Carousel>
          )}

          {/* Strategies */}
          {activeTab === "strategies" && (
            <Carousel>
              {strategies.map((s) => (
                <div
                  key={s.id}
                  className="flex min-w-[300px] shrink-0 snap-start cursor-pointer flex-col rounded-xl border border-secondary bg-primary p-5 hover:border-brand-200 hover:shadow-sm transition-all"
                >
                  <p className="text-xs font-semibold text-brand-600 mb-2">{s.category}</p>
                  <p className="text-sm font-semibold text-primary mb-1.5 flex-1">{s.title}</p>
                  <p className="text-xs text-tertiary leading-relaxed mb-4 line-clamp-3">{s.body}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {s.tags.map((t) => (
                        <Badge key={t} type="pill-color" color="brand" size="sm">{t}</Badge>
                      ))}
                    </div>
                    <button className="text-quaternary hover:text-brand-600 transition-colors">
                      <BookmarkAdd className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </Carousel>
          )}
        </section>

      </main>

      {showModal && <CreateRoomModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
