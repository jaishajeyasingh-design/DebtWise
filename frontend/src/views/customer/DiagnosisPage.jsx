import React from 'react';
import { ArrowLeft, ArrowRight, BrainCircuit } from 'lucide-react';
import DistressDiagnosis from '../../components/diagnosis/DistressDiagnosis';
import SHAPFactors from '../../components/diagnosis/SHAPFactors';
import LLMExplanationCard from '../../components/common/LLMExplanationCard';

export default function DiagnosisPage({ data, onBack, onNext }) {
  const diagnosis = data?.diagnosis;
  const explanation = data?.llm_explanation;

  if (!diagnosis) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-700/60 bg-slate-900/60">
        <div className="flex items-center gap-3 text-slate-300">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <span className="font-mono text-sm">Loading AI diagnosis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Step 01 · Root-Cause Transparency
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Why We Are Concerned
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              DebtWise identifies the likely source of financial distress before selecting an intervention.
            </p>
          </div>

          <div className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
            AI Match: {(Number(diagnosis.confidence || 0) * 100).toFixed(1)}%
          </div>
        </div>

        <DistressDiagnosis
          diagnosis={diagnosis}
          showProbabilities={false}
        />

        {explanation && (
          <div className="mt-6">
            <LLMExplanationCard
              explanation={explanation}
              mode="diagnosis"
            />
          </div>
        )}

        <div className="my-8 border-t border-slate-800 pt-6">
          <SHAPFactors factors={diagnosis.top_factors || []} />
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Decision principle:</strong>{' '}
          Diagnosis explains the customer's financial stress; it does not by itself determine the intervention.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition shadow-[0_0_15px_rgba(0,240,255,0.25)]"
        >
          Continue to Affordability
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
