import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Info,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

/**
 * LLMExplanationCard
 * Presentation-only component displaying customer-friendly, empathetic natural language explanations
 * generated post-decision. Never alters any underlying financial numbers or governance gates.
 *
 * @param {Object} props
 * @param {Object} props.explanation - ExplanationResponse object from backend /explain
 * @param {string} props.mode - 'full' | 'diagnosis' | 'affordability' | 'safety' | 'intervention' | 'simulator' | 'consent'
 * @param {string} props.title - Optional custom title override
 * @param {boolean} props.collapsible - Whether the card can be toggled open/closed
 */
export default function LLMExplanationCard({
  explanation,
  mode = 'full',
  title,
  collapsible = false,
  className = '',
  selectedIntervention = null,
  monthlyRelief = null
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!explanation) return null;

  const isFallback = explanation.metadata?.fallback_used ?? true;
  const providerLabel = isFallback
    ? 'Deterministic Explanation Engine'
    : `AI Narrative • ${explanation.metadata?.model || 'Claude'}`;

  // Step-specific targeted views
  if (mode === 'diagnosis') {
    return (
      <div className={`p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-slate-200 ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                {title || "Why You're Seeing This"}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            {providerLabel}
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed mt-2">
          {explanation.why_this_happened || explanation.summary}
        </p>

        <div className="mt-3 pt-3 border-t border-cyan-500/10 flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>This explanation is generated from structured facts to help you understand your financial pattern.</span>
        </div>
      </div>
    );
  }

  if (mode === 'affordability') {
    return (
      <div className={`p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-slate-200 ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                {title || 'Understanding Your Affordability Floor'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {providerLabel}
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed mt-2">
          {explanation.affordability_context ||
            'DebtWise establishes a non-negotiable living cost floor to ensure your basic necessities are permanently safeguarded.'}
        </p>
      </div>
    );
  }

  if (mode === 'safety') {
    return (
      <div className={`p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-slate-200 ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                {title || 'Why Risky Options Were Rejected'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {providerLabel}
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed mt-2">
          {explanation.why_this_option_is_safer}
        </p>

        <div className="mt-3 pt-3 border-t border-rose-500/10 flex items-center gap-2 text-xs text-rose-300/80">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>The safety filter prevents taking on new debt when existing capacity is constrained.</span>
        </div>
      </div>
    );
  }

  if (mode === 'intervention') {
    return (
      <div className={`p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-slate-200 ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                {title || 'Recommended Pathway'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            {providerLabel}
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed mt-2">
          {explanation.what_we_can_do}
        </p>
      </div>
    );
  }

  if (mode === 'simulator') {
    const interventionTitle = (selectedIntervention?.name || selectedIntervention?.title || selectedIntervention?.label || '').toLowerCase();
    const interventionType = (selectedIntervention?.intervention_type || '').toLowerCase();
    const explanationText = (explanation.what_we_can_do || explanation.summary || '');
    const isTimingIntervention =
      monthlyRelief === 0 ||
      interventionType.includes('timing') ||
      interventionTitle.includes('due date shift') ||
      interventionTitle.includes('timing') ||
      explanationText.toLowerCase().includes('due date shift') ||
      explanationText.toLowerCase().includes('timing synchronization');

    const displaySummary = isTimingIntervention && (monthlyRelief === 0 || monthlyRelief === null)
      ? "This intervention does not reduce the EMI amount. Instead, it shifts the repayment date into the customer's verified post-salary window, reducing cash-flow timing pressure while keeping the repayment obligation unchanged."
      : (explanation.what_we_can_do || explanation.summary);

    return (
      <div className={`p-5 rounded-2xl bg-violet-950/20 border border-violet-500/30 text-slate-200 ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
                {title || 'Understanding This Scenario'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
            {providerLabel}
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed mt-2">
          {displaySummary}
        </p>

        <div className="mt-3 pt-3 border-t border-violet-500/10 text-xs text-slate-400">
          {explanation.disclaimer}
        </div>
      </div>
    );
  }

  if (mode === 'consent') {
    return (
      <div className={`p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-slate-200 ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                {title || 'Your Rights & Explicit Consent'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {providerLabel}
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed mt-2">
          {explanation.customer_message}
        </p>

        <div className="mt-3 pt-3 border-t border-emerald-500/10 text-xs text-slate-400">
          {explanation.disclaimer}
        </div>
      </div>
    );
  }

  // Full composite mode
  return (
    <div className={`glass-panel rounded-3xl p-6 border border-cyan-500/30 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950/20 shadow-xl ${className}`}>
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{title || 'AI Decision Narrative & Context'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Plain-English explanation of the underlying decision engine evaluation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            {providerLabel}
          </span>
          {collapsible && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-5 space-y-4 text-sm animate-fadeIn">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">
              Decision Summary
            </div>
            <p className="text-slate-200 leading-relaxed">
              {explanation.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Why this happened */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-[10px] font-mono text-amber-400 uppercase font-bold mb-1 flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Root Cause Context</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {explanation.why_this_happened}
              </p>
            </div>

            {/* Why safer */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-[10px] font-mono text-rose-400 uppercase font-bold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Safety Guardrails</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {explanation.why_this_option_is_safer}
              </p>
            </div>
          </div>

          {/* What we can do */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold mb-1 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Recommended Safe Pathway</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {explanation.what_we_can_do}
            </p>
          </div>

          {/* Customer Message & Disclaimer */}
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
            <div className="text-cyan-300 font-bold mb-1">
              Your Control & Rights:
            </div>
            <p className="mb-2">
              {explanation.customer_message}
            </p>
            <div className="text-[11px] text-slate-400 italic pt-2 border-t border-cyan-500/10">
              {explanation.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
