import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarClock,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Construction,
  Database,
  Eye,
  FileSearch2,
  FileText,
  History,
  Landmark,
  ListChecks,
  LockKeyhole,
  MapPinned,
  Menu,
  MoreHorizontal,
  Radar,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Horizon = "today" | "30d" | "90d" | "180d";
type EvidenceId = "cctv" | "witness" | "medical" | "site" | "telematics";
type Accent = "coral" | "amber" | "blue" | "violet" | "teal";

type EvidenceItem = {
  id: EvidenceId;
  title: string;
  type: string;
  icon: typeof Camera;
  accent: Accent;
  source: string;
  reason: string;
  unknown: string;
  action: string;
  status: Record<Horizon, string>;
  score: Record<Horizon, number>;
  point: { x: string; y: string };
  tag: string;
};

const horizons: { id: Horizon; label: string; caption: string }[] = [
  { id: "today", label: "Today", caption: "17 Sep 2026" },
  { id: "30d", label: "30 days", caption: "17 Oct 2026" },
  { id: "90d", label: "90 days", caption: "16 Dec 2026" },
  { id: "180d", label: "180 days", caption: "16 Mar 2027" },
];

const evidence: EvidenceItem[] = [
  {
    id: "cctv",
    title: "Junction CCTV footage",
    type: "Video record",
    icon: Camera,
    accent: "coral",
    source: "CCTV inventory · p. 2 · item 4",
    reason: "Retention period is limited and has not been verified.",
    unknown: "The actual overwrite date and whether a copy already exists.",
    action:
      "Verify the retention period and the responsible custodian through the approved process.",
    status: {
      today: "High attention",
      "30d": "Urgent review",
      "90d": "Urgent review",
      "180d": "Urgent review",
    },
    score: { today: 88, "30d": 97, "90d": 99, "180d": 99 },
    point: { x: "72%", y: "18%" },
    tag: "Retention unverified",
  },
  {
    id: "witness",
    title: "Eyewitness availability",
    type: "Witness statement",
    icon: UserRound,
    accent: "amber",
    source: "Witness statement · p. 1 · para 3",
    reason: "The source notes a time-sensitive availability concern.",
    unknown: "Future availability cannot be predicted from this record alone.",
    action:
      "Confirm contact and availability information through authorized procedure.",
    status: {
      today: "Review required",
      "30d": "Review required",
      "90d": "Review required",
      "180d": "Review required",
    },
    score: { today: 62, "30d": 68, "90d": 74, "180d": 81 },
    point: { x: "29%", y: "37%" },
    tag: "Availability signal",
  },
  {
    id: "medical",
    title: "Medical record snapshot",
    type: "Clinical record",
    icon: Activity,
    accent: "blue",
    source: "Hospital record · p. 4 · dated 09 Sep 2026",
    reason: "The record captures a condition that may change over time.",
    unknown:
      "Whether a follow-up record has been created since the source date.",
    action: "Preserve the original and record the date of any lawful update.",
    status: {
      today: "Monitor",
      "30d": "Monitor",
      "90d": "Review required",
      "180d": "Review required",
    },
    score: { today: 37, "30d": 44, "90d": 58, "180d": 66 },
    point: { x: "45%", y: "66%" },
    tag: "Record may change",
  },
  {
    id: "site",
    title: "Accident site condition",
    type: "Physical scene",
    icon: Construction,
    accent: "violet",
    source: "Municipal works notice · p. 1 · notice 18/26",
    reason: "Planned road work may alter the physical scene.",
    unknown: "Whether the construction timeline will change.",
    action:
      "Check the works notice and document the timeline through the approved route.",
    status: {
      today: "Monitor",
      "30d": "High attention",
      "90d": "Urgent review",
      "180d": "Urgent review",
    },
    score: { today: 43, "30d": 71, "90d": 91, "180d": 96 },
    point: { x: "81%", y: "55%" },
    tag: "Physical change",
  },
  {
    id: "telematics",
    title: "Vehicle telematics export",
    type: "Digital record",
    icon: Database,
    accent: "teal",
    source: "Vehicle export log · record 0041",
    reason: "Digital data may be rotated, deleted, or become inaccessible.",
    unknown: "Whether a verified export and custody record already exists.",
    action: "Confirm the export date, hash, custodian, and access history.",
    status: {
      today: "Monitor",
      "30d": "Monitor",
      "90d": "Monitor",
      "180d": "Review required",
    },
    score: { today: 31, "30d": 38, "90d": 46, "180d": 57 },
    point: { x: "61%", y: "78%" },
    tag: "Digital custody",
  },
];

