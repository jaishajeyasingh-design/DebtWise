import React from 'react';
import { AlertCircle, TrendingDown, Clock, Layers, Zap, CheckCircle2 } from 'lucide-react';

const CAUSE_META = {
  EXPENSE_SHOCK: {
    label: "Expense Shock",
    icon: Zap,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    accent: "#00F0FF",
    desc: "Sudden spike in non-discretionary living, medical, or family emergency expenses with stable baseline income."
  },
  CASH_FLOW_MISMATCH: {
    label: "Cash-Flow Timing Mismatch",
    icon: Clock,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    accent: "#10B981",
    desc: "Salary deposit day falls after EMI autopay due date, creating temporary negative balance dips and overdraft friction."
  },
  DEBT_OVERLOAD: {
    label: "Debt Overload",
    icon: Layers,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    accent: "#F59E0B",
    desc: "Excessive compounding debt burden with DTI > 65% and saturated revolving credit lines."
  },
  INCOME_SHOCK: {
    label: "Income Shock",
    icon: TrendingDown,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    accent: "#3A86FF",
    desc: "Sharp drop (30-65%) in monthly net earnings due to contract loss, overtime cut, or business slowdown."
  },
  STRUCTURAL_DISTRESS: {
    label: "Structural Distress",
    icon: AlertCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    accent: "#F43F5E",
    desc: "Chronic baseline deficit where essential living costs plus minimum debt obligations exceed total earnings."
  }
};

export default function DistressDiagnosis({ diagnosis, showProbabilities = true, className = "" }) {
  if (!diagnosis) return null;

  const { primary_cause, confidence, probabilities = {} } = diagnosis;
  const meta = CAUSE_META[primary_cause] || CAUSE_META.EXPENSE_SHOCK;
  const IconComponent = meta.icon;
  const confidencePct = Math.round((confidence || 0) * 100);

  return (
    <div className={`glass-panel rounded-2xl p-6 border ${meta.border} ${className}`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]"></span>
          XGBoost Root-Cause Diagnosis
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono">
          <span className="text-slate-400">Model Confidence:</span>
          <span className={`font-bold ${meta.color}`}>{confidencePct}%</span>
        </div>
      </div>

      {/* Primary Cause Hero Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0`}>
            <IconComponent className={`w-7 h-7 ${meta.color}`} />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">Diagnosed Archetype</div>
            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {meta.label}
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              {meta.desc}
            </p>
          </div>
        </div>

        {/* Confidence Gauge Dial */}
        <div className="sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
          <div className="text-xs font-mono text-slate-400">DIAGNOSIS CERTAINTY</div>
          <div className={`text-3xl font-mono font-black ${meta.color} mt-0.5`}>
            {confidencePct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Statistical Multi-Class Fit</div>
        </div>
      </div>

      {/* Multi-Class Probability Distribution */}
      {showProbabilities && Object.keys(probabilities).length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-xs font-mono text-slate-400 mb-3 flex items-center justify-between">
            <span>FULL MULTI-CLASS PROBABILITY DISTRIBUTION</span>
            <span>5 DISTRESS ARCHETYPES EVALUATED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {Object.entries(probabilities).map(([causeKey, probVal]) => {
              const causeMeta = CAUSE_META[causeKey] || { label: causeKey, color: "text-slate-300", bg: "bg-slate-800" };
              const isTop = causeKey === primary_cause;
              const probPct = Math.round(probVal * 100);

              return (
                <div
                  key={causeKey}
                  className={`p-3 rounded-lg border transition-all ${
                    isTop
                      ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.08)]"
                      : "bg-slate-900/40 border-slate-800/80"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className={`font-semibold truncate ${isTop ? "text-cyan-300" : "text-slate-400"}`}>
                      {causeMeta.label}
                    </span>
                    <span className={`font-mono font-bold ${isTop ? "text-cyan-400" : "text-slate-400"}`}>
                      {probPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTop ? "bg-linear-to-r from-cyan-400 to-blue-500" : "bg-slate-600"
                      }`}
                      style={{ width: `${Math.max(4, probPct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
