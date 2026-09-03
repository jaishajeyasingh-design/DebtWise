import React from 'react';
import { Activity, ShieldCheck, ShieldAlert, FileText, CheckCircle2, UserCheck, Clock } from 'lucide-react';

const EVENT_TYPE_META = {
  TELEMETRY_TRIGGER: { icon: Activity, color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
  ML_DIAGNOSIS: { icon: ShieldCheck, color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/30" },
  CAPACITY_CALC: { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  SAFETY_FILTER: { icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/30" },
  PLAN_PACKAGED: { icon: UserCheck, color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  CUSTOMER_CONSENT: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" }
};

export default function AuditTimeline({ events = [], className = "" }) {
  if (!events || events.length === 0) return null;

  return (
    <div className={`glass-panel rounded-2xl p-6 border border-slate-700/60 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Compliance & Fair Lending Ledger
          </div>
          <h4 className="text-lg font-bold text-white mt-0.5">Immutable Decision Audit Trail</h4>
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Audit-Ready Event Log</span>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
        {events.map((evt, idx) => {
          const meta = EVENT_TYPE_META[evt.type] || EVENT_TYPE_META.TELEMETRY_TRIGGER;
          const IconComponent = meta.icon;

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Timeline Node Dot */}
              <div className={`absolute -left-[33px] top-0.5 w-7 h-7 rounded-full ${meta.bg} border ${meta.border} flex items-center justify-center`}>
                <IconComponent className={`w-3.5 h-3.5 ${meta.color}`} />
              </div>

              {/* Event Content Card */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 group-hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {evt.title}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {evt.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evt.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
