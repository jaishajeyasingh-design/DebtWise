import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart
} from 'recharts';
import { Activity, ShieldCheck, TrendingDown, HeartHandshake, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-700 shadow-xl text-xs font-mono">
        <div className="text-cyan-400 font-bold mb-1">{label}</div>
        <div className="text-rose-400">Stress Index: <strong>{payload[0]?.value}%</strong></div>
        <div className="text-emerald-400">Savings Buffer: <strong>₹{payload[1]?.value?.toLocaleString('en-IN')}</strong></div>
        <div className="text-slate-300">EMI Scheduled: <strong>₹{payload[2]?.value?.toLocaleString('en-IN')}</strong></div>
      </div>
    );
  }
  return null;
};

export default function RecoveryTracker({ projectionData = [], className = "" }) {
  const data = projectionData.length > 0 ? projectionData : [
    { month: "Current (M0)", stress: 88, balance: 10000, emi_paid: 25000, status: "Acute Shock" },
    { month: "Month 1", stress: 45, balance: 18000, emi_paid: 15000, status: "Relief Active" },
    { month: "Month 2", stress: 38, balance: 27000, emi_paid: 15000, status: "Buffer Rebuilding" },
    { month: "Month 3", stress: 30, balance: 36000, emi_paid: 15000, status: "Stabilized" },
    { month: "Month 4", stress: 24, balance: 44000, emi_paid: 25000, status: "Normalized EMI" },
    { month: "Month 6", stress: 18, balance: 58000, emi_paid: 25000, status: "Fully Recovered" }
  ];

  return (
    <div className={`glass-panel rounded-2xl p-6 border border-slate-700/60 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Dynamic Telemetry & Telehealth
          </div>
          <h4 className="text-lg font-bold text-white mt-0.5">Post-Intervention Recovery Trajectory</h4>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Active Telemetry Monitoring</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        Continuous financial telemetry tracking the projected decline in financial distress as liquid buffers normalize.
      </p>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">PROJECTED STRESS REDUCTION</div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">88% ➔ 18%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">-70% financial stress decrease</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">REBUILT SAVINGS BUFFER</div>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-0.5">₹10k ➔ ₹58k</div>
          <div className="text-[11px] text-slate-400 mt-0.5">+₹48,000 emergency fund replenishment</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">RECOVERY HORIZON</div>
          <div className="text-xl font-mono font-bold text-white mt-0.5">6 Months</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Full return to baseline on-time status</div>
        </div>
      </div>

      {/* Interactive Recharts Trajectory */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
            <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Stress Index Area (Red/Purple gradient) */}
            <Area
              type="monotone"
              dataKey="stress"
              name="Stress Index"
              stroke="#F43F5E"
              strokeWidth={2.5}
              fill="rgba(244, 63, 94, 0.15)"
            />
            
            {/* Savings Buffer Line (Emerald) */}
            <Line
              type="monotone"
              dataKey="balance"
              name="Savings Buffer (₹)"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4, fill: '#10B981' }}
            />

            {/* Scheduled EMI Line (Cyan) */}
            <Line
              type="stepAfter"
              dataKey="emi_paid"
              name="Monthly EMI"
              stroke="#00F0FF"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Disclaimer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Stress %</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Savings Rebuilt (₹)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Monthly EMI (₹)</span>
        </div>
        <div className="text-amber-400/90 text-[11px]">
          ⚠ Simulated estimate — not a guaranteed outcome.
        </div>
      </div>
    </div>
  );
}