const accentMap: Record<Accent, { icon: string; tint: string; line: string }> =
  {
    coral: { icon: "#e88977", tint: "rgba(232,137,119,.12)", line: "#e88977" },
    amber: { icon: "#e6b16b", tint: "rgba(230,177,107,.12)", line: "#e6b16b" },
    blue: { icon: "#7ab8e6", tint: "rgba(122,184,230,.12)", line: "#7ab8e6" },
    violet: { icon: "#ab99e8", tint: "rgba(171,153,232,.12)", line: "#ab99e8" },
    teal: { icon: "#7bd0c1", tint: "rgba(123,208,193,.12)", line: "#7bd0c1" },
  };

function RiskPill({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  const urgent = label === "Urgent review" || label === "High attention";
  const review = label === "Review required";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.08em] ${compact ? "px-2" : ""} ${urgent ? "border-[#84534b] bg-[#3a2426] text-[#eeaa96]" : review ? "border-[#8a7049] bg-[#392f22] text-[#e5be7e]" : "border-[#315b62] bg-[#19343d] text-[#8bd4c6]"}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${urgent ? "bg-[#e88977]" : review ? "bg-[#e6b16b]" : "bg-[#7bd0c1]"}`}
      />
      {label}
    </span>
  );
}

function Sidebar({
  active,
  setActive,
}: {
  active: string;
  setActive: (x: string) => void;
}) {
  const items = [
    { id: "radar", label: "Risk radar", icon: Radar, count: "04" },
    { id: "evidence", label: "Evidence library", icon: FileSearch2 },
    {
      id: "checklist",
      label: "Preservation checklist",
      icon: ListChecks,
      count: "06",
    },
    { id: "audit", label: "Review history", icon: History },
  ];
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-[#1b2a3d] bg-[#0a111e] px-5 py-6 lg:flex lg:flex-col">
      <div className="mb-12 flex items-center gap-3 px-1">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d8a867] text-[#16100b] shadow-[0_0_28px_rgba(216,168,103,.18)]">
          <ShieldAlert size={20} strokeWidth={2.3} />
        </div>
        <div>
          <div className="font-serif text-[19px] tracking-tight text-[#f3e9d8]">
            BeforeItFades
          </div>
          <div className="font-mono text-[8px] uppercase tracking-[.18em] text-[#718096]">
            Evidence preservation
          </div>
        </div>
      </div>
      <div className="mb-3 px-2 font-mono text-[9px] uppercase tracking-[.2em] text-[#536379]">
        Workspace
      </div>
      <nav className="space-y-1">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${active === item.id ? "bg-[#17283a] text-[#f2dfc0] shadow-[inset_2px_0_0_#d8a867]" : "text-[#8796a9] hover:bg-[#101d2e] hover:text-[#dce7f2]"}`}
            >
              <span className="flex items-center gap-3">
                <Icon size={16} strokeWidth={1.8} />
                {item.label}
              </span>
              {item.count && (
                <span
                  className={`font-mono text-[10px] ${active === item.id ? "text-[#d8a867]" : "text-[#536379]"}`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto space-y-4">
        <div className="rounded-xl border border-[#23364a] bg-[#101c2b] p-3.5">
          <div className="mb-2 flex items-center gap-2 text-[11px] text-[#9de0d1]">
            <ShieldCheck size={14} /> Human review active
          </div>
          <p className="m-0 text-[11px] leading-relaxed text-[#718096]">
            No alert becomes an action without an authorized reviewer.
          </p>
        </div>
        <div className="flex items-center gap-3 border-t border-[#1c2a3c] pt-4">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#263b4a] text-[11px] font-semibold text-[#acd7ce]">
            AS
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] text-[#dce7f2]">A. Sharma</div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#5d6d82]">
              Court staff · verified
            </div>
          </div>
          <MoreHorizontal size={16} className="ml-auto text-[#586a80]" />
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#1b2a3d] bg-[#0b1422]/90 px-5 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-[#8b9aab] hover:bg-[#152236] lg:hidden"
          onClick={onMenu}
        >
          <Menu size={19} />
        </button>
        <div className="lg:hidden">
          <div className="font-serif text-[17px] text-[#f3e9d8]">
            BeforeItFades
          </div>
        </div>
        <div className="hidden items-center gap-2 text-[12px] text-[#6f8198] lg:flex">
          <Landmark size={14} className="text-[#d8a867]" />
          <span>District Court · Evidence Operations</span>
          <ChevronRight size={13} />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-lg border border-[#1d3045] bg-[#0e1928] px-3 py-2 text-[#74869d] sm:flex">
          <Search size={14} />
          <span className="text-[11px]">Search case or source</span>
          <span className="ml-6 rounded border border-[#283b50] px-1.5 py-0.5 font-mono text-[9px]">
            ⌘K
          </span>
        </div>
        <button
          className="relative rounded-lg p-2 text-[#8b9aab] hover:bg-[#152236]"
          onClick={() => toast("No new review events")}
        >
          <Bell size={17} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e88977] ring-2 ring-[#0b1422]" />
        </button>
        <div className="hidden h-6 w-px bg-[#203044] sm:block" />
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#263b4a] text-[10px] font-semibold text-[#acd7ce]">
            AS
          </div>
          <ChevronDown size={13} className="text-[#718096]" />
        </div>
      </div>
    </header>
  );
}

function CaseHeader() {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#718096]">
          <span>Active case</span>
          <span className="text-[#34485e]">/</span>
          <span className="text-[#9cb0c5]">CR-2026-0417</span>
          <span className="rounded-full border border-[#315b62] bg-[#19343d] px-2 py-0.5 text-[#8bd4c6]">
            Pending
          </span>
        </div>
        <h1 className="m-0 font-serif text-[34px] leading-none tracking-[-.025em] text-[#f3e9d8] sm:text-[43px]">
          State v. Rao
        </h1>
        <p className="mt-3 max-w-[680px] text-[13px] leading-relaxed text-[#7f90a5]">
          Road-accident evidence review{" "}
          <span className="mx-2 text-[#35485d]">·</span> Next hearing{" "}
          <span className="text-[#d2dce8]">21 Nov 2026</span>{" "}
          <span className="mx-2 text-[#35485d]">·</span> 7 source records
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => toast("Case source index is up to date")}
          className="flex items-center gap-2 rounded-lg border border-[#293d53] bg-[#101b2b] px-3 py-2.5 text-[11px] text-[#9eafc2] transition hover:border-[#476079] hover:text-[#eef3fb]"
        >
          <FileText size={14} /> Source index{" "}
          <CheckCircle2 size={13} className="text-[#7bd0c1]" />
        </button>
        <button
          onClick={() => toast("Demo mode — export is simulated")}
          className="flex items-center gap-2 rounded-lg bg-[#d8a867] px-3 py-2.5 text-[11px] font-semibold text-[#17110b] transition hover:bg-[#e6b978] active:scale-[.98]"
        >
          <ArrowUpRight size={14} /> Export review brief
        </button>
      </div>
    </div>
  );
}

