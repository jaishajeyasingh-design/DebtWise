import React from 'react';

/**
 * RiskBadge Component
 * Renders standardized badges for Risk Levels and Automation Tiers A/B/C.
 */
export default function RiskBadge({ type = "risk", value, className = "" }) {
  if (type === "tier" || value?.includes("Tier")) {
    const isTierA = value?.includes("A") || value?.includes("Auto");
    const isTierB = value?.includes("B") || value?.includes("Prepare") || value?.includes("Officer");
    const isTierC = value?.includes("C") || value?.includes("Human");

    if (isTierA) {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {value || "Tier A • Auto Post-Consent"}
        </span>
      );
    }
    if (isTierB) {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          {value || "Tier B • AI Prepares, Officer Approves"}
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        {value || "Tier C • Human Hardship Only"}
      </span>
    );
  }

  // Risk Level Badges
  const valLower = String(value || "").toLowerCase();
  if (valLower.includes("critical")) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        Critical Risk
      </span>
    );
  }
  if (valLower.includes("high")) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        High Risk
      </span>
    );
  }
  if (valLower.includes("medium")) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
        Medium Risk
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      Low Risk
    </span>
  );
}
