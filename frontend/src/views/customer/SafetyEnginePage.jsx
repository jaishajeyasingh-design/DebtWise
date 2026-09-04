import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, XCircle, CheckCircle2 } from 'lucide-react';
import SafetyRejection from '../../components/interventions/SafetyRejection';
import LLMExplanationCard from '../../components/common/LLMExplanationCard';

export default function SafetyEnginePage({ data, onBack, onNext }) {
  const rejection = data?.safety_rejection;
  const explanation = data?.llm_explanation;

  if (!data) {
    return (
      <div className="glass-panel rounded-2xl p-8 shadow-md">
        <span className="font-mono text-sm theme-text-secondary">
          Loading safety analysis...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-xl">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono text-rose-400 uppercase tracking-wider font-bold">
              Step 03 · DebtWise Safety Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black theme-text mt-1">
              Protecting the Customer from Unsafe Debt
            </h2>
            <p className="text-sm theme-text-secondary mt-2 max-w-2xl">
              Every generated intervention is checked against affordability,
              debt-burden, and responsible-lending constraints before it can be recommended.
            </p>
          </div>

          <div className="shrink-0 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold shadow-sm">
            SAFETY FILTER ACTIVE
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl theme-surface-muted theme-border shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-[10px] font-mono theme-text-muted uppercase font-bold">
              Guardrail
            </div>
            <div className="text-sm font-bold theme-text mt-1">
              Affordability Ceiling
            </div>
          </div>

          <div className="p-4 rounded-xl theme-surface-muted theme-border shadow-sm">
            <XCircle className="w-5 h-5 text-rose-400 mb-2" />
            <div className="text-[10px] font-mono theme-text-muted uppercase font-bold">
              Unsafe Options
            </div>
            <div className="text-sm font-bold theme-text mt-1">
              Rejected Before Recommendation
            </div>
          </div>

          <div className="p-4 rounded-xl theme-surface-muted theme-border shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-[10px] font-mono theme-text-muted uppercase font-bold">
              Principle
            </div>
            <div className="text-sm font-bold theme-text mt-1">
              Recovery Over More Debt
            </div>
          </div>
        </div>

        {rejection ? (
          <SafetyRejection rejectionData={rejection} />
        ) : (
          <div className="p-6 rounded-2xl theme-surface-muted theme-border text-center shadow-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold theme-text">
              No Unsafe Intervention Detected
            </h3>
            <p className="text-xs theme-text-secondary mt-2">
              All generated options passed the available institutional safety constraints.
            </p>
          </div>
        )}

        {explanation && (
          <div className="mt-6">
            <LLMExplanationCard
              explanation={explanation}
              mode="safety"
            />
          </div>
        )}

        <div className="mt-6 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-sm">
          <div className="text-xs font-mono text-rose-400 uppercase font-bold mb-2">
            Why this matters
          </div>
          <p className="text-sm theme-text-secondary leading-relaxed">
            DebtWise does not simply rank financial products by predicted usefulness.
            It can generate an option, test it against explicit safety rules,
            reject it when unsafe, and surface a safer alternative instead.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-mono theme-text-muted hover:theme-text flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Affordability
        </button>

        <button
          onClick={onNext}
          className="theme-primary-button px-6 py-3 rounded-xl font-bold text-xs font-mono flex items-center gap-2 transition cursor-pointer"
        >
          Continue to Interventions
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
