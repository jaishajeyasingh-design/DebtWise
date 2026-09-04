import React from 'react';
import { ArrowLeft, ArrowRight, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import LLMExplanationCard from '../../components/common/LLMExplanationCard';

export default function WhatIfPage({ data, selectedIntervention, onBack, onNext }) {
  const capacity = data?.capacity || {};
  const currentEmi = Number(capacity.current_obligations ?? capacity.current_emi ?? 0);
  const safeEmi = Number(capacity.safe_emi ?? 0);
  const explanation = data?.llm_explanation;

  const proposedEmi = Number(
    selectedIntervention?.estimated_emi_after ??
    selectedIntervention?.post_intervention_emi ??
    safeEmi
  );

  const monthlyRelief = Math.max(0, currentEmi - proposedEmi);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-violet-500/30 bg-linear-to-br from-slate-950 via-slate-900 to-violet-950/20">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono text-violet-400 uppercase tracking-wider">
              Step 05 · What-If Simulator
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              See the Recovery Impact
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Explore how a selected intervention could change the customer's
              repayment pressure and monthly cash-flow position.
            </p>
          </div>

          <div className="shrink-0 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 font-mono text-xs">
            SIMULATED ESTIMATE
          </div>
        </div>

        {selectedIntervention ? (
          <>
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
              <div className="text-[10px] font-mono text-slate-500 uppercase">
                Selected Intervention
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {selectedIntervention.name ||
                  selectedIntervention.title ||
                  selectedIntervention.label ||
                  'Selected intervention'}
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                {selectedIntervention.description ||
                  'Scenario generated from the selected DebtWise intervention.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase">
                  Current EMI
                </div>
                <div className="text-2xl font-black text-white mt-2">
                  ₹{currentEmi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-violet-500/20">
                <div className="text-[10px] font-mono text-violet-400 uppercase">
                  Simulated EMI
                </div>
                <div className="text-2xl font-black text-violet-300 mt-2">
                  ₹{proposedEmi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/20">
                <div className="text-[10px] font-mono text-emerald-400 uppercase">
                  Monthly Relief
                </div>
                <div className="text-2xl font-black text-emerald-300 mt-2">
                  ₹{monthlyRelief.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {explanation && (
              <div className="mt-6">
                <LLMExplanationCard
                  explanation={explanation}
                  mode="simulator"
                />
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <SlidersHorizontal className="w-5 h-5 text-violet-400" />
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    Scenario
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The simulator re-runs the affordability logic using the
                  hypothetical post-intervention values.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400 uppercase">
                    Safety Boundary
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Sustainable EMI boundary:{' '}
                  <strong className="text-emerald-300">
                    ₹{safeEmi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo
                  </strong>
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-slate-300 leading-relaxed">
              <strong className="text-violet-300">Important:</strong>{' '}
              This is a simulated estimate, not a guaranteed outcome. Actual
              repayment, income, expenses, and customer circumstances may differ.
            </div>
          </>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <SlidersHorizontal className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-300">
              Select an intervention first to explore its simulated impact.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interventions
        </button>

        <button
          onClick={onNext}
          disabled={!selectedIntervention}
          className={`px-6 py-3 rounded-xl font-bold text-xs font-mono flex items-center gap-2 transition ${
            selectedIntervention
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Continue to Consent & Recovery
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
