import React from 'react';
import { ShieldAlert, XCircle, AlertOctagon, FileCheck, CheckCircle2 } from 'lucide-react';

export default function SafetyRejection({ rejectionData, className = "" }) {
  if (!rejectionData) return null;

  const {
    proposed_action = "Debt Consolidation Loan (₹500,000 @ 14.5% for 60 months)",
    rule_id = "RULE_SC_402_ANTI_DEBT_ESCALATION",
    reason = "Rejected by safety check — consolidation would increase long-term debt cost and does not address the immediate cash-flow problem.",
    timestamp = "Automated Safety Filter Execution",
    severity = "HIGH_SAFETY_VIOLATION"
  } = rejectionData;

  return (
    <div className={`rounded-2xl p-6 border-2 border-rose-500/50 bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-950/90 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative overflow-hidden ${className}`}>
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>UNSAFE INTERVENTION REJECTED</span>
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>DebtWise Safety Engine v1.0</span>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-400">CANDIDATE CONSIDERED BY GENERATOR:</div>
            <h4 className="text-lg font-bold text-white line-through decoration-rose-500/70 decoration-2">
              {proposed_action}
            </h4>
          </div>
          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 text-xs font-mono font-bold border border-rose-500/40 shrink-0">
            {rule_id}
          </span>
        </div>

        {/* Safety Finding Rationale */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs text-rose-200/90 leading-relaxed">
          <div className="font-bold text-rose-300 mb-1 flex items-center gap-1.5 font-mono">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            SAFETY LAYER AUDIT FINDING:
          </div>
          <p>{reason}</p>
        </div>

        {/* Standout Takeaway footer */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            System automatically prunes unsafe options and serves safe alternatives.
          </span>
          <span className="font-mono text-slate-500">Logged to Compliance Audit Log</span>
        </div>
      </div>
    </div>

  );
}
