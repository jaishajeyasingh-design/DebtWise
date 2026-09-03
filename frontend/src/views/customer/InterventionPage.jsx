import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, UserCheck } from 'lucide-react';
import InterventionCard from '../../components/interventions/InterventionCard';

export default function InterventionPage({
  data,
  selectedIntervention,
  onSelect,
  onBack,
  onNext
}) {
  const interventions = data?.safe_interventions || [];
  const recommendation = data?.selected_intervention || data?.recommendation;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/10">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Step 04 · Safe Intervention Options
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Choose the Safest Effective Option
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              DebtWise presents only interventions that survived the safety filter.
              The customer remains in control of the final choice.
            </p>
          </div>

          <div className="shrink-0 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
            {interventions.length} SAFE OPTION{interventions.length === 1 ? '' : 'S'}
          </div>
        </div>

        {recommendation && (
          <div className="mb-6 p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300 uppercase">
                DebtWise Recommendation
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">
              {recommendation.name || recommendation.title || recommendation.label || 'Recommended intervention'}
            </h3>

            {recommendation.description && (
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {recommendation.description}
              </p>
            )}
          </div>
        )}

        {interventions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {interventions.map((intv) => (
              <InterventionCard
                key={intv.id}
                intervention={intv}
                isSelected={selectedIntervention?.id === intv.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <Shield className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-300">
              No intervention options are currently available.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <Shield className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Safety First
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              Unsafe options are removed before customer choice.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <UserCheck className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Customer Control
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              Consent is required before any action.
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Safety Engine
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
          Continue to Simulator
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
