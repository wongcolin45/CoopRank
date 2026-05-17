import { Role } from "@/lib/types";

const TIER_CLASSES: Record<string, string> = {
  S: "bg-yellow-400 text-black border-2 border-black",
  "A+": "bg-purple-500 text-white border-2 border-black",
  A: "bg-blue-500 text-white border-2 border-black",
  "A-": "bg-sky-400 text-black border-2 border-black",
  "B+": "bg-emerald-400 text-black border-2 border-black",
  B: "bg-green-400 text-black border-2 border-black",
  "C+": "bg-slate-300 text-black border-2 border-black",
  C: "bg-slate-200 text-black border-2 border-black",
  D: "bg-red-400 text-black border-2 border-black",
};

const SELECTIVITY_CLASSES: Record<string, string> = {
  "Very High": "bg-red-500 text-white border-2 border-black",
  High: "bg-orange-400 text-black border-2 border-black",
  Moderate: "bg-yellow-300 text-black border-2 border-black",
  Low: "bg-green-400 text-black border-2 border-black",
};

const RANK_BG: Record<number, string> = {
  1: "bg-yellow-400",
  2: "bg-gray-200",
  3: "bg-orange-200",
};

export default function RoleCard({
  role,
  rank,
  elo,
  voted = false,
}: {
  role: Role;
  rank: number;
  elo: number;
  voted?: boolean;
}) {
  const score = elo.toFixed(1);
  const tierClass = TIER_CLASSES[role.prestige_tier] ?? TIER_CLASSES["C+"];
  const selectivityClass =
    SELECTIVITY_CLASSES[role.selectivity] ??
    "bg-gray-200 text-black border-2 border-black";
  const rankBg = RANK_BG[rank] ?? "bg-[#f5f5f0]";

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-px hover:-translate-y-px transition-all duration-75 overflow-hidden">
      {/* Company color top strip */}
      <div style={{ backgroundColor: role.company_color, height: "5px" }} />

      <div className="flex">
        {/* Rank column */}
        <div
          className={`w-12 sm:w-14 border-r-2 border-black flex items-center justify-center shrink-0 ${rankBg}`}
        >
          <span
            className={`font-black text-xl tabular-nums ${
              "text-black"
            }`}
          >
            {rank}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-3.5">
          {/* Row 1: company + badges + comp/score */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="font-black text-black text-[15px] leading-snug">
                {role.company}
              </span>
              <span className={`text-[11px] font-black px-1.5 py-0.5 ${tierClass}`}>
                {role.prestige_tier}
              </span>
              {role.role_type === "Co-op" && (
                <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-600 text-white border-2 border-black uppercase tracking-wide">
                  Co-op
                </span>
              )}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-black font-black text-sm tabular-nums">
                {role.intern_coop_compensation}
              </span>
              <span className="relative text-white text-[11px] font-black font-mono bg-black border-2 border-black px-2 py-0.5 tabular-nums tracking-wide">
                ELO {score}
                {voted && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 border border-black" />
                )}
              </span>
            </div>
          </div>

          {/* Row 2: role title */}
          <p className="text-black/60 text-sm mt-0.5 font-medium leading-snug">
            {role.role}
          </p>

          {/* Row 3: known_for */}
          <p className="text-black/40 text-xs mt-1 line-clamp-1 leading-relaxed">
            {role.known_for}
          </p>

          {/* Row 4: tech pills + meta */}
          <div className="flex items-center justify-between mt-2.5 gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {role.primary_tech_stack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] px-1.5 py-0.5 bg-white border-2 border-black text-black font-mono font-bold"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[11px] px-1.5 py-0.5 font-black ${selectivityClass}`}
              >
                {role.selectivity}
              </span>
              <span className="text-[11px] text-black/40 font-medium whitespace-nowrap">
                {role.company_size}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
