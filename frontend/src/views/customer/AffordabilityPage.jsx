import React from 'react';
import { ArrowLeft, ArrowRight, Shield, Wallet } from 'lucide-react';
import CapacityCard from '../../components/capacity/CapacityCard';
import LLMExplanationCard from '../../components/common/LLMExplanationCard';

export default function AffordabilityPage({ data, onBack, onNext }) {
  if (!data) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 shadow-md">
        <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
          Loading affordability analysis...
        </span>
      </div>
    );
  }

  const capacity = data.capacity || {};
  const safeEmi = Number(capacity.safe_emi ?? 0);
  const explanation = data.llm_explanation;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-emerald-500/30 bg-white/95 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 shadow-xl">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
              Step 02 · Affordability Floor
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              What Can You Realistically Afford?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              DebtWise calculates a sustainable repayment boundary before considering relief options.
            </p>
          </div>

          <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-sm">
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
              Sustainable EMI
            </div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
              ₹{safeEmi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo
            </div>
          </div>
        </div>

        <CapacityCard customer={data} />

        {explanation && (
          <div className="mt-6">
            <LLMExplanationCard
              explanation={explanation}
              mode="affordability"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
                Current Position
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              Current obligations are compared against income, essential expenses,
              and the customer's available financial buffer.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-slate-950/80 border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold">
                Protection Boundary
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              DebtWise will not recommend a recovery option that requires repayment
              above the calculated sustainable capacity.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
          <strong className="text-slate-900 dark:text-white">Important:</strong>{' '}
          This is a deterministic affordability estimate based on the customer's
          financial profile. It is a protection boundary, not a guarantee of future income.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Diagnosis
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
        >
          Continue to Safety Engine
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
