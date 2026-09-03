import React, { useState } from 'react';
import { Sliders, RefreshCw, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

export default function WhatIfSimulator({
  initialIncome = 60000,
  initialObligations = 25000,
  className = ""
}) {
  const [income, setIncome] = useState(initialIncome);
  const [obligations, setObligations] = useState(initialObligations);
  const [reliefReduction, setReliefReduction] = useState(10000);
  const [dueDayShift, setDueDayShift] = useState(6); // 1st to 7th

  // Deterministic calculations
  const livingFloor = Math.max(25000, income * 0.55);
  const emergencyBuffer = 3000;
  const sustainableCapacity = Math.max(0, income - livingFloor - emergencyBuffer);

  const effectiveObligation = Math.max(0, obligations - reliefReduction);
  const monthlyBufferAfter = sustainableCapacity - effectiveObligation;

  // Stress Index calculation
  const stressRatio = effectiveObligation / Math.max(1, sustainableCapacity);
  let stressScore = Math.min(99, Math.round(stressRatio * 50));
  if (stressRatio > 1.1) {
    stressScore = Math.min(98, 70 + Math.round((stressRatio - 1.1) * 25));
  }

  const handleReset = () => {
    setIncome(initialIncome);
    setObligations(initialObligations);
    setReliefReduction(10000);
    setDueDayShift(6);
  };

  return (
    <div className={`glass-panel rounded-2xl p-6 border border-slate-700/60 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Deterministic Scenario Engine
          </div>
          <h4 className="text-lg font-bold text-white mt-0.5">What-If Intervention Simulator</h4>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 font-mono transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        Test simulated intervention adjustments to project the reduction in monthly burden, financial stress, and liquidity deficit.
      </p>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        {/* Slider 1: Income */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-400 font-semibold">Monthly Net Income</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              ₹{income.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min="30000"
            max="150000"
            step="5000"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Slider 2: Current Obligations */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-400 font-semibold">Current Monthly EMI</span>
            <span className="font-mono font-bold text-rose-400 text-sm">
              ₹{obligations.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="80000"
            step="2500"
            value={obligations}
            onChange={(e) => setObligations(Number(e.target.value))}
            className="w-full accent-rose-400 cursor-pointer"
          />
        </div>

        {/* Slider 3: Relief Reduction Amount */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-400 font-semibold">Simulated EMI Relief Concession</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              -₹{reliefReduction.toLocaleString('en-IN')} / mo
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="20000"
            step="1000"
            value={reliefReduction}
            onChange={(e) => setReliefReduction(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* Slider 4: Due Date Shift */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-400 font-semibold">Payroll Due-Date Shift</span>
            <span className="font-mono font-bold text-blue-400 text-sm">
              +{dueDayShift} Days (1st ➔ {1 + dueDayShift}th)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={dueDayShift}
            onChange={(e) => setDueDayShift(Number(e.target.value))}
            className="w-full accent-blue-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Real-Time Outcome Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase">SUSTAINABLE CAPACITY</div>
          <div className="text-2xl font-mono font-black text-cyan-400 mt-1">
            ₹{Math.round(sustainableCapacity).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Calculated Living Floor Base</div>
        </div>

        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase">PROJECTED FINANCIAL STRESS</div>
          <div
            className={`text-2xl font-mono font-black mt-1 ${
              stressScore > 70 ? "text-rose-400" : stressScore > 40 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {stressScore}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stressScore < 45 ? "✔ Safe Recovery Zone" : "⚠ Elevated Pressure"}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase">MONTHLY CASH BUFFER</div>
          <div
            className={`text-2xl font-mono font-black mt-1 ${
              monthlyBufferAfter >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {monthlyBufferAfter >= 0 ? `+₹${Math.round(monthlyBufferAfter).toLocaleString('en-IN')}` : `-₹${Math.round(Math.abs(monthlyBufferAfter)).toLocaleString('en-IN')}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {monthlyBufferAfter >= 0 ? "Surplus to Rebuild Savings" : "Remaining Deficit"}
          </div>
        </div>
      </div>

      {/* Prominent Transparency Disclaimer */}
      <div className="mt-4 text-center text-xs font-mono text-amber-400/90 flex items-center justify-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        <span>SIMULATED ESTIMATE — NOT A GUARANTEED OUTCOME. Projections are rule-based feasibility estimates, not causal guarantees.</span>
      </div>
    </div>
  );
}
