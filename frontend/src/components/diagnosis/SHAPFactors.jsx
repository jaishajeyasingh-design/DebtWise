import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info, HelpCircle } from 'lucide-react';

export default function SHAPFactors({ factors = [], className = "" }) {
  if (!factors || factors.length === 0) return null;

  // Find max absolute SHAP value for scaling bars
  const maxAbsShap = Math.max(...factors.map(f => Math.abs(f.shap_value || 0.1)), 1.0);

  return (
    <div className={`glass-panel rounded-2xl p-6 border border-slate-700/60 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            SHAP Explainability Layer
          </div>
          <h4 className="text-lg font-bold text-white mt-0.5">Top Contributing Financial Factors</h4>
        </div>
        <div className="text-xs font-mono text-slate-400 hidden sm:flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          <span>Local TreeExplainer Attributions</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
        Mathematical feature contributions explaining <em>WHY</em> the AI diagnosed this specific distress archetype. Zero black-box decisions.
      </p>

      <div className="space-y-4">
        {factors.map((factor, idx) => {
          const isPos = factor.contribution === "positive" || (factor.shap_value > 0);
          const absVal = Math.abs(factor.shap_value || 0);
          const barWidth = Math.min(100, Math.max(12, Math.round((absVal / maxAbsShap) * 100)));

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              {/* Factor Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isPos
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-200">
                    {factor.feature}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">
                    Raw Value: <strong className="text-white">{factor.feature_value}</strong>
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      isPos ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    SHAP: {factor.shap_value > 0 ? `+${factor.shap_value.toFixed(3)}` : factor.shap_value.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Visual SHAP Impact Bar */}
              <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden my-2.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isPos
                      ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                      : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  }`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>

              {/* Human-readable explanation */}
              <div className="text-xs text-slate-300 flex items-start gap-1.5 mt-1">
                <span className="text-slate-400 font-bold shrink-0">Impact:</span>
                <span>{factor.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