function HorizonBar({
  horizon,
  setHorizon,
}: {
  horizon: Horizon;
  setHorizon: (x: Horizon) => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#20334a] bg-[#0e1928] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex items-center gap-2">
        <CalendarClock size={16} className="text-[#d8a867]" />
        <div>
          <div className="text-[12px] font-medium text-[#dce7f2]">
            Time simulation
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[.12em] text-[#62748a]">
            Scenario view · not a prediction
          </div>
        </div>
      </div>
      <div className="flex rounded-lg border border-[#25384e] bg-[#0a1320] p-1">
        {horizons.map(item => (
          <button
            key={item.id}
            onClick={() => setHorizon(item.id)}
            className={`rounded-md px-3 py-1.5 text-[10px] transition-all ${horizon === item.id ? "bg-[#d8a867] font-semibold text-[#17110b] shadow-sm" : "text-[#8292a7] hover:text-[#dce7f2]"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="hidden font-mono text-[10px] text-[#64758a] sm:block">
        As of{" "}
        <span className="text-[#bdcbd9]">
          {horizons.find(x => x.id === horizon)?.caption}
        </span>
      </div>
    </div>
  );
}

function RadarCard({
  selected,
  horizon,
  onSelect,
}: {
  selected: EvidenceItem;
  horizon: Horizon;
  onSelect: (id: EvidenceId) => void;
}) {
  return (
    <section className="noise relative overflow-hidden rounded-2xl border border-[#21344a] bg-[#0d1928] p-5 shadow-[0_18px_60px_rgba(0,0,0,.14)] sm:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#d8a867]">
            <Radar size={14} /> Evidence Risk Radar
          </div>
          <h2 className="m-0 text-[19px] font-semibold tracking-tight text-[#eaf1f8]">
            What may become unavailable?
          </h2>
          <p className="mt-1.5 text-[12px] text-[#74869c]">
            Risk signals grounded in the case record and configured rules.
          </p>
        </div>
        <button
          onClick={() => toast("Radar filters are ready for configuration")}
          className="rounded-lg border border-[#24384e] p-2 text-[#8495a9] hover:bg-[#142438] hover:text-[#dce7f2]"
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
        <div className="relative h-[330px] overflow-hidden rounded-xl border border-[#1f3448] bg-[#0a1523] radar-grid">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_22%,rgba(216,168,103,.06),transparent_35%),radial-gradient(circle_at_28%_78%,rgba(123,208,193,.06),transparent_34%)]" />
          <div className="absolute left-3 top-3 font-mono text-[8px] uppercase tracking-widest text-[#51657c]">
            High volatility
          </div>
          <div className="absolute bottom-3 left-3 font-mono text-[8px] uppercase tracking-widest text-[#51657c]">
            Low volatility
          </div>
          <div className="absolute right-3 top-3 font-mono text-[8px] uppercase tracking-widest text-[#51657c]">
            Source uncertainty →
          </div>
          <div className="absolute bottom-3 right-3 font-mono text-[8px] uppercase tracking-widest text-[#51657c]">
            Verified source
          </div>
          {evidence.map(item => {
            const a = accentMap[item.accent];
            const isSelected = item.id === selected.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: item.point.x, top: item.point.y }}
                aria-label={`View ${item.title}`}
              >
                <span
                  className={`absolute -inset-4 rounded-full ${isSelected ? "pulse-ring" : "opacity-0 group-hover:opacity-30"}`}
                  style={{ background: a.line }}
                />
                <span
                  className={`relative grid h-9 w-9 place-items-center rounded-full border-2 shadow-[0_5px_20px_rgba(0,0,0,.3)] transition-transform group-hover:scale-110 ${isSelected ? "scale-110" : ""}`}
                  style={{
                    background: a.tint,
                    borderColor: a.line,
                    color: a.line,
                  }}
                >
                  <item.icon size={15} />
                </span>
                <span
                  className={`absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap rounded bg-[#101d2d]/95 px-2 py-1 text-[9px] text-[#bbc9d8] shadow-lg transition ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
          <div className="absolute bottom-4 left-1/2 h-px w-[1px] bg-[#5d7890]/30" />
          <div className="absolute left-1/2 top-1/2 h-px w-[1px] bg-[#5d7890]/30" />
        </div>
        <div className="space-y-2.5">
          <div className="mb-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[.14em] text-[#61738a]">
            <span>Signals</span>
            <span>5 items</span>
          </div>
          {evidence.map(item => {
            const a = accentMap[item.accent];
            const isSelected = item.id === selected.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${isSelected ? "border-[#536d7f] bg-[#162637]" : "border-transparent bg-[#101c2b] hover:border-[#294158]"}`}
              >
                <div
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                  style={{ background: a.tint, color: a.icon }}
                >
                  <item.icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-medium text-[#dce7f2]">
                    {item.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: a.line }}
                    />
                    <span className="font-mono text-[9px] text-[#718196]">
                      {item.score[horizon]} attention
                    </span>
                  </div>
                </div>
                <ChevronRight size={13} className="text-[#53667d]" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DetailPanel({
  item,
  horizon,
  reviewed,
  onReview,
}: {
  item: EvidenceItem;
  horizon: Horizon;
  reviewed: boolean;
  onReview: () => void;
}) {
  const a = accentMap[item.accent];
  return (
    <section className="rounded-2xl border border-[#21344a] bg-[#0d1928] p-5 shadow-[0_18px_60px_rgba(0,0,0,.1)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ background: a.tint, color: a.icon }}
          >
            <item.icon size={18} />
          </div>
          <div>
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[.16em] text-[#77899e]">
              Selected evidence
            </div>
            <h2 className="m-0 text-[17px] font-semibold text-[#eaf1f8]">
              {item.title}
            </h2>
            <div className="mt-1 text-[11px] text-[#77899e]">{item.type}</div>
          </div>
        </div>
        <button
          onClick={() =>
            toast("Evidence actions are available to authorized reviewers")
          }
          className="rounded-lg p-2 text-[#6f8198] hover:bg-[#162638] hover:text-[#dce7f2]"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>
      <div className="mb-4 rounded-xl border border-[#3c3e37] bg-[#191d1d] p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#e8c384]">
            <AlertTriangle size={14} /> Why this is flagged
          </div>
          <RiskPill label={item.status[horizon]} compact />
        </div>
        <p className="m-0 text-[12px] leading-relaxed text-[#c1cbd5]">
          {item.reason}
        </p>
      </div>
      <div className="space-y-3 border-b border-[#1c2c40] pb-4">
        <div className="flex gap-3">
          <FileSearch2 size={15} className="mt-0.5 shrink-0 text-[#7ab8e6]" />
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wider text-[#63768c]">
              Source
            </div>
            <button
              onClick={() => toast(`Opening ${item.source}`)}
              className="text-left text-[11px] text-[#a4ccea] underline decoration-[#416177] underline-offset-4 hover:text-white"
            >
              {item.source} <ArrowUpRight className="ml-1 inline" size={11} />
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <CircleHelp size={15} className="mt-0.5 shrink-0 text-[#d8a867]" />
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wider text-[#63768c]">
              What the system does not know
            </div>
            <p className="m-0 text-[11px] leading-relaxed text-[#8899ac]">
              {item.unknown}
            </p>
          </div>
        </div>
      </div>
      <div className="py-4">
        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#63768c]">
          <ListChecks size={14} className="text-[#7bd0c1]" /> Human review
          suggested
        </div>
        <p className="m-0 text-[12px] leading-relaxed text-[#b8c6d3]">
          {item.action}
        </p>
      </div>
      <button
        onClick={onReview}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-semibold transition active:scale-[.98] ${reviewed ? "border border-[#315b62] bg-[#19343d] text-[#8bd4c6]" : "bg-[#d8a867] text-[#17110b] hover:bg-[#e7b978]"}`}
      >
        {reviewed ? (
          <>
            <Check size={14} /> Marked human-reviewed
          </>
        ) : (
          <>
            <Eye size={14} /> Mark as human-reviewed
          </>
        )}
      </button>
    </section>
  );
}

function Checklist({
  checked,
  setChecked,
}: {
  checked: string[];
  setChecked: (x: string[]) => void;
}) {
  const tasks = [
    {
      id: "cctv",
      title: "Verify CCTV retention period",
      meta: "Owner: Evidence desk · Due 19 Sep",
      priority: "Urgent review",
    },
    {
      id: "witness",
      title: "Confirm witness availability record",
      meta: "Owner: Case officer · Due 22 Sep",
      priority: "Review required",
    },
    {
      id: "site",
      title: "Check road-work notice timeline",
      meta: "Owner: Evidence desk · Due 25 Sep",
      priority: "High attention",
    },
    {
      id: "medical",
      title: "Preserve original medical record",
      meta: "Owner: Case officer · Due 28 Sep",
      priority: "Monitor",
    },
  ];
  const toggle = (id: string) => {
    const next = checked.includes(id)
      ? checked.filter(x => x !== id)
      : [...checked, id];
    setChecked(next);
    toast(checked.includes(id) ? "Task reopened" : "Task marked complete");
  };
  return (
    <section className="rounded-2xl border border-[#21344a] bg-[#0d1928] p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#7bd0c1]">
            <ListChecks size={14} /> Preservation checklist
          </div>
          <h2 className="m-0 text-[18px] font-semibold text-[#eaf1f8]">
            Review before the next hearing
          </h2>
        </div>
        <span className="rounded-full border border-[#293c51] px-2.5 py-1 font-mono text-[10px] text-[#8798ac]">
          {checked.length}/4 complete
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map(task => {
          const done = checked.includes(task.id);
          return (
            <button
              key={task.id}
              onClick={() => toggle(task.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${done ? "border-[#23474c] bg-[#112a30]" : "border-[#1c3045] bg-[#101c2b] hover:border-[#345068]"}`}
            >
              <div
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${done ? "border-[#7bd0c1] bg-[#7bd0c1] text-[#102021]" : "border-[#53677d]"}`}
              >
                {done && <Check size={13} strokeWidth={3} />}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-[12px] ${done ? "text-[#94c9c0] line-through" : "text-[#dce7f2]"}`}
                >
                  {task.title}
                </div>
                <div className="mt-1 font-mono text-[9px] text-[#64768b]">
                  {task.meta}
                </div>
              </div>
              <RiskPill label={task.priority} compact />
            </button>
          );
        })}
      </div>
      <button
        onClick={() =>
          toast("New task creation is available in the full workflow")
        }
        className="mt-4 flex items-center gap-2 text-[11px] text-[#d8a867] hover:text-[#f0c985]"
      >
        <span className="text-base">+</span> Add review task
      </button>
    </section>
  );
}

function AuditPanel({ reviewed }: { reviewed: boolean }) {
  return (
    <section className="rounded-2xl border border-[#21344a] bg-[#0d1928] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#7ab8e6]">
            <History size={14} /> Provenance trail
          </div>
          <h2 className="m-0 text-[18px] font-semibold text-[#eaf1f8]">
            Why you can trust the alert
          </h2>
        </div>
        <LockKeyhole size={16} className="text-[#667b92]" />
      </div>
      <div className="space-y-0">
        <div className="relative flex gap-3 pb-5 before:absolute before:left-[7px] before:top-5 before:h-[calc(100%-10px)] before:w-px before:bg-[#2b4157]">
          <div className="relative z-10 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#7ab8e6] ring-4 ring-[#0d1928]">
            <FileText size={8} className="text-[#102235]" />
          </div>
          <div>
            <div className="text-[11px] text-[#dbe6f0]">
              Source record indexed
            </div>
            <div className="mt-1 font-mono text-[9px] text-[#63768c]">
              17 Sep 2026 · 09:14 · Case intake
            </div>
          </div>
        </div>
        <div className="relative flex gap-3 pb-5 before:absolute before:left-[7px] before:top-5 before:h-[calc(100%-10px)] before:w-px before:bg-[#2b4157]">
          <div className="relative z-10 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#d8a867] ring-4 ring-[#0d1928]">
            <Sparkles size={8} className="text-[#1e160d]" />
          </div>
          <div>
            <div className="text-[11px] text-[#dbe6f0]">
              Rule{" "}
              <span className="font-mono text-[#e4bb75]">
                RETENTION_UNVERIFIED
              </span>{" "}
              triggered
            </div>
            <div className="mt-1 font-mono text-[9px] text-[#63768c]">
              17 Sep 2026 · 09:15 · Risk engine
            </div>
          </div>
        </div>
        <div className="relative flex gap-3">
          <div
            className={`relative z-10 grid h-4 w-4 shrink-0 place-items-center rounded-full ring-4 ring-[#0d1928] ${reviewed ? "bg-[#7bd0c1]" : "bg-[#344b62]"}`}
          >
            {reviewed ? (
              <Check size={9} className="text-[#102021]" />
            ) : (
              <Clock3 size={9} className="text-[#93a3b5]" />
            )}
          </div>
          <div>
            <div className="text-[11px] text-[#dbe6f0]">
              {reviewed ? "Human review recorded" : "Awaiting human review"}
            </div>
            <div className="mt-1 font-mono text-[9px] text-[#63768c]">
              {reviewed ? "A. Sharma · just now" : "No decision recorded"}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-start gap-2 rounded-lg border border-[#29434b] bg-[#11252d] p-3 text-[10px] leading-relaxed text-[#8dc9c0]">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" /> The system shows a
        signal, not a legal conclusion. Human review remains the decision gate.
      </div>
    </section>
  );
}

function WorkspaceView({
  active,
  checked,
  setChecked,
  reviewed,
}: {
  active: string;
  checked: string[];
  setChecked: (x: string[]) => void;
  reviewed: boolean;
}) {
  if (active === "checklist") {
    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
        <Checklist checked={checked} setChecked={setChecked} />
        <AuditPanel reviewed={reviewed} />
      </div>
    );
  }
  if (active === "audit") {
    return (
      <div className="max-w-[820px]">
        <AuditPanel reviewed={reviewed} />
      </div>
    );
  }
  return (
    <section className="rounded-2xl border border-[#21344a] bg-[#0d1928] p-5 sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#7ab8e6]">
            <FileSearch2 size={14} /> Evidence library
          </div>
          <h2 className="m-0 text-[22px] font-semibold text-[#eaf1f8]">
            Source records in this case
          </h2>
          <p className="mt-1.5 text-[12px] text-[#74869c]">
            Seven indexed records · every alert keeps its source reference.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#20334a] bg-[#101c2b] px-3 py-2 text-[#75879b]">
          <Search size={14} />
          <span className="text-[11px]">Filter sources</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            title: "CCTV inventory",
            meta: "Video record · 2 pages",
            detail: "Retention statement not verified",
            icon: Camera,
            accent: "coral" as Accent,
            state: "Needs review",
          },
          {
            title: "Witness statement",
            meta: "Statement · 1 page",
            detail: "Availability signal found",
            icon: UserRound,
            accent: "amber" as Accent,
            state: "Review required",
          },
          {
            title: "Hospital record",
            meta: "Clinical record · 6 pages",
            detail: "Snapshot dated 09 Sep 2026",
            icon: Activity,
            accent: "blue" as Accent,
            state: "Indexed",
          },
          {
            title: "Municipal works notice",
            meta: "Public record · 1 page",
            detail: "Road work date approaching",
            icon: Construction,
            accent: "violet" as Accent,
            state: "Needs review",
          },
          {
            title: "Vehicle export log",
            meta: "Digital record · 1 file",
            detail: "Custody metadata available",
            icon: Database,
            accent: "teal" as Accent,
            state: "Indexed",
          },
          {
            title: "Police case diary",
            meta: "Case record · 12 pages",
            detail: "No time signal detected",
            icon: FileText,
            accent: "blue" as Accent,
            state: "Indexed",
          },
        ].map(record => {
          const a = accentMap[record.accent];
          return (
            <button
              key={record.title}
              onClick={() => toast(`Opening ${record.title}`)}
              className="group flex items-center gap-4 rounded-xl border border-[#1c3045] bg-[#101c2b] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#3a5770] hover:bg-[#142438]"
            >
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{ background: a.tint, color: a.icon }}
              >
                <record.icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate text-[13px] font-medium text-[#dce7f2]">
                    {record.title}
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-[#587087] transition group-hover:text-[#d8a867]"
                  />
                </div>
                <div className="mt-1 text-[10px] text-[#718398]">
                  {record.meta}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[9px] uppercase tracking-wide text-[#8c9caf]">
                    {record.detail}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] ${record.state === "Needs review" || record.state === "Review required" ? "bg-[#392f22] text-[#e5be7e]" : "bg-[#19343d] text-[#8bd4c6]"}`}
                  >
                    {record.state}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex items-start gap-2 rounded-lg border border-[#29434b] bg-[#11252d] p-3 text-[10px] leading-relaxed text-[#8dc9c0]">
        <LockKeyhole size={14} className="mt-0.5 shrink-0" /> Source records are
        shown for authorized review. This demo uses synthetic case material.
      </div>
    </section>
  );
}

export default function Home() {
  const [active, setActive] = useState("radar");
  const [horizon, setHorizon] = useState<Horizon>("today");
  const [selectedId, setSelectedId] = useState<EvidenceId>("cctv");
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [mobileNav, setMobileNav] = useState(false);
  const selected = useMemo(
    () => evidence.find(item => item.id === selectedId) ?? evidence[0],
    [selectedId]
  );
  const handleReview = () => {
    const next = reviewed.includes(selected.id)
      ? reviewed.filter(x => x !== selected.id)
      : [...reviewed, selected.id];
    setReviewed(next);
    toast(
      next.includes(selected.id)
        ? "Human review recorded in audit trail"
        : "Review mark removed"
    );
  };
  return (
    <div className="min-h-screen bg-[#080d17] text-[#eef3fb]">
      <div className="flex min-h-screen">
        <Sidebar active={active} setActive={setActive} />
        {mobileNav && (
          <div
            className="fixed inset-0 z-50 bg-[#080d17]/80 lg:hidden"
            onClick={() => setMobileNav(false)}
          >
            <div
              className="h-full w-[270px] bg-[#0a111e] p-5 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-10 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d8a867] text-[#16100b]">
                  <ShieldAlert size={20} />
                </div>
                <div className="font-serif text-[18px] text-[#f3e9d8]">
                  BeforeItFades
                </div>
                <button
                  className="ml-auto text-[#718096]"
                  onClick={() => setMobileNav(false)}
                >
                  <X size={18} />
                </button>
              </div>
              {["radar", "evidence", "checklist", "audit"].map(id => (
                <button
                  key={id}
                  className={`mb-1 block w-full rounded-lg px-3 py-3 text-left text-[13px] ${active === id ? "bg-[#17283a] text-[#f2dfc0]" : "text-[#8796a9]"}`}
                  onClick={() => {
                    setActive(id);
                    setMobileNav(false);
                  }}
                >
                  {id === "radar"
                    ? "Risk radar"
                    : id === "evidence"
                      ? "Evidence library"
                      : id === "checklist"
                        ? "Preservation checklist"
                        : "Review history"}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Topbar onMenu={() => setMobileNav(true)} />
          <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
            <CaseHeader />
            <HorizonBar horizon={horizon} setHorizon={setHorizon} />
            {active === "radar" ? (
              <>
                <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,.85fr)]">
                  <RadarCard
                    selected={selected}
                    horizon={horizon}
                    onSelect={setSelectedId}
                  />
                  <DetailPanel
                    item={selected}
                    horizon={horizon}
                    reviewed={reviewed.includes(selected.id)}
                    onReview={handleReview}
                  />
                </div>
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
                  <Checklist checked={checked} setChecked={setChecked} />
                  <AuditPanel reviewed={reviewed.includes(selected.id)} />
                </div>
              </>
            ) : (
              <WorkspaceView
                active={active}
                checked={checked}
                setChecked={setChecked}
                reviewed={reviewed.includes(selected.id)}
              />
            )}
            <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-[#192a3d] pt-5 text-[10px] text-[#596c82] sm:flex-row">
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} className="text-[#7bd0c1]" />{" "}
                Decision-support prototype · Human review required
              </div>
              <div className="font-mono uppercase tracking-[.12em]">
                BeforeItFades · v0.1 demo
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
