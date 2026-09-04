import React, { useState, useEffect } from 'react';
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Wallet,
  Building2,
  Calendar,
  CreditCard,
  HeartPulse,
  TrendingDown,
  Layers,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Lock
} from 'lucide-react';
import { buildCustomerTimeSeriesPayload } from '../utils/customerPayloadBuilder';

const ONBOARDING_STEPS = [
  { id: 1, title: 'Income & Profile', desc: 'Net income & stability' },
  { id: 2, title: 'Living Expenses', desc: 'Essential & discretionary' },
  { id: 3, title: 'Debt Obligations', desc: 'Current EMIs & dues' },
  { id: 4, title: 'Liquidity & Credit', desc: 'Savings & credit lines' },
  { id: 5, title: 'Review & Consent', desc: 'Confirm & run analysis' }
];

export default function CustomerOnboarding({
  initialData = {},
  onSubmitToBackend,
  onBackToLogin,
  isAnalyzing = false,
  analysisError = null,
  onClearError
}) {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    customerId: initialData.customer_id || initialData.customerId || 'CUST_PRIYA_34',
    name: initialData.name || 'Priya Sharma',
    age: initialData.age || 34,
    salaryDay: initialData.salary_day || initialData.salaryDay || 1,
    emiDueDay: initialData.emi_due_day || initialData.emiDueDay || 5,

    // Step 1: Income
    monthlyIncome: initialData.income ? initialData.income[initialData.income.length - 1] : 60000,
    incomeTrend: initialData.incomeTrend || (initialData.archetype === 'INCOME_SHOCK' ? 'SUDDEN_DROP' : 'STABLE'),

    // Step 2: Expenses
    essentialExpenses: initialData.essential_expenses ? initialData.essential_expenses[initialData.essential_expenses.length - 1] : 39500,
    discretionaryExpenses: initialData.discretionary_expenses ? initialData.discretionary_expenses[initialData.discretionary_expenses.length - 1] : 1500,
    expenseTrend: initialData.expenseTrend || (initialData.archetype === 'EXPENSE_SHOCK' ? 'SURGE_EMERGENCY' : 'NORMAL'),

    // Step 3: Debt & Obligations
    monthlyObligations: initialData.obligations ? initialData.obligations[initialData.obligations.length - 1] : 25000,
    totalDebt: initialData.total_debt ? initialData.total_debt[initialData.total_debt.length - 1] : 425000,
    debtGrowthTrend: initialData.debtGrowthTrend || (initialData.archetype === 'DEBT_OVERLOAD' ? 'COMPOUNDING' : 'STABLE'),
    paymentDelaysCount: initialData.payment_delays ? initialData.payment_delays.filter(x => x > 0).length : 2,
    minPaymentOnly: initialData.min_payment_flag ? initialData.min_payment_flag[initialData.min_payment_flag.length - 1] === 1 : true,

    // Step 4: Liquidity & Credit
    savings: initialData.savings ? initialData.savings[initialData.savings.length - 1] : 10000,
    savingsTrend: initialData.savingsTrend || (initialData.archetype === 'EXPENSE_SHOCK' || initialData.archetype === 'DEBT_OVERLOAD' ? 'DRAINED' : 'STABLE'),
    creditLimit: initialData.credit_limit || initialData.creditLimit || 100000,
    creditBalance: initialData.credit_balance ? initialData.credit_balance[initialData.credit_balance.length - 1] : 72000,
    overdraftCount: initialData.overdraft_count ? initialData.overdraft_count[initialData.overdraft_count.length - 1] : 2,
    utilizationTrend: initialData.utilizationTrend || (initialData.archetype === 'DEBT_OVERLOAD' ? 'SURGING' : 'STABLE'),

    // Step 5: Consent
    dataConsentAgreed: false,
    presetKey: initialData.presetKey || null,
    isCustomized: Boolean(initialData.isCustomized)
  });

  // Track field changes and mark customized
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      isCustomized: true
    }));
    if (analysisError && onClearError) {
      onClearError();
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(5, prev + 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.dataConsentAgreed) return;

    const payload = buildCustomerTimeSeriesPayload(formData);
    onSubmitToBackend(payload);
  };

  // Calculations for Step 5 Summary
  const income = Number(formData.monthlyIncome || 0);
  const essential = Number(formData.essentialExpenses || 0);
  const discretionary = Number(formData.discretionaryExpenses || 0);
  const totalExp = essential + discretionary;
  const obligations = Number(formData.monthlyObligations || 0);
  const netCashFlow = income - totalExp - obligations;
  const dti = income > 0 ? ((obligations / income) * 100).toFixed(1) : 0;
  const creditUtil = Number(formData.creditLimit) > 0
    ? ((Number(formData.creditBalance) / Number(formData.creditLimit)) * 100).toFixed(0)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onBackToLogin}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Intelligence</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <span>Manual Data Entry — Exception Workflow</span>
            {formData.presetKey && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                {formData.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Exception intake form · Step {currentStep} of 5 · {ONBOARDING_STEPS[currentStep - 1].title}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Exception Intake Mode</span>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 bg-slate-950/70">
        <div className="grid grid-cols-5 gap-2">
          {ONBOARDING_STEPS.map((step) => {
            const active = currentStep === step.id;
            const done = currentStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`text-left p-2.5 rounded-xl border transition-all ${
                  active
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                    : done
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold">0{step.id}</span>
                  {done && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold mt-1 truncate">{step.title}</div>
                <div className="text-[9px] font-mono opacity-70 truncate">{step.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert if backend returned error */}
      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Backend Analysis Error:</strong> {analysisError}
              <div className="text-[11px] text-rose-400/80 mt-1">
                Please check your values or verify the FastAPI server is running on port 8000.
              </div>
            </div>
          </div>
          <button
            onClick={onClearError}
            className="text-slate-400 hover:text-white font-mono text-xs underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Step Form Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 bg-slate-950/80 relative overflow-hidden">
        {/* Step 1: Income & Basic Profile */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                <span>Step 1: Net Income & Stability</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Enter your average monthly take-home salary and income predictability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Monthly Net Income (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => updateField('monthlyIncome', Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                    placeholder="60000"
                    min="1000"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Net credited salary or stable business income
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Salary Deposit Day of Month *
                </label>
                <input
                  type="number"
                  value={formData.salaryDay}
                  onChange={(e) => updateField('salaryDay', Math.min(31, Math.max(1, Number(e.target.value))))}
                  className="w-full px-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                  min="1"
                  max="31"
                  required
                />
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Day when monthly salary arrives (1 - 31)
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Income Trend in Recent Months *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'STABLE', label: 'Steady & Predictable', desc: 'No significant drops in the last 12 months' },
                    { key: 'SUDDEN_DROP', label: 'Sudden Income Drop', desc: 'Loss of job, contract cut, or business decline' },
                    { key: 'VOLATILE', label: 'Variable / Fluctuating', desc: 'Gig / freelance income with high variance' }
                  ].map(trend => (
                    <button
                      key={trend.key}
                      type="button"
                      onClick={() => updateField('incomeTrend', trend.key)}
                      className={`p-3.5 rounded-xl border text-left transition ${
                        formData.incomeTrend === trend.key
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{trend.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{trend.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Customer Age (Years)
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', Math.min(100, Math.max(18, Number(e.target.value))))}
                  className="w-full px-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Customer ID / Reference
                </label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) => updateField('customerId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Living Expenses */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400" />
                <span>Step 2: Essential Living & Discretionary Expenses</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                DebtWise strictly protects your essential living cost floor so interventions never compromise basic dignity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Essential Living Costs (₹/mo) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={formData.essentialExpenses}
                    onChange={(e) => updateField('essentialExpenses', Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                    placeholder="25000"
                    min="500"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Rent, groceries, utilities, schooling, and mandatory medications
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Discretionary Spending (₹/mo)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={formData.discretionaryExpenses}
                    onChange={(e) => updateField('discretionaryExpenses', Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                    placeholder="3000"
                    min="0"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Dining out, entertainment, subscriptions, and optional travel
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Recent Expense Pattern *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'NORMAL', label: 'Normal / Steady', desc: 'Expenses are within typical budget expectations' },
                    { key: 'SURGE_EMERGENCY', label: 'Emergency Expense Surge', desc: 'Unexpected medical, clinic bills, or urgent repairs' },
                    { key: 'RISING', label: 'Gradual Inflation Growth', desc: 'Gradually creeping cost of living over past 6 months' }
                  ].map(pat => (
                    <button
                      key={pat.key}
                      type="button"
                      onClick={() => updateField('expenseTrend', pat.key)}
                      className={`p-3.5 rounded-xl border text-left transition ${
                        formData.expenseTrend === pat.key
                          ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{pat.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{pat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Debt Obligations */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Step 3: Fixed Loan & EMI Obligations</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Detail your recurring monthly debt commitments and loan repayment schedule.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Total Monthly EMI Obligations (₹/mo) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={formData.monthlyObligations}
                    onChange={(e) => updateField('monthlyObligations', Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                    placeholder="25000"
                    min="0"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Sum of all active Home, Auto, Personal & BNPL loans
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Total Outstanding Loan Principal (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={formData.totalDebt}
                    onChange={(e) => updateField('totalDebt', Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                    placeholder="400000"
                    min="0"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Cumulative outstanding principal balance
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  EMI Autopay / Due Day of Month *
                </label>
                <input
                  type="number"
                  value={formData.emiDueDay}
                  onChange={(e) => updateField('emiDueDay', Math.min(31, Math.max(1, Number(e.target.value))))}
                  className="w-full px-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                  min="1"
                  max="31"
                  required
                />
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Day of month when loan EMI is deducted (1 - 31)
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Payment Delays in Last 6 Months
                </label>
                <select
                  value={formData.paymentDelaysCount}
                  onChange={(e) => updateField('paymentDelaysCount', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                >
                  <option value={0}>0 (No missed payments)</option>
                  <option value={1}>1 Month (Occasional delay)</option>
                  <option value={2}>2 Months (Recent distress)</option>
                  <option value={3}>3+ Months (Persistent delay)</option>
                </select>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Months where EMI payment was made late
                </p>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">
                    Paying Minimum Balance Only on Credit Cards?
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Indicates potential revolving debt pressure
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.minPaymentOnly}
                    onChange={(e) => updateField('minPaymentOnly', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Liquidity & Credit Lines */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Step 4: Liquidity, Savings & Credit Lines</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Provide emergency savings buffer and credit card balance to gauge financial shock absorption.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Liquid Emergency Savings (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={formData.savings}
                    onChange={(e) => updateField('savings', Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                    placeholder="15000"
                    min="0"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Readily available savings account or liquid fund balance
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Overdraft / Dishonour Frequency
                </label>
                <select
                  value={formData.overdraftCount}
                  onChange={(e) => updateField('overdraftCount', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                >
                  <option value={0}>0 (Zero overdrafts)</option>
                  <option value={1}>1-2 Times in last 6 months</option>
                  <option value={2}>2-3 Times in recent months</option>
                  <option value={3}>3+ Times (Frequent bank fees)</option>
                </select>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Bank account negative balance or ECS bounce events
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Total Approved Credit Card Limit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => updateField('creditLimit', Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                    placeholder="100000"
                    min="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Current Credit Card Balance (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={formData.creditBalance}
                    onChange={(e) => updateField('creditBalance', Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl theme-input font-mono text-sm focus:outline-none"
                    placeholder="45000"
                    min="0"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Current revolving balance (Utilization: {creditUtil}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Consent */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>Step 5: Review Financial Summary & Data Consent</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Please verify the financial profile that will be sent to the DebtWise AI/ML Decision Engine.
              </p>
            </div>

            {/* Financial Summary Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Monthly Income</div>
                <div className="text-lg font-black text-white mt-1">₹{income.toLocaleString('en-IN')}</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-0.5">Deposit: Day {formData.salaryDay}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Living Costs</div>
                <div className="text-lg font-black text-rose-300 mt-1">₹{totalExp.toLocaleString('en-IN')}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Essential: ₹{essential.toLocaleString('en-IN')}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Current EMIs</div>
                <div className="text-lg font-black text-amber-300 mt-1">₹{obligations.toLocaleString('en-IN')}</div>
                <div className="text-[10px] font-mono text-amber-400 mt-0.5">Due: Day {formData.emiDueDay} · DTI {dti}%</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Liquid Savings</div>
                <div className="text-lg font-black text-emerald-300 mt-1">₹{Number(formData.savings).toLocaleString('en-IN')}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Card Util: {creditUtil}%</div>
              </div>
            </div>

            {/* Cash Flow Balance Indicator */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              netCashFlow < 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <div className="flex items-center gap-3">
                {netCashFlow < 0 ? (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold font-mono uppercase">
                    {netCashFlow < 0 ? 'Active Monthly Deficit Detected' : 'Positive Cash-Flow Margin'}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {netCashFlow < 0
                      ? `Monthly expenses and obligations exceed income by ₹${Math.abs(netCashFlow).toLocaleString('en-IN')}/mo.`
                      : `Surplus of ₹${netCashFlow.toLocaleString('en-IN')}/mo available after basic expenses.`}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-sm shrink-0">
                {netCashFlow < 0 ? `-₹${Math.abs(netCashFlow).toLocaleString('en-IN')}` : `+₹${netCashFlow.toLocaleString('en-IN')}`}
              </div>
            </div>

            {/* Responsible AI Notice */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                <Shield className="w-4 h-4" />
                <span>Responsible AI & Data Privacy Commitment</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                DebtWise evaluates your distress signals to determine root cause, calculate sustainable repayment limits, and propose safe recovery options.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                • DebtWise does NOT automatically deny financial services based on this analysis.<br />
                • All proposed relief actions remain subject to your explicit confirmation before execution.
              </p>
            </div>

            {/* Explicit Data Consent Checkbox */}
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/30">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dataConsentAgreed}
                  onChange={(e) => updateField('dataConsentAgreed', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-slate-950"
                  required
                />
                <div className="text-xs text-slate-200 leading-relaxed">
                  <strong className="text-cyan-300">Data Analysis Consent:</strong> I consent to DebtWise analyzing the financial information I provided to diagnose financial distress root causes and evaluate sustainable repayment capacity.
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Form Navigation Controls */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isAnalyzing}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900 text-xs font-mono flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="text-[11px] font-mono text-slate-500">
            STEP {currentStep} OF {ONBOARDING_STEPS.length}
          </div>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.dataConsentAgreed || isAnalyzing}
              className={`px-7 py-3 rounded-xl font-bold text-xs font-mono flex items-center gap-2 transition ${
                formData.dataConsentAgreed && !isAnalyzing
                  ? 'bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Processing Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Submit for Live Analysis →</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Live Analyzing HUD Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-8 max-w-md w-full border border-cyan-500/40 shadow-2xl space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.3)]">
              <BrainCircuit className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Analyzing Your Financial Position
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Executing the 4-stage closed-loop decision engine...
              </p>
            </div>

            <div className="space-y-3 text-left">
              {[
                { label: 'Phase 1: XGBoost Distress Diagnosis', desc: 'Evaluating multi-class risk probabilities & SHAP factors' },
                { label: 'Phase 2: Repayment Capacity Engine', desc: 'Calculating deterministic living floor and safe EMI limit' },
                { label: 'Phase 3: Deterministic Safety Guardrails', desc: 'Checking constraints SC-001 through SC-008' },
                { label: 'Phase 4: Intervention Ladder Selection', desc: 'Ranking safe, lowest-intrusiveness relief options' }
              ].map((stage, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono text-[10px]">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{stage.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{stage.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-mono text-cyan-400/80 animate-pulse">
              Posting payload to /api/v1/analyze • Live Decision Response...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
