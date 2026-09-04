import React from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Sparkles
} from 'lucide-react';

/**
 * CustomerTradeoffsCard
 * Transparently presents the customer and bank trade-offs of proposed interventions.
 * Ensures customers and loan officers understand that relief/restructuring is not a free benefit.
 */
export default function CustomerTradeoffsCard({
  selectedIntervention = null,
  className = ""
}) {
  if (!selectedIntervention) return null;

  const interventionTitle = (selectedIntervention?.name || selectedIntervention?.title || selectedIntervention?.label || '').toLowerCase();
  const interventionType = (selectedIntervention?.intervention_type || '').toLowerCase();

  const isTimingOnly =
    Boolean(selectedIntervention?.is_timing) ||
    interventionType === 'salary_emi_date_synchronization' ||
    interventionType === 'timing_synchronization' ||
    interventionType === '7_day_grace_period_buffer' ||
    interventionType === 'timing_discrepancy_alert' ||
    interventionTitle.includes('due date shift') ||
    interventionTitle.includes('timing') ||
    interventionTitle.includes('grace period');

  return (
    <div className={`glass-panel rounded-2xl p-5 sm:p-6 border theme-border space-y-5 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b theme-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold theme-text">
              Customer Impact & Trade-offs
            </h4>
            <p className="text-[11px] theme-text-muted font-mono">
              Transparent terms, customer considerations, and recovery boundaries
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold">
          {isTimingOnly ? "TIMING ADJUSTMENT ONLY" : "RESTRUCTURING / RELIEF DISCLOSURE"}
        </span>
      </div>

      {/* Dual Perspective Grid: Customer Benefit vs Bank/Recovery Benefit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Customer Benefit */}
        <div className="p-4 rounded-xl theme-surface-muted theme-border space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
            <User className="w-3.5 h-3.5" />
            <span>Customer Benefit</span>
          </div>
          <p className="text-xs font-semibold theme-text">
            {isTimingOnly
              ? "Cash-flow timing alignment without altering total debt obligation"
              : "Lower immediate repayment pressure"}
          </p>
          <p className="text-[11px] theme-text-secondary leading-relaxed">
            {isTimingOnly
              ? "Aligns the deduction date to verified income receipt to prevent monthly overdraft penalties."
              : "Temporarily reduces monthly debt outflow so basic household necessities remain protected."}
          </p>
        </div>

        {/* Bank / Recovery Benefit */}
        <div className="p-4 rounded-xl theme-surface-muted theme-border space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank / Recovery Benefit</span>
          </div>
          <p className="text-xs font-semibold theme-text">
            Higher probability of sustainable repayment and reduced default risk
          </p>
          <p className="text-[11px] theme-text-secondary leading-relaxed">
            {isTimingOnly
              ? "Eliminates preventable timing defaults while keeping full loan cash-flows on schedule."
              : "Enables orderly loan servicing over time rather than premature credit impairment or write-off."}
          </p>
        </div>
      </div>

      {/* Detailed Benefits vs Trade-offs Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Potential Benefits */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>Potential Benefits</span>
          </div>
          <ul className="space-y-2 text-xs theme-text-secondary">
            {isTimingOnly ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <span><strong>Cash-flow timing alignment:</strong> Synchronizes repayment with verified salary arrival.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <span><strong>Overdraft protection:</strong> Eliminates recurring debit bounce and late penalty fees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <span><strong>Zero obligation change:</strong> Monthly EMI amount and total repayment remain unchanged.</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <span><strong>Lower short-term repayment pressure:</strong> Drops installment obligation to safe disposable capacity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <span><strong>Protect essential living expenses:</strong> Safeguards non-negotiable food, medical, and family shelter needs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <span><strong>Reduce immediate default pressure:</strong> Provides breathing room to stabilize finances without distress escalation.</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Potential Trade-offs / Considerations */}
        <div className={`p-4 rounded-xl border space-y-2.5 ${
          isTimingOnly
            ? "bg-blue-500/5 border-blue-500/20"
            : "bg-amber-500/5 border-amber-500/20"
        }`}>
          <div className={`flex items-center gap-2 font-mono font-bold text-xs uppercase ${
            isTimingOnly ? "text-blue-400" : "text-amber-400"
          }`}>
            {isTimingOnly ? <Clock className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{isTimingOnly ? "Timing Terms & Parameters" : "Potential Trade-offs"}</span>
          </div>
          <ul className="space-y-2 text-xs theme-text-secondary">
            {isTimingOnly ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
                  <span><strong>EMI amount unchanged:</strong> This intervention does not reduce or write off principal or interest.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
                  <span><strong>Repayment obligation remains:</strong> Customer must ensure funds are maintained on the adjusted date.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
                  <span><strong>No tenure extension:</strong> Loan maturity date remains unaffected by calendar adjustment.</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                  <span><strong>Tenure may increase:</strong> Loan repayment horizon may be extended depending on approved terms.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                  <span><strong>Total interest paid may increase:</strong> Longer repayment horizons can increase cumulative interest cost.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                  <span><strong>Credit-report / CIBIL treatment:</strong> Reporting depends on lender policy and bureau guidelines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                  <span><strong>No guaranteed outcome:</strong> No guaranteed improvement or protection of credit score is provided.</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Governance & Policy Disclosure Footer */}
      <div className="p-3.5 rounded-xl theme-surface-muted theme-border space-y-1.5 text-[11px] theme-text-muted leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold theme-text text-xs">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Governance & Regulatory Disclosures</span>
        </div>
        <div className="space-y-1 pl-5">
          <p>• Potential trade-offs depend on the final terms approved by the bank.</p>
          <p>• Credit-report treatment depends on lender and bureau reporting.</p>
          <p>• FinShield does not guarantee a particular credit-score outcome.</p>
          <p>• Decision models evaluate repayment feasibility; they do not by themselves cause financial recovery.</p>
        </div>
      </div>
    </div>
  );
}
