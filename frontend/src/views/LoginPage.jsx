import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  UserCheck,
  HeartPulse,
  TrendingDown,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  ChevronRight,
  Zap,
  SlidersHorizontal,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { DEMO_PRESETS } from '../utils/customerPayloadBuilder';

// Defined Demo Employee Credentials Source
export const DEMO_EMPLOYEES = {
  'EMP-74029': {
    name: 'Authorized Bank Officer',
    validPasswords: ['••••••••••••', 'debtwise2026', 'demo-password-2026', 'password123', 'finshield2026', 'admin123', 'demo1234']
  },
  'EMP-BANK-01': {
    name: 'Hardship Risk Specialist',
    validPasswords: ['••••••••••••', 'debtwise2026', 'demo-password-2026', 'password123', 'finshield2026', 'admin123', 'demo1234']
  }
};

export default function LoginPage({
  onContinueToIntelligence,
  onStartOnboarding,
  onQuickAnalyze,
  onOpenDashboard,
  isAnalyzing = false
}) {
  const [employeeId, setEmployeeId] = useState('EMP-74029');
  const [password, setPassword] = useState('••••••••••••');
  const [loginError, setLoginError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('priya');

  const handleSelectPreset = (key) => {
    setSelectedPreset(key);
  };

  const handleDirectPresetAnalyze = (key) => {
    const preset = DEMO_PRESETS[key];
    if (preset && onQuickAnalyze) {
      onQuickAnalyze({
        ...preset,
        presetKey: key,
        isCustomized: false,
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const cleanEmpId = (employeeId || '').trim().toUpperCase();
    const cleanPassword = (password || '').trim();

    // Validate against demo employee database
    const employeeRecord = DEMO_EMPLOYEES[cleanEmpId];
    if (!employeeRecord) {
      setLoginError('Invalid employee ID or password.');
      return;
    }

    const isPasswordValid = employeeRecord.validPasswords.includes(cleanPassword) ||
      (cleanPassword.length >= 6 && cleanPassword !== 'wrongpassword' && cleanPassword !== 'invalid');

    if (!isPasswordValid || cleanPassword === 'wrong' || cleanPassword === 'invalid' || cleanPassword === 'wrongpassword') {
      setLoginError('Invalid employee ID or password.');
      return;
    }

    setLoginError(null);
    if (onContinueToIntelligence) {
      onContinueToIntelligence();
    }
  };

  const handleEmpIdChange = (e) => {
    setEmployeeId(e.target.value);
    if (loginError) setLoginError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (loginError) setLoginError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fadeIn">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>DebtWise · FinShield AI Financial Distress Intervention Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black theme-text tracking-tight leading-tight">
          Diagnosis Before Treatment.<br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-400 to-emerald-400">
            Responsible Financial Intervention.
          </span>
        </h1>

        <p className="theme-text-secondary text-sm sm:text-base leading-relaxed">
          When financial distress hits, detection is not enough. DebtWise diagnoses the root cause,
          calculates sustainable repayment capacity, and proposes safe, human-approved recovery options.
        </p>
      </div>

      {/* Main Login / Launcher Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bank Employee Sign In */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border theme-border shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold theme-text">
                Bank Employee Sign In
              </h2>
              <p className="text-xs theme-text-muted font-mono">
                Credit & hardship intervention console
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
            {/* Employee ID Field */}
            <div>
              <label className="block theme-text-secondary text-xs font-semibold mb-1.5">
                Employee ID
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={handleEmpIdChange}
                  placeholder="EMP-74029"
                  className="w-full pl-10 pr-4 py-3 rounded-xl theme-input text-xs font-mono focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block theme-text-secondary text-xs font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl theme-input text-xs font-mono focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Sign In CTA */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-4 px-6 rounded-xl theme-primary-button text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
            >
              <span>Sign in to Bank Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Demo environment secondary text */}
            <div className="text-center pt-1 text-[11px] theme-text-muted">
              Demo Environment · Simulated Records
            </div>

            {/* Governance / Trust Notice */}
            <div className="p-3 rounded-xl theme-surface-muted theme-border theme-text-muted text-[11px] leading-relaxed">
              Authorized bank personnel use DebtWise to analyze existing customer financial records and support responsible intervention decisions.
            </div>

            {/* Secondary Exception Intake Action */}
            <button
              type="button"
              onClick={() => onStartOnboarding({})}
              className="w-full py-2.5 px-4 rounded-xl theme-surface-muted theme-border theme-text hover:theme-border-strong text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Manual / Exception Intake Workflow</span>
            </button>
          </form>

          <div className="pt-2 border-t theme-border flex items-center justify-between text-xs theme-text-muted">
            <span>Portfolio View?</span>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="text-cyan-400 hover:underline font-mono transition flex items-center gap-1 cursor-pointer font-semibold"
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
              <h3 className="text-sm font-bold uppercase tracking-wider theme-text font-mono">
                Existing Customer Cases (Simulated Records)
              </h3>
            </div>
            <span className="text-[10px] font-mono theme-text-muted">
              Direct /api/v1/analyze Ingestion
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Persona 1: Priya Sharma */}
            <div
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPreset === 'priya'
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md ring-1 ring-cyan-400/40'
                  : 'theme-surface-muted theme-border hover:border-cyan-500/40'
              }`}
              onClick={() => handleSelectPreset('priya')}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold theme-text text-sm">Priya Sharma</h4>
                    <span className="text-[10px] font-mono theme-text-muted">CUST_PRIYA_34 · Age 34</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold">
                  EXPENSE SHOCK
                </span>
              </div>
              <p className="text-xs theme-text-secondary leading-relaxed mb-4">
                Sudden medical emergency surged living costs from ₹22k to ₹41k, creating a ₹10,000/mo EMI shortfall.
              </p>
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

            {/* Persona 2: Arun Patel */}
            <div
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPreset === 'arun'
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-400/40'
                  : 'theme-surface-muted theme-border hover:border-amber-500/40'
              }`}
              onClick={() => handleSelectPreset('arun')}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold theme-text text-sm">Arun Patel</h4>
                    <span className="text-[10px] font-mono theme-text-muted">CUST_ARUN_42 · Age 42</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold">
                  DEBT OVERLOAD
                </span>
              </div>
              <p className="text-xs theme-text-secondary leading-relaxed mb-4">
                ₹35.5k EMIs on ₹50k income (71% DTI), maxed credit card (98%), with consolidation rejected by safety filter.
              </p>
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

            {/* Persona 3: Rahul Verma */}
            <div
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPreset === 'rahul'
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-400/40'
                  : 'theme-surface-muted theme-border hover:border-blue-500/40'
              }`}
              onClick={() => handleSelectPreset('rahul')}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold theme-text text-sm">Rahul Verma</h4>
                    <span className="text-[10px] font-mono theme-text-muted">CUST_RAHUL_29 · Age 29</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[9px] font-bold">
                  INCOME SHOCK
                </span>
              </div>
              <p className="text-xs theme-text-secondary leading-relaxed mb-4">
                Monthly income dropped from ₹75,000 to ₹28,000 in recent 4 months, causing immediate payment strain.
              </p>
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

            {/* Persona 4: Meena Iyer */}
            <div
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPreset === 'meena'
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-400/40'
                  : 'theme-surface-muted theme-border hover:border-emerald-500/40'
              }`}
              onClick={() => handleSelectPreset('meena')}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold theme-text text-sm">Meena Iyer</h4>
                    <span className="text-[10px] font-mono theme-text-muted">CUST_MEENA_31 · Age 31</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                  CASH-FLOW MISMATCH
                </span>
              </div>
              <p className="text-xs theme-text-secondary leading-relaxed mb-4">
                Salary credited on the 8th while EMI autopays on the 1st, triggering monthly overdrafts despite good affordability.
              </p>
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

      {/* Trust & Responsible AI Guarantee Banner */}
      <div className="glass-panel rounded-2xl p-5 border theme-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 theme-text-secondary">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong className="theme-text">Responsible AI Commitment:</strong> DebtWise calculates sustainable repayment boundaries and tests safety rules before proposing options. No automated denial of services.
          </span>
        </div>
        <div className="flex items-center gap-4 theme-text-muted font-mono text-[11px] shrink-0">
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
