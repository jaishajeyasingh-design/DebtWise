import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  HeartPulse,
  TrendingDown,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  ChevronRight,
  Zap,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';
import { DEMO_PRESETS } from '../utils/customerPayloadBuilder';

export default function LoginPage({
  onContinueToIntelligence,
  onStartOnboarding,
  onQuickAnalyze,
  onOpenDashboard,
  isAnalyzing = false
}) {
  const [officerId, setOfficerId] = useState('OFFICER_R_KUMAR_842');
  const [selectedPreset, setSelectedPreset] = useState('priya');

  const handleSelectPreset = (key) => {
    setSelectedPreset(key);
  };

  const handleDirectPresetAnalyze = (key) => {
    const preset = DEMO_PRESETS[key];
    if (preset && onQuickAnalyze) {
      onQuickAnalyze(preset);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fadeIn">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>DebtWise Operations Console · Bank Decision Support</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Diagnosis Before Treatment.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
            Responsible Financial Intervention.
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          When financial distress hits, detection is not enough. DebtWise diagnoses the root cause,
          calculates sustainable repayment capacity, and proposes safe, human-approved recovery options.
        </p>
      </div>

      {/* Main Login / Launcher Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bank Operations Console Launcher */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-b from-slate-950/90 to-slate-900/90 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Bank Operations Console
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                AI decision-support for credit & hardship officers
              </p>
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-slate-400 text-[10px] uppercase">Active Officer Session</div>
              <div className="text-white font-bold text-sm">Rajesh Kumar (Credit Support Desk)</div>
              <div className="text-slate-400 text-[11px]">Officer ID: {officerId}</div>
              <div className="text-slate-400 text-[11px]">Branch: Retail Credit Operations #408</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono text-[11px]">
                <Lock className="w-3.5 h-3.5" />
                <span>Simulated Bank Data Available</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The bank already holds 12-month customer financial records. DebtWise ingests these records directly to assess distress without requiring customer application forms.
              </p>
            </div>

            <button
              type="button"
              onClick={onContinueToIntelligence}
              disabled={isAnalyzing}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(0,240,255,0.25)] disabled:opacity-50 cursor-pointer"
            >
              <span>Continue to Customer Intelligence</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onStartOnboarding({})}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Manual / Exception Intake Workflow</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Portfolio View?</span>
            <button
              onClick={onOpenDashboard}
              className="text-cyan-400 hover:text-cyan-300 font-mono transition flex items-center gap-1"
            >
              <span>Portfolio Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Canonical Hackathon Demo Cases */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                Existing Customer Cases (Simulated Records)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Direct /api/v1/analyze Ingestion
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Persona 1: Priya Sharma */}
            <div
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPreset === 'priya'
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => handleSelectPreset('priya')}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Priya Sharma</h4>
                    <span className="text-[10px] font-mono text-slate-400">CUST_PRIYA_34 · Age 34</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold">
                  EXPENSE SHOCK
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Sudden medical emergency surged living costs from ₹22k to ₹41k, creating a ₹10,000/mo EMI shortfall.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectPresetAnalyze('priya');
                  }}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Analyze with DebtWise AI</span>
                </button>
              </div>
            </div>

            {/* Persona 2: Arun Patel */}
            <div
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPreset === 'arun'
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => handleSelectPreset('arun')}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Arun Patel</h4>
                    <span className="text-[10px] font-mono text-slate-400">CUST_ARUN_42 · Age 42</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold">
                  DEBT OVERLOAD
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                ₹35.5k EMIs on ₹50k income (71% DTI), maxed credit card (98%), with consolidation rejected by safety filter.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectPresetAnalyze('arun');
                  }}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Analyze with DebtWise AI</span>
                </button>
              </div>
            </div>

            {/* Persona 3: Rahul Verma */}
            <div
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPreset === 'rahul'
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => handleSelectPreset('rahul')}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Rahul Verma</h4>
                    <span className="text-[10px] font-mono text-slate-400">CUST_RAHUL_29 · Age 29</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[9px] font-bold">
                  INCOME SHOCK
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Monthly income dropped from ₹75,000 to ₹28,000 in recent 4 months, causing immediate payment strain.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectPresetAnalyze('rahul');
                  }}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 px-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span>Analyze with DebtWise AI</span>
                </button>
              </div>
            </div>

            {/* Persona 4: Meena Iyer */}
            <div
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPreset === 'meena'
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => handleSelectPreset('meena')}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Meena Iyer</h4>
                    <span className="text-[10px] font-mono text-slate-400">CUST_MEENA_31 · Age 31</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                  CASH-FLOW MISMATCH
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Salary credited on the 8th while EMI autopays on the 1st, triggering monthly overdrafts despite good affordability.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectPresetAnalyze('meena');
                  }}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>Analyze with DebtWise AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Responsible AI Guarantee Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 text-slate-300">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Responsible AI Commitment:</strong> DebtWise calculates sustainable repayment boundaries and tests safety rules before proposing options. No automated denial of services.
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] shrink-0">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            Data Minimization
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            Explicit Consent Gates
          </span>
        </div>
      </div>
    </div>
  );
}
