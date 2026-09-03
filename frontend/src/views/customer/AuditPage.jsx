import React from 'react';
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import AuditTimeline from '../../components/audit/AuditTimeline';

export default function AuditPage({ data, onBack }) {
  const audit = data?.audit_record || {};
  const events = data?.audit_events || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/20">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono text-blue-400 uppercase tracking-wider">
              Step 07 · Governance & Audit
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Decision Audit Trail
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Every important decision is recorded so the bank can explain what
              the system considered, rejected, recommended, and why.
            </p>
          </div>

          <div className="shrink-0 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs font-bold">
            AUDITABLE DECISION
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <FileText className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Audit ID
            </div>
            <div className="text-xs font-mono text-white mt-1 break-all">
              {audit.audit_id || 'Generated per decision'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Safety Rules
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {audit.safety_rules_evaluated ?? '—'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Candidates
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {audit.candidates_evaluated ?? '—'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-violet-400 mb-2" />
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Execution Barrier
            </div>
            <div className="text-xs font-semibold text-white mt-1">
              {audit.execution_barrier || 'Consent / approval gates enforced'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Model & Explainability
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Model</span>
                <span className="text-white font-mono">
                  {audit.model_version || 'XGBoost + SHAP'}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Feature / input trace</span>
                <span className="text-emerald-300 font-mono">
                  Recorded
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Decision explanation</span>
                <span className="text-emerald-300 font-mono">
                  Recorded
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Governance Controls
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Customer consent gate
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Human approval gate where required
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Unsafe intervention rejection
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Simulated execution only
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {events.length > 0 && (
        <AuditTimeline events={events} />
      )}

      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl text-xs font-mono text-slate-400 hover:text-white flex items-center gap-2 transition border border-slate-800 hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Consent & Recovery
        </button>
      </div>
    </div>
  );
}
