"use client";

import { useMemo, useState } from "react";
import { Role } from "@/lib/types";
import { applyVote, buildSeed, pickPair, roleKey, seedElo } from "@/lib/elo";
import RoleCard from "./RoleCard";
import VoteModal from "./VoteModal";

const TRACKS = [
  { id: "cracked", label: "Most Cracked", emoji: "👑" },
  { id: "systems", label: "Systems & Embedded", emoji: "⚙️" },
  { id: "quant", label: "Quant & Fintech", emoji: "📊" },
  { id: "cloud", label: "Cloud & DevOps", emoji: "☁️" },
  { id: "swe", label: "General SWE", emoji: "💻" },
  { id: "health", label: "HealthTech & Biotech", emoji: "🧬" },
  { id: "ai", label: "AI & ML", emoji: "🤖" },
] as const;

function getRoleTracks(role: Role): string[] {
  const tracks: string[] = ["cracked"];

  if (
    role.domain_tags.includes("systems") ||
    role.industry === "Defense Tech" ||
    ["Autonomous", "Hardware", "IoT"].some((k) => role.industry.includes(k)) ||
    ["Embedded", "Low-Level", "Hardware"].some((k) => role.technical_focus.includes(k))
  ) tracks.push("systems");

  if (
    role.domain_tags.includes("quant") ||
    ["Hedge Fund", "Asset Management", "Investment Bank", "Trading", "Insurance Tech"].some(
      (k) => role.industry.includes(k)
    )
  ) tracks.push("quant");

  if (
    role.domain_tags.includes("cloud") ||
    ["Cybersecurity", "Networking", "Observability"].some(
      (k) => role.industry.includes(k) || role.technical_focus.includes(k)
    )
  ) tracks.push("cloud");

  if (
    role.domain_tags.includes("product") ||
    role.technical_focus === "Product Architecture / SaaS" ||
    [
      "Big Tech", "Consumer Apps", "E-Commerce", "Education Tech",
      "Enterprise Software", "Entertainment", "Marketing Tech",
      "Consumer Goods", "Logistics", "EnergyTech", "Sports Analytics",
      "Professional Services", "Telecoms",
    ].some((k) => role.industry === k)
  ) tracks.push("swe");

  if (
    ["HealthTech", "Biotech", "Pharma", "Medical"].some((k) => role.industry.includes(k))
  ) tracks.push("health");

  if (role.domain_tags.includes("ai_ml") && role.industry !== "Sports Analytics")
    tracks.push("ai");

  return tracks;
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-black/50 text-xs font-black uppercase tracking-wider shrink-0">
        {label}
      </span>
      <div className="flex border-2 border-black shadow-[2px_2px_0_#000] overflow-hidden">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 text-xs font-bold transition-colors duration-75 ${
              i > 0 ? "border-l-2 border-black" : ""
            } ${value === opt ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RankingApp({
  roles,
  initialRatings,
  initialVoteCounts,
  canReset,
}: {
  roles: Role[];
  initialRatings: Record<string, Record<string, number>>;
  initialVoteCounts: Record<string, number>;
  canReset: boolean;
}) {
  const [activeTrack, setActiveTrack] = useState("cracked");
  const [roleTypeFilter, setRoleTypeFilter] = useState("All");
  const [companySizeFilter, setCompanySizeFilter] = useState("All");
  const [selectivityFilter, setSelectivityFilter] = useState("All");

  const [allRatings, setAllRatings] = useState<Record<string, Record<string, number>>>(
    () => initialRatings
  );
  const [allVoteCounts, setAllVoteCounts] = useState<Record<string, number>>(
    () => initialVoteCounts
  );
  const [voteMode, setVoteMode] = useState(false);
  const [currentPair, setCurrentPair] = useState<[Role, Role] | null>(null);

  const trackRatings = allRatings[activeTrack] ?? {};
  const voteCount = allVoteCounts[activeTrack] ?? 0;

  const rankedRoles = useMemo(() => {
    const ratings = allRatings[activeTrack] ?? {};
    return roles
      .filter((role) => {
        if (!getRoleTracks(role).includes(activeTrack)) return false;
        if (roleTypeFilter !== "All" && role.role_type !== roleTypeFilter) return false;
        if (companySizeFilter !== "All" && role.company_size !== companySizeFilter) return false;
        if (selectivityFilter !== "All" && role.selectivity !== selectivityFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const ea = ratings[roleKey(a)] ?? seedElo(a);
        const eb = ratings[roleKey(b)] ?? seedElo(b);
        return eb - ea;
      });
  }, [roles, activeTrack, roleTypeFilter, companySizeFilter, selectivityFilter, allRatings]);

  const activeTrackMeta = TRACKS.find((t) => t.id === activeTrack)!;

  function openVoteMode() {
    const pair = pickPair(rankedRoles);
    if (pair) { setCurrentPair(pair); setVoteMode(true); }
  }

  function handleVote(winner: Role, loser: Role) {
    const current = allRatings[activeTrack] ?? buildSeed(roles);
    const updated = applyVote(current, winner, loser);

    setAllRatings((prev) => ({ ...prev, [activeTrack]: updated }));
    setAllVoteCounts((prev) => ({ ...prev, [activeTrack]: (prev[activeTrack] ?? 0) + 1 }));
    setCurrentPair(pickPair(rankedRoles));

    fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winnerKey: roleKey(winner),
        loserKey: roleKey(loser),
        trackId: activeTrack,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ratings)
          setAllRatings((prev) => ({ ...prev, [activeTrack]: data.ratings }));
        if (typeof data.votes === "number")
          setAllVoteCounts((prev) => ({ ...prev, [activeTrack]: data.votes }));
      })
      .catch(() => {});
  }

  function handleSkip() {
    setCurrentPair(pickPair(rankedRoles));
  }

  async function handleReset() {
    setAllRatings({});
    setAllVoteCounts({});
    setCurrentPair(pickPair(rankedRoles));
    await fetch("/api/reset-elo", { method: "POST" }).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {voteMode && currentPair && (
        <VoteModal
          roleA={currentPair[0]}
          roleB={currentPair[1]}
          voteCount={voteCount}
          trackLabel={`${activeTrackMeta.emoji} ${activeTrackMeta.label}`}
          onVote={handleVote}
          onSkip={handleSkip}
          onClose={() => setVoteMode(false)}
          onReset={handleReset}
          canReset={canReset}
        />
      )}

      <header className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black leading-none">
                CoopRank
              </h1>
              <p className="text-black/50 text-sm mt-2 font-medium">
                Northeastern co-op &amp; internship prestige rankings
              </p>
            </div>
            <div className="border-2 border-black shadow-[3px_3px_0_#000] bg-yellow-400 px-4 py-2 text-center shrink-0">
              <span className="text-2xl font-black text-black block tabular-nums leading-none">
                {roles.length}
              </span>
              <span className="text-black text-[10px] font-black uppercase tracking-wider">
                Roles
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 bg-[#f5f5f0] border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold border-2 border-black whitespace-nowrap transition-all duration-75 ${
                  activeTrack === track.id
                    ? "bg-black text-white translate-x-[2px] translate-y-[2px]"
                    : "bg-white text-black shadow-[3px_3px_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#000]"
                }`}
              >
                <span>{track.emoji}</span>
                <span>{track.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <FilterGroup label="Role" options={["All", "Co-op", "Internship"]} value={roleTypeFilter} onChange={setRoleTypeFilter} />
              <FilterGroup label="Size" options={["All", "Enterprise", "Large", "Mid-size", "Small"]} value={companySizeFilter} onChange={setCompanySizeFilter} />
              <FilterGroup label="Selectivity" options={["All", "Very High", "High", "Moderate", "Low"]} value={selectivityFilter} onChange={setSelectivityFilter} />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <p className="text-black font-black text-sm uppercase tracking-wide">
              {activeTrackMeta.emoji} {activeTrackMeta.label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-black/40 text-xs font-bold uppercase tracking-wider tabular-nums">
              {rankedRoles.length} result{rankedRoles.length !== 1 ? "s" : ""} · ranked by ELO
            </p>
            <button
              onClick={openVoteMode}
              disabled={rankedRoles.length < 2}
              className="border-2 border-black bg-black text-white px-3 py-1.5 font-black text-xs uppercase tracking-wide shadow-[2px_2px_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000] transition-all duration-75 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
            >
              ⚡ Train
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {rankedRoles.map((role, index) => (
            <RoleCard
              key={`${role.company}-${role.role}`}
              role={role}
              rank={index + 1}
              elo={trackRatings[roleKey(role)] ?? seedElo(role)}
              voted={voteCount > 0 && roleKey(role) in trackRatings}
            />
          ))}
          {rankedRoles.length === 0 && (
            <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000] p-12 text-center">
              <p className="font-black text-black/30 uppercase tracking-widest text-sm">
                No roles match the current filters
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
