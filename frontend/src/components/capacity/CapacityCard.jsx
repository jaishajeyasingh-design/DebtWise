import React from 'react';
import { Calculator, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function CapacityCard({ customer, className = "" }) {
  if (!customer) return null;

  const capacity = customer.capacity || {};
  const income = capacity.average_income ?? customer.current_monthly_income ?? 60000;
  const livingFloor = capacity.living_cost_floor ?? customer.living_cost_floor ?? 35000;
  const buffer = capacity.emergency_buffer_gap ?? capacity.emergency_buffer_target ?? customer.emergency_buffer ?? 10000;
  const sustainableCapacity = capacity.safe_emi ?? customer.sustainable_repayment_capacity ?? 15000;
  const currentObligations = capacity.current_obligations ?? customer.current_obligations ?? 25000;
  const monthlyDeficit = capacity.emi_gap ?? (currentObligations - sustainableCapacity);

  return (
    <div className={`glass-panel rounded-2xl p-6 shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-wider font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Deterministic Capacity Engine
          </div>
          <h4 className="text-lg font-bold theme-text mt-0.5">Sustainable Repayment Affordability</h4>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Rule-Based Math</span>
        </div>
      </div>

      <p className="text-xs theme-text-secondary mb-6 leading-relaxed">
        Calculated using transparent living expense floors and non-negotiable living baselines. <strong className="theme-text">Not an opaque ML prediction.</strong>
      </p>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Current Obligations */}
        <div className="p-4 rounded-xl theme-surface-muted border border-rose-500/30 relative overflow-hidden shadow-sm">
          <div className="text-xs font-mono text-rose-400 uppercase font-bold">Current Obligations</div>
          <div className="text-2xl font-mono font-black text-rose-400 mt-1">
            ₹{Math.round(currentObligations).toLocaleString('en-IN')}
            <span className="text-xs font-normal theme-text-muted font-sans"> / mo</span>
          </div>
          <div className="text-[11px] theme-text-muted mt-1">Home loan EMI + cards</div>
          <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Sustainable Capacity */}
        <div className="p-4 rounded-xl theme-surface-muted border border-emerald-500/40 relative overflow-hidden shadow-sm">
          <div className="text-xs font-mono text-emerald-400 uppercase font-bold">Sustainable Capacity</div>
          <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
            ₹{Math.round(sustainableCapacity).toLocaleString('en-IN')}
            <span className="text-xs font-normal theme-text-muted font-sans"> / mo</span>
          </div>
          <div className="text-[11px] theme-text-muted mt-1">Calculated safe payment floor</div>
          <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Monthly Affordability Deficit */}
        <div className="p-4 rounded-xl theme-surface-muted border border-amber-500/30 relative overflow-hidden shadow-sm">
          <div className="text-xs font-mono text-amber-400 uppercase font-bold">Monthly Cash Deficit</div>
          <div className="text-2xl font-mono font-black text-amber-400 mt-1">
            -₹{Math.round(monthlyDeficit).toLocaleString('en-IN')}
            <span className="text-xs font-normal theme-text-muted font-sans"> / mo</span>
          </div>
          <div className="text-[11px] theme-text-muted mt-1">Unfunded obligation gap</div>
          <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Calculator className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Breakdown Equation Bar */}
      <div className="p-4 rounded-xl theme-surface-muted theme-border shadow-sm">
        <div className="text-xs font-mono theme-text-muted mb-2 font-bold uppercase">TRANSPARENT AFFORDABILITY FORMULA:</div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono theme-text">
          <span className="px-2.5 py-1 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold">
            Income: ₹{Math.round(income).toLocaleString('en-IN')}
          </span>
          <span className="theme-text-muted font-bold">−</span>
          <span className="px-2.5 py-1 rounded theme-surface theme-border theme-text-secondary">
            Essential Living Floor: ₹{Math.round(livingFloor).toLocaleString('en-IN')}
          </span>
          <span className="theme-text-muted font-bold">−</span>
          <span className="px-2.5 py-1 rounded theme-surface theme-border theme-text-secondary">
            Buffer: ₹{Math.round(buffer).toLocaleString('en-IN')}
          </span>
          <span className="text-emerald-400 font-bold">=</span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
            Capacity Floor: ₹{Math.round(sustainableCapacity).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
