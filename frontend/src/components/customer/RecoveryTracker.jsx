import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Activity,
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  TrendingDown,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../api/mockApi';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const point = payload[0]?.payload;
    return (
      <div className="p-3.5 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl text-xs font-mono space-y-1.5 min-w-[200px]">
        <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
          <span>{label}</span>
          <span className="text-slate-400 text-[10px]">{point?.status_label}</span>
        </div>
        <div className="text-rose-400 flex justify-between">
          <span>Stress Index:</span>
          <strong>{point?.stress_index}%</strong>
        </div>
        <div className="text-emerald-400 flex justify-between">
          <span>Savings Reserve:</span>
          <strong>₹{Number(point?.savings_balance || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="text-cyan-300 flex justify-between">
          <span>Scheduled EMI:</span>
          <strong>₹{Number(point?.scheduled_emi || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="text-slate-400 flex justify-between text-[11px] pt-0.5 border-t border-slate-800/80">
          <span>DTI Ratio:</span>
          <span>{point?.dti_percent}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const SCENARIO_LABELS = [
  { id: 'ADHERENT_RECOVERY', label: 'Expected Adherence', badge: 'Optimal Recovery', color: 'emerald' },
  { id: 'STAGNANT_DEFICIT', label: 'Stagnant Deficit', badge: 'Expense Friction', color: 'amber' },
  { id: 'SECONDARY_SHOCK', label: 'Secondary Shock Test', badge: 'Stress Test Trigger', color: 'rose' }
];

export default function RecoveryTracker({
  customer = null,
  initialSimulation = null,
  className = ""
}) {
  const [scenario, setScenario] = useState('ADHERENT_RECOVERY');
  const [horizonMonths, setHorizonMonths] = useState(6);
  const [simulation, setSimulation] = useState(initialSimulation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rawInput = customer?.raw_customer_input || customer;
  const selectedInterventionId = customer?.selected_intervention?.id || null;

  useEffect(() => {
    if (rawInput && rawInput.income) {
      loadSimulation();
    }
  }, [scenario, horizonMonths, customer?.customer_id]);

  const loadSimulation = async () => {
    if (!rawInput || !rawInput.income) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.simulateRecovery({
        customerInput: rawInput,
        selectedInterventionId: selectedInterventionId,
        horizonMonths: horizonMonths,
        scenario: scenario
      });
      setSimulation(res);
    } catch (err) {
      console.error('Failed to load recovery simulation:', err);
      setError(err.message || 'Failed to simulate recovery trajectory');
    } finally {
      setLoading(false);
    }
  };

  const delta = simulation?.delta;
  const trajectory = simulation?.trajectory || [];

  return (
    <div className={`glass-panel rounded-2xl p-6 border border-slate-700/60 space-y-6 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Closed-Loop Recovery & Re-Scoring Engine
          </div>
          <h4 className="text-lg font-bold text-white mt-0.5">
            Post-Intervention Telemetry & Recovery Trajectory
          </h4>
        </div>

        {/* Horizon selector */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-900/80 p-1 border border-slate-800 text-xs font-mono">
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                onClick={() => setHorizonMonths(m)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  horizonMonths === m
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>

          <button
            onClick={loadSimulation}
            disabled={loading}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition"
            title="Re-run Simulation"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-900/70 border border-slate-800">
        {SCENARIO_LABELS.map((sc) => {
          const active = scenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setScenario(sc.id)}
              className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-mono transition text-left ${
                active
                  ? 'bg-slate-800 border border-slate-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div>
                <div className="font-bold text-slate-200">{sc.label}</div>
                <div className="text-[10px] text-slate-400">{sc.badge}</div>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  sc.color === 'emerald'
                    ? 'bg-emerald-400'
                    : sc.color === 'amber'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              ></span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row (Before vs. After Delta) */}
      {delta && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Card 1: Stress Reduction */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">PROJECTED STRESS</div>
            <div className="text-xl font-mono font-bold text-white mt-1 flex items-baseline gap-1.5">
              <span className="text-slate-400 line-through text-sm">{delta.baseline_stress_index.toFixed(0)}%</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className={delta.stress_reduction_percent > 20 ? "text-emerald-400" : "text-rose-400"}>
                {delta.post_intervention_stress_index.toFixed(0)}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {delta.stress_reduction_percent >= 0 ? `-${delta.stress_reduction_percent.toFixed(0)}% decrease` : `+${Math.abs(delta.stress_reduction_percent).toFixed(0)}% increase`}
            </div>
          </div>

          {/* Card 2: Savings Buffer */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">SAVINGS RESERVE</div>
            <div className="text-xl font-mono font-bold text-white mt-1 flex items-baseline gap-1.5">
              <span className="text-slate-400 text-xs">₹{(delta.baseline_savings / 1000).toFixed(0)}k</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-cyan-400">₹{(delta.post_intervention_savings / 1000).toFixed(0)}k</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {delta.savings_growth_amount >= 0 ? `+₹${delta.savings_growth_amount.toLocaleString('en-IN')} rebuilt` : `-₹${Math.abs(delta.savings_growth_amount).toLocaleString('en-IN')} drawn`}
            </div>
          </div>

          {/* Card 3: Monthly Obligation Relief */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">SCHEDULED EMI</div>
            <div className="text-xl font-mono font-bold text-white mt-1 flex items-baseline gap-1.5">
              <span className="text-slate-400 text-xs">₹{(delta.baseline_obligations / 1000).toFixed(0)}k</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-emerald-400">₹{(delta.post_intervention_obligations / 1000).toFixed(0)}k</span>
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-0.5">
              ₹{delta.monthly_relief_amount.toLocaleString('en-IN')}/mo cash relief
            </div>
          </div>

          {/* Card 4: XGBoost Re-Scoring Status */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">RE-SCORED DIAGNOSIS</div>
            <div className="text-sm font-mono font-bold text-white mt-1 truncate">
              {delta.post_intervention_diagnosis.replace('_', ' ')}
            </div>
            <div className="text-[11px] text-cyan-400 mt-0.5">
              Status: <strong>{simulation.recovery_status.replace('_', ' ')}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Recharts Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
            <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
            <Tooltip content={<CustomTooltip />} />

            {/* Stress Index Area */}
            <Area
              type="monotone"
              dataKey="stress_index"
              name="Stress Index"
              stroke="#F43F5E"
              strokeWidth={2.5}
              fill="rgba(244, 63, 94, 0.15)"
            />

            {/* Savings Buffer Line */}
            <Line
              type="monotone"
              dataKey="savings_balance"
              name="Savings Reserve (₹)"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4, fill: '#10B981' }}
            />

            {/* Scheduled EMI Line */}
            <Line
              type="stepAfter"
              dataKey="scheduled_emi"
              name="Monthly EMI"
              stroke="#00F0FF"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Adaptation Trigger Banner */}
      {simulation?.is_adaptation_required && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ADAPTIVE INTERVENTION LADDER TRIGGERED (Closed-Loop Feedback)</span>
          </div>
          <p className="text-amber-200/90 leading-relaxed text-[11px]">
            Simulation telemetry detected persistent distress or a secondary shock scenario. The recovery engine automatically re-evaluated the post-intervention state through the Decision Engine.
          </p>
          {simulation.adapted_decision && (
            <div className="p-3 rounded-lg bg-slate-950/80 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-slate-400 text-[10px] block">PROPOSED ADAPTED INTERVENTION:</span>
                <span className="text-white font-bold text-xs">{simulation.adapted_decision.selected_intervention?.title || "Specialist Hardship Review"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px]">
                  {simulation.adapted_decision.tier}
                </span>
                <span className="text-slate-400 text-[10px]">
                  {simulation.adapted_decision.human_approval_required ? "Bank Officer Authorization Required" : "Auto-Executable"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Narrative Explanation */}
      {simulation?.narrative_summary && (
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5 font-mono text-[11px]">Telemetry Trajectory Summary</span>
            {simulation.narrative_summary}
          </div>
        </div>
      )}

      {/* Legend & Transparent Simulation Disclaimer */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Stress Index (%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Savings (₹)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Scheduled EMI (₹)</span>
        </div>
        <div className="text-amber-400/90 text-[11px] flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{simulation?.disclaimer || "SIMULATED ESTIMATE — NOT A GUARANTEED OUTCOME."}</span>
        </div>
      </div>
    </div>
  );
}
