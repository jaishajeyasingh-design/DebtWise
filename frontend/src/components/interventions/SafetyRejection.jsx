import React from 'react';
import {
  ShieldAlert,
  XCircle,
  AlertOctagon,
  FileCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  ShieldX
} from 'lucide-react';

const RULE_TITLES = {
  'SC-001': 'Safe EMI Capacity Constraint',
  'SC-002': 'Living Cost Floor Guardrail',
  'SC-003': 'DTI Debt Consolidation Ceiling',
  'SC-004': 'Anti-Predatory Borrowing Guard',
  'SC-005': 'Maximum Tenure Extension Limit',
  'SC-006': 'Step-Down Relief Feasibility Check',
  'SC-007': 'Mandatory Officer Approval Gate',
  'SC-008': 'Bureau Non-Reporting Guarantee'
};

export default function SafetyRejection({ rejectionData, className = "" }) {
  if (!rejectionData) return null;

  const proposed_action =
    rejectionData.proposed_action ||
    rejectionData.intervention_title ||
    "Debt Consolidation Loan (Additional Borrowing)";

  const rulesChecked = rejectionData.rules_checked || rejectionData.rules_violated || ['SC-001', 'SC-003', 'SC-004'];
  const rejectionReasons = rejectionData.rejection_reasons || [];
  const saferAlternative = rejectionData.safer_alternative;

  const mainReason =
    rejectionData.reason ||
    rejectionData.message ||
    (rejectionReasons.length > 0
      ? rejectionReasons.join(" ")
      : "Rejected by safety check because additional borrowing would escalate total debt burden beyond sustainable repayment capacity.");

  return (
    <div className={`rounded-3xl p-6 sm:p-7 border-2 border-rose-500/50 bg-linear-to-br from-rose-950/40 via-slate-900/90 to-slate-950/95 shadow-[0_0_35px_rgba(244,63,94,0.15)] relative overflow-hidden space-y-6 ${className}`}>
      {/* Top Banner Tag - Successful Safety Decision */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-rose-500/20">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold shadow-sm">
          <ShieldX className="w-4 h-4 text-rose-400 shrink-0" />
          <span>REJECTED BY SAFETY ENGINE</span>
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Institutional Safety Guardrails Enforced</span>
        </div>
      </div>

      {/* Candidate Considered & Struck Through */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          Proposed Candidate Evaluated by Decision Engine:
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <h4 className="text-lg font-bold text-slate-300 line-through decoration-rose-500 decoration-2">
              {proposed_action}
            </h4>
            <div className="text-xs text-rose-400 font-mono mt-0.5 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Status: BLOCKED BEFORE RECOMMENDATION TO CUSTOMER</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-mono font-bold border border-rose-500/40">
              UNSAFE CANDIDATE
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Guardrail Violation Rules */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-mono text-rose-300 uppercase font-bold flex items-center gap-1.5">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Violated Institutional Safety Rules:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {rulesChecked.map((rule, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex flex-col justify-between"
            >
              <div className="text-xs font-mono font-bold text-rose-300">{rule}</div>
              <div className="text-[11px] text-slate-300 mt-1">
                {RULE_TITLES[rule] || 'Institutional Safety Rule'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specific Safety Rule Violations & Audit Findings */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          Safety Layer Rejection Rationale:
        </div>

        {rejectionReasons.length > 0 ? (
          <div className="space-y-2">
            {rejectionReasons.map((r, rIdx) => (
              <div
                key={rIdx}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-200 leading-relaxed flex items-start gap-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-1.5"></div>
                <div className="flex-1">{r}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-200 leading-relaxed">
            {mainReason}
          </div>
        )}
      </div>

      {/* Pivoted Safer Alternative Card (Hero Responsible AI Moment) */}
      <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Safer Alternative Automatically Promoted</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
            NO NEW DEBT
          </span>
        </div>
        <p className="text-sm font-bold text-white">
          {typeof saferAlternative === 'string'
            ? saferAlternative
            : saferAlternative?.title || "Revolving Line Freeze & Fixed Avalanche Plan"}
        </p>
        <p className="text-slate-300 text-xs leading-relaxed">
          DebtWise prevented an unsafe debt escalation loan and promoted a structured, non-borrowing relief intervention instead.
        </p>
      </div>

      {/* Standout Takeaway Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>AI Prevented Harmful Recommendation • Logged to Immutable Audit Ledger</span>
        </span>
        <span className="font-mono text-slate-400 text-[11px]">
          Safety Check Status: PASS (BLOCKED)
        </span>
      </div>
    </div>
  );
}

