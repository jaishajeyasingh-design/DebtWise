import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Sparkles,
  ArrowRight,
  UserCheck,
  HeartPulse,
  TrendingDown,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Zap,
  Info,
  SlidersHorizontal,
  Activity,
  Clock
} from 'lucide-react';
import { DEMO_PRESETS } from '../utils/customerPayloadBuilder';

export default function CustomerIntelligence({
  onAnalyzeCustomer,
  onStartManualIntake,
  onOpenDashboard,
  isAnalyzing = false,
  analysisError = null,
  onClearError
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPresetKey, setSelectedPresetKey] = useState('priya');
  const [processingStep, setProcessingStep] = useState(0);

  const presetsList = Object.keys(DEMO_PRESETS).map((key) => ({
    key,
    ...DEMO_PRESETS[key]
  }));

  const filteredPresets = presetsList.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.customer_id.toLowerCase().includes(q) ||
      c.archetype.toLowerCase().includes(q) ||
      c.badge.toLowerCase().includes(q)
    );
  });

  const selectedCustomer = DEMO_PRESETS[selectedPresetKey] || DEMO_PRESETS.priya;

  // Multi-step animated telemetry HUD during AI processing
  useEffect(() => {
    let interval = null;
    if (isAnalyzing) {
      setProcessingStep(0);
      interval = setInterval(() => {
        setProcessingStep((prev) => (prev < 7 ? prev + 1 : prev));
      }, 350);
    } else {
      setProcessingStep(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  const handleSelectCustomer = (key) => {
    setSelectedPresetKey(key);
    if (analysisError && onClearError) {
      onClearError();
    }
  };

  const handleExecuteAnalysis = () => {
    if (onAnalyzeCustomer && selectedCustomer) {
      onAnalyzeCustomer({
        ...selectedCustomer,
        presetKey: selectedPresetKey,
        isCustomized: false,
      });
    }
  };

  const latestIncome = selectedCustomer.income ? selectedCustomer.income[selectedCustomer.income.length - 1] : 60000;
  const latestObligation = selectedCustomer.obligations ? selectedCustomer.obligations[selectedCustomer.obligations.length - 1] : 25000;
  const latestSavings = selectedCustomer.savings ? selectedCustomer.savings[selectedCustomer.savings.length - 1] : 10000;
  const latestDti = latestIncome > 0 ? ((latestObligation / latestIncome) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b theme-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>DebtWise Operations Console · Bank Decision Support</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black theme-text tracking-tight">
            Customer Intelligence & Early Distress Triage
          </h1>
          <p className="theme-text-secondary text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
            DebtWise turns existing 12-month customer financial records into explainable distress diagnoses,
            deterministic repayment capacity floors, and safe, human-governed intervention plans.
          </p>
        </div>

        {/* Secondary Exception Intake Action */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={onStartManualIntake}
            className="px-4 py-2.5 rounded-xl theme-surface-muted theme-border theme-text hover:theme-border-strong font-mono text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Manual / Exception Intake</span>
          </button>
        </div>
      </div>

      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{analysisError}</span>
          </div>
          <button
            onClick={onClearError}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left = Case Selector, Right = Selected Profile & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer Case Triage Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer ID (e.g. CUST_ARUN_42) or name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 transition shadow-sm"
              />
            </div>
            <span className="text-xs font-mono theme-text-muted shrink-0">
              {filteredPresets.length} Cases Available
            </span>
          </div>

          {/* Customer Case Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredPresets.map((c) => {
              const isSelected = selectedPresetKey === c.key;
              const emi = c.obligations ? c.obligations[c.obligations.length - 1] : 25000;
              const income = c.income ? c.income[c.income.length - 1] : 60000;

              return (
                <div
                  key={c.key}
                  onClick={() => handleSelectCustomer(c.key)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all relative border ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/60 ring-1 ring-cyan-400/50 shadow-md'
                      : 'theme-surface-muted theme-border hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold theme-text flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        )}
                      </h3>
                      <div className="text-[11px] font-mono theme-text-muted">
                        {c.customer_id} · Age {c.age}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        c.key === 'arun'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : c.key === 'priya'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : c.key === 'rahul'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {c.badge}
                    </span>
                  </div>

                  <p className="text-[11px] theme-text-secondary line-clamp-2 mb-3 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t theme-border-subtle text-[11px] font-mono">
                    <div>
                      <span className="theme-text-muted block text-[10px]">MONTHLY NET</span>
                      <span className="theme-text font-bold">₹{income.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="theme-text-muted block text-[10px]">ACTIVE EMIs</span>
                      <span className="text-rose-400 font-bold">₹{emi.toLocaleString('en-IN')}/mo</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t theme-border-subtle flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="theme-text-secondary">12-Month Records</span>
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {isSelected ? 'Selected' : 'Click to Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Minimization & Responsible AI Banner */}
          <div className="p-4 rounded-2xl theme-surface-muted theme-border text-xs theme-text-secondary space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Data Minimization Principle</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              DebtWise minimizes customer data collection by evaluating existing account behavior, cash-flow timelines, and repayment capacity already available in simulated bank records. No invasive credit scraping is performed.
            </p>
          </div>
        </div>

        {/* Right Column: Selected Profile & AI Analysis Action (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Selected Customer Profile Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border theme-border shadow-xl space-y-6">
            <div className="flex items-center justify-between gap-3 border-b theme-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                    Selected Customer Record
                  </div>
                  <h2 className="text-xl font-black theme-text">
                    {selectedCustomer.name}
                  </h2>
                  <div className="text-xs font-mono theme-text-muted">
                    {selectedCustomer.customer_id} · Age {selectedCustomer.age}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px]">
                Simulated Record
              </span>
            </div>

            {/* Financial Data Summary Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl theme-surface-muted theme-border">
                <span className="text-[10px] theme-text-muted block uppercase">Monthly Income</span>
                <span className="text-base font-bold theme-text mt-0.5 block">
                  ₹{latestIncome.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] theme-text-muted">Credited: Day {selectedCustomer.salary_day}</span>
              </div>

              <div className="p-3 rounded-xl theme-surface-muted theme-border">
                <span className="text-[10px] theme-text-muted block uppercase">Active EMI Obligations</span>
                <span className="text-base font-bold text-rose-400 mt-0.5 block">
                  ₹{latestObligation.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] theme-text-muted">Due: Day {selectedCustomer.emi_due_day}</span>
              </div>

              <div className="p-3 rounded-xl theme-surface-muted theme-border">
                <span className="text-[10px] theme-text-muted block uppercase">Debt-to-Income (DTI)</span>
                <span className={`text-base font-bold mt-0.5 block ${Number(latestDti) > 50 ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {latestDti}%
                </span>
                <span className="text-[10px] theme-text-muted">
                  {Number(latestDti) > 50 ? 'High Leverage' : 'Moderate'}
                </span>
              </div>

              <div className="p-3 rounded-xl theme-surface-muted theme-border">
                <span className="text-[10px] theme-text-muted block uppercase">Liquid Savings</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                  ₹{latestSavings.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] theme-text-muted">Available Buffer</span>
              </div>
            </div>

            {/* Financial Data Availability Checklist */}
            <div className="space-y-2 pt-2 border-t theme-border">
              <div className="text-[11px] font-mono theme-text-muted uppercase tracking-wider font-bold">
                Financial Data Available for Analysis:
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="theme-text-secondary">12-Mo Income History</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="theme-text-secondary">Living Cost Breakdown</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="theme-text-secondary">Active Loan Obligations</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="theme-text-secondary">Total Debt Trajectory</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="theme-text-secondary">Liquid Savings Buffer</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="theme-text-secondary">Credit Card Balances</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="theme-text-secondary">Delinquency Records</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="theme-text-secondary">Overdraft Incidence</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Button & Processing HUD */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleExecuteAnalysis}
                disabled={isAnalyzing}
                className="w-full py-4 px-6 rounded-2xl theme-primary-button text-slate-950 font-black text-sm font-mono flex items-center justify-center gap-3 transition shadow-lg disabled:opacity-60 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>Processing Decision Engine Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze with DebtWise AI</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Real-Time Processing Telemetry Steps */}
              {isAnalyzing && (
                <div className="p-4 rounded-2xl theme-surface-muted border border-cyan-500/30 space-y-2 text-xs font-mono animate-fadeIn">
                  <div className="text-cyan-400 font-bold flex items-center gap-2 pb-1 border-b theme-border text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>AI DECISION ENGINE PIPELINE ACTIVE</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {[
                      'Ingesting 12-month customer financial records',
                      'Extracting 16 behavioral & volatility features',
                      'Executing multi-class XGBoost distress classification',
                      'Generating local SHAP explainability attributions',
                      'Computing deterministic repayment capacity floor',
                      'Filtering candidates via safety rules SC-001 through SC-008',
                      'Assembling human approval & consent governance gates',
                      'Compiling final structured decision response'
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 transition-all ${
                          processingStep > idx
                            ? 'text-emerald-400 font-medium'
                            : processingStep === idx
                            ? 'text-cyan-400 font-bold'
                            : 'theme-text-muted'
                        }`}
                      >
                        {processingStep > idx ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : processingStep === idx ? (
                          <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0"></span>
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-slate-700 shrink-0"></span>
                        )}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Role Clarity Card */}
          <div className="p-4 rounded-2xl theme-surface-muted theme-border text-xs font-mono space-y-2.5 shadow-sm">
            <div className="theme-text font-bold flex items-center gap-2 text-[11px] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>DebtWise Architectural Division of Responsibilities</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-[11px] theme-text-secondary">
              <div>
                <strong className="text-cyan-400">XGBoost:</strong> Diagnoses the primary root cause of distress from financial time-series.
              </div>
              <div>
                <strong className="text-cyan-400">SHAP:</strong> Quantifies exact feature impact contributing to the diagnosis.
              </div>
              <div>
                <strong className="text-cyan-400">Capacity Engine:</strong> Deterministically calculates safe repayment floors.
              </div>
              <div>
                <strong className="text-cyan-400">Safety Rules SC-001–SC-008:</strong> Institutional hard rules preventing harmful lending.
              </div>
              <div>
                <strong className="text-cyan-400">LLM Layer:</strong> Formulates empathetic case communication based strictly on the approved decision.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

