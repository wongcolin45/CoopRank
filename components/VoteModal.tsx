"use client";

import { useState } from "react";
import { Role } from "@/lib/types";

const TIER_CLASSES: Record<string, string> = {
  S: "bg-yellow-400 text-black",
  "A+": "bg-purple-500 text-white",
  A: "bg-blue-500 text-white",
  "A-": "bg-sky-400 text-black",
  "B+": "bg-emerald-400 text-black",
  B: "bg-green-400 text-black",
  "C+": "bg-slate-300 text-black",
  C: "bg-slate-200 text-black",
  D: "bg-red-400 text-black",
};

function VoteCard({ role, onClick }: { role: Role; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 w-full bg-white border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[7px_7px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 text-left overflow-hidden group"
    >
      <div style={{ backgroundColor: role.company_color, height: "7px" }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-black text-xl text-black leading-tight">
            {role.company}
          </span>
          <span
            className={`text-sm font-black px-2 py-0.5 border-2 border-black shrink-0 ${
              TIER_CLASSES[role.prestige_tier] ?? "bg-slate-200 text-black"
            }`}
          >
            {role.prestige_tier}
          </span>
        </div>

        <p className="text-black/60 font-medium text-sm mb-3">{role.role}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="font-black text-black text-base">
            {role.intern_coop_compensation}
          </span>
          {role.role_type === "Co-op" && (
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-600 text-white border-2 border-black uppercase">
              Co-op
            </span>
          )}
        </div>

        <div className="flex gap-1 flex-wrap mb-5">
          {role.primary_tech_stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[11px] px-1.5 py-0.5 bg-[#f5f5f0] border-2 border-black text-black font-mono font-bold"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="w-full border-2 border-black bg-black text-white text-center py-2.5 font-black text-sm uppercase tracking-widest group-hover:bg-yellow-400 group-hover:text-black transition-colors duration-75">
          Pick This →
        </div>
      </div>
    </button>
  );
}

export default function VoteModal({
  roleA,
  roleB,
  voteCount,
  trackLabel,
  onVote,
  onSkip,
  onClose,
  onReset,
  canReset,
}: {
  roleA: Role;
  roleB: Role;
  voteCount: number;
  trackLabel: string;
  onVote: (winner: Role, loser: Role) => void;
  onSkip: () => void;
  onClose: () => void;
  onReset: () => void;
  canReset: boolean;
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f0] flex flex-col overflow-auto">
      {/* Header */}
      <div className="border-b-4 border-black bg-white px-4 sm:px-6 py-4 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="font-black text-xl sm:text-2xl uppercase tracking-tighter text-black leading-none">
            Train the Algorithm
          </h2>
          <p className="text-black/50 text-sm mt-0.5 font-medium">
            Which would you rather have on your resume?{" "}
            <span className="text-black font-black">· {trackLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="border-2 border-black bg-yellow-400 shadow-[2px_2px_0_#000] px-3 py-1.5 text-center">
            <span className="font-black text-black text-lg tabular-nums leading-none block">
              {voteCount}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-black">
              votes
            </span>
          </div>

          {canReset && confirmReset ? (
            <>
              <span className="text-xs font-bold text-black/60 hidden sm:block">
                Wipes everyone&apos;s votes.
              </span>
              <button
                onClick={() => { onReset(); setConfirmReset(false); }}
                className="border-2 border-black bg-red-500 text-white px-2.5 py-1.5 font-bold text-xs shadow-[2px_2px_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000] transition-all duration-75 uppercase tracking-wide"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="border-2 border-black bg-white text-black px-2.5 py-1.5 font-bold text-xs shadow-[2px_2px_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000] transition-all duration-75 uppercase tracking-wide"
              >
                Cancel
              </button>
            </>
          ) : canReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="border-2 border-black bg-white px-2.5 py-1.5 font-bold text-xs shadow-[2px_2px_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000] transition-all duration-75 uppercase tracking-wide"
            >
              Reset
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="border-2 border-black bg-black text-white px-2.5 py-1.5 font-bold text-xs shadow-[2px_2px_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000] transition-all duration-75 uppercase tracking-wide"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Voting cards */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 w-full max-w-3xl items-stretch">
          <VoteCard role={roleA} onClick={() => onVote(roleA, roleB)} />
          <div className="flex items-center justify-center shrink-0">
            <span className="font-black text-xl text-black/25 border-2 border-black/20 w-12 h-12 flex items-center justify-center bg-white">
              VS
            </span>
          </div>
          <VoteCard role={roleB} onClick={() => onVote(roleB, roleA)} />
        </div>
      </div>

      <div className="border-t-2 border-black bg-white px-6 py-3 text-center shrink-0">
        <button
          onClick={onSkip}
          className="text-black/40 text-sm font-bold hover:text-black transition-colors duration-75"
        >
          Skip this pair →
        </button>
      </div>
    </div>
  );
}
