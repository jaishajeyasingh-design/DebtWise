import React from 'react';
import { Calculator, ShieldCheck, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';

export default function CapacityCard({ customer, className = "" }) {
  if (!customer) return null;

  const income = customer.current_monthly_income || 60000;
  const livingFloor = customer.living_cost_floor || 35000;
  const buffer = customer.emergency_buffer || 10000;
  const sustainableCapacity = customer.sustainable_repayment_capacity || 15000;
  const currentObligations = customer.current_obligations || 25000;
  const monthlyDeficit = currentObligations - sustainableCapacity;

  return (
    <div className={`glass-panel rounded-2xl p-6 border border-slate-700/60 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Deterministic Capacity Engine
          </div>
          <h4 className="text-lg font-bold text-white mt-0.5">Sustainable Repayment Affordability</h4>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Rule-Based Math</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        Calculated using transparent living expense floors and non-negotiable living baselines. <strong>Not an opaque ML prediction.</strong>
      </p>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Current Obligations */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/30 relative overflow-hidden">
          <div className="text-xs font-mono text-rose-300 uppercase">Current Obligations</div>
          <div className="text-2xl font-mono font-black text-rose-400 mt-1">
            ₹{currentObligations.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-400 font-sans"> / mo</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Home loan EMI + cards</div>
          <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Sustainable Capacity */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/40 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.08)]">
          <div className="text-xs font-mono text-emerald-300 uppercase">Sustainable Capacity</div>
          <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
            ₹{sustainableCapacity.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-400 font-sans"> / mo</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Calculated safe payment floor</div>
          <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Monthly Affordability Deficit */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 relative overflow-hidden">
          <div className="text-xs font-mono text-amber-300 uppercase">Monthly Cash Deficit</div>
          <div className="text-2xl font-mono font-black text-amber-400 mt-1">
            -₹{monthlyDeficit.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-400 font-sans"> / mo</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Unfunded obligation gap</div>
          <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Calculator className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Breakdown Equation Bar */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <div className="text-xs font-mono text-slate-400 mb-2">TRANSPARENT AFFORDABILITY FORMULA:</div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-200">
          <span className="px-2.5 py-1 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Income: ₹{income.toLocaleString('en-IN')}
          </span>
          <span className="text-slate-500 font-bold">−</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Essential Living Floor: ₹{livingFloor.toLocaleString('en-IN')}
          </span>
          <span className="text-slate-500 font-bold">−</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Buffer: ₹{buffer.toLocaleString('en-IN')}
          </span>
          <span className="text-emerald-400 font-bold">=</span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
            Capacity Floor: ₹{sustainableCapacity.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
