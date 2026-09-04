import React from 'react';
import { Check, Shield, Clock, AlertCircle, ArrowRight, UserCheck, Star, Sparkles, Info } from 'lucide-react';
import RiskBadge from '../common/RiskBadge';

export default function InterventionCard({
  intervention,
  capacity = null,
  isSelected = false,
  onSelect,
  showAction = true,
  className = ""
}) {
  if (!intervention) return null;

  const {
    id = "",
    title,
    level,
    level_name,
    badge,
    tier,
    tier_description,
    summary,
    impact,
    reversibility,
    monthly_payment_after,
    duration_months,
    is_recommended,
    intervention_type = ""
  } = intervention;

  const currentObligation = Number(capacity?.current_obligations || 0);
  const safeCapacity = Number(capacity?.safe_emi || 0);
  const monthlyRelief = Number(intervention.estimated_monthly_relief ?? intervention.monthly_relief ?? (currentObligation > monthly_payment_after ? currentObligation - monthly_payment_after : 0));
  const postEmi = Number(monthly_payment_after > 0 ? monthly_payment_after : safeCapacity);

  const isTenureApplicable =
    id.includes('TEMP-EMI') ||
    id.includes('RESTRUCTURING') ||
    id.includes('TENOR') ||
    intervention_type.includes('EMI_REDUCTION') ||
    intervention_type.includes('TENOR') ||
    intervention_type.includes('RESTRUCTURING');

  return (
    <div
      className={`glass-panel rounded-2xl p-6 border transition-all duration-300 relative flex flex-col justify-between ${
        is_recommended
          ? "border-cyan-500/50 bg-slate-900/80 shadow-[0_0_25px_rgba(0,240,255,0.12)]"
          : "border-slate-700/60 bg-slate-900/50 hover:border-slate-600"
      } ${isSelected ? "ring-2 ring-cyan-400 border-cyan-400" : ""} ${className}`}
    >
      {/* Recommended Top Badge */}
      {is_recommended && (
        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 text-slate-950 font-mono text-[11px] font-bold tracking-wider flex items-center gap-1 shadow-md">
          <Star className="w-3 h-3 fill-current" />
          <span>DEBTWISE RECOMMENDED</span>
        </div>
      )}

      <div>
        {/* Level & Tier Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 mt-1">
          <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
            {level} • {level_name}
          </span>
          <RiskBadge type="tier" value={tier} />
        </div>

        {/* Title */}
        <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">{summary}</p>

        {/* Dynamic 3-Step Affordability Transition Flow (Current EMI -> Sustainable EMI -> Monthly Relief) */}
        {currentObligation > 0 && (
          <div className="grid grid-cols-3 gap-2 p-3 my-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">CURRENT EMI</span>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                ₹{Math.round(currentObligation).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="border-x border-slate-800/80">
              <span className="text-[9px] text-cyan-400 uppercase block">SUSTAINABLE CAPACITY</span>
              <span className="text-xs sm:text-sm font-bold text-cyan-300">
                ₹{Math.round(safeCapacity).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-emerald-400 uppercase block">MONTHLY RELIEF</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-300">
                {monthlyRelief > 0 ? `+₹${Math.round(monthlyRelief).toLocaleString('en-IN')}` : 'Timing Fix'}
              </span>
            </div>
          </div>
        )}

        {/* Responsible Finance Commitments & Notes */}
        <div className="space-y-1 my-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-300 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Repayment to bank continues uninterrupted</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>No additional borrowing introduced</span>
          </div>
          {isTenureApplicable && (
            <div className="flex items-center gap-1.5 text-amber-300 pt-0.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Note: Loan tenure may increase to absorb payment reduction</span>
            </div>
          )}
        </div>

        {/* Separate Intervention Components (if multi-action) */}
        {intervention.components && intervention.components.length > 0 && (
          <div className="space-y-2.5 my-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
              Separate Intervention Components:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {intervention.components.map((comp, cIdx) => (
                <div key={cIdx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      {comp.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {comp.type}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{comp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval Policy Condition Note */}
        {intervention.policy_note && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-mono mb-3 flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Approval Policy: </span>
              {intervention.policy_note}
            </div>
          </div>
        )}

        {/* Impact & Reversibility Metrics */}
        <div className="space-y-2 py-3 border-y border-slate-800/80 my-3 text-xs">
          <div className="flex items-start gap-2 text-slate-300">
            <span className="text-emerald-400 font-bold shrink-0">✔ Financial Impact:</span>
            <span>{impact}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Reversibility: <strong className="text-slate-200">{reversibility}</strong></span>
          </div>
          {duration_months > 0 && (
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Duration: <strong className="text-slate-200">{duration_months} Months Relief Period</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Pricing & Action */}
      <div className="mt-2 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase">MONTHLY OBLIGATION AFTER:</div>
          <div className="text-2xl font-mono font-black text-emerald-400">
            {postEmi > 0 ? `₹${Math.round(postEmi).toLocaleString('en-IN')}` : "Custom Case Review"}
            {postEmi > 0 && <span className="text-xs font-normal text-slate-400 font-sans"> / mo</span>}
          </div>
        </div>

        {showAction && (
          <button
            onClick={() => onSelect && onSelect(intervention)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              is_recommended
                ? "bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            }`}
          >
            <span>{isSelected ? "Selected Option" : is_recommended ? "Choose Recommended" : "Select Alternative"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

