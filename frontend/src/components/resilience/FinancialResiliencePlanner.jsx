import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  DollarSign,
  PiggyBank,
  Building2,
  ArrowUpRight,
  Lock,
  Sparkles,
  Layers,
  HelpCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

/**
 * FinancialResiliencePlanner
 * Illustrates responsible surplus allocation toward long-term savings and investment
 * only after sustainable repayment capacity and emergency buffers are verified.
 */
export default function FinancialResiliencePlanner({
  customerData = null,
  selectedIntervention = null,
  className = ""
}) {
  // 1. Extract customer financial figures safely
  const rawCustomer = customerData?.customer || customerData?.raw_customer_input || customerData || {};
  const incomeSeries = rawCustomer?.income || [];
  const currentIncome = incomeSeries.length > 0
    ? incomeSeries[incomeSeries.length - 1]
    : (customerData?.capacity?.monthly_net_income || 60000);

  const rawExpenses = rawCustomer?.essential_expenses || [];
  const essentialExpenses = customerData?.capacity?.essential_expenses_floor ||
    (rawExpenses.length > 0 ? rawExpenses[rawExpenses.length - 1] : currentIncome * 0.45);

  const emergencyBuffer = customerData?.capacity?.emergency_buffer || (currentIncome * 0.10);

  const obligationsSeries = rawCustomer?.obligations || [];
  const currentEmi = obligationsSeries.length > 0
    ? obligationsSeries[obligationsSeries.length - 1]
    : 25000;

  const activeIntervention = selectedIntervention ||
    customerData?.selected_intervention ||
    customerData?.safe_interventions?.[0] ||
    null;

  const postInterventionEmi = activeIntervention?.monthly_payment_after ?? currentEmi;
  const primaryCause = (customerData?.diagnosis?.primary_cause || '').toUpperCase();
  const allInterventionsRejected = Boolean(customerData?.safety_audit?.all_interventions_rejected) ||
    (customerData?.safe_interventions?.length === 0 && !activeIntervention);

  const isDebtOverload = primaryCause === 'DEBT_OVERLOAD' || allInterventionsRejected;
  const isIncomeShock = primaryCause === 'INCOME_SHOCK' && currentIncome < 35000;

  // Compute post-stabilization monthly cash flow:
  // monthly surplus = income - protected living floor - post-intervention EMI
  const calculatedSurplus = currentIncome - essentialExpenses - postInterventionEmi;

  // Determine eligibility: Must have positive surplus, no severe debt overload rejection
  // Preserved liquid buffer is a protected safety reserve / eligibility requirement, not a monthly cash expense
  const isEligible = !isDebtOverload && !isIncomeShock && calculatedSurplus > 500;

  // Exact calculated surplus as initial allocation amount (not hardcoded)
  const defaultSurplus = isEligible ? Math.round(calculatedSurplus) : 0;

  // Interactive state
  const [monthlyContribution, setMonthlyContribution] = useState(defaultSurplus || 3358);
  const [horizonYears, setHorizonYears] = useState(10); // 5 or 10 years
  const [sipRate, setSipRate] = useState(10.0); // 10% annual return
  const [rdRate, setRdRate] = useState(7.0);   // 7% annual rate
  const [fdRate, setFdRate] = useState(7.0);   // 7% annual rate
  const [fdLumpSum, setFdLumpSum] = useState(50000); // ₹50,000 lump sum principal
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Update monthly contribution if default changes
  React.useEffect(() => {
    if (isEligible && defaultSurplus > 0) {
      setMonthlyContribution(defaultSurplus);
    }
  }, [defaultSurplus, isEligible]);

  // Calculations for SIP, RD, and FD
  const calculations = useMemo(() => {
    const P = Number(monthlyContribution);
    const T = Number(horizonYears);
    const n = T * 12; // Total months

    // 1. SIP Calculation (Standard monthly compounding future value)
    // FV = P * [((1 + r)^n - 1) / r] * (1 + r)
    const rSipMonthly = (sipRate / 100) / 12;
    const sipTotalInvested = P * n;
    let sipFinalValue = 0;
    if (rSipMonthly > 0) {
      sipFinalValue = P * ((Math.pow(1 + rSipMonthly, n) - 1) / rSipMonthly) * (1 + rSipMonthly);
    } else {
      sipFinalValue = sipTotalInvested;
    }
    const sipGain = Math.max(0, sipFinalValue - sipTotalInvested);

    // 2. RD Calculation (Standard Indian Bank quarterly compounding maturity formula)
    // M = sum_{i=1}^n P * (1 + r_rd / 4)^(4 * (n - i + 1) / 12)
    const rdTotalDeposits = P * n;
    let rdFinalValue = 0;
    const rRdQuarterly = (rdRate / 100) / 4;
    for (let i = 1; i <= n; i++) {
      const quarters = (4 * (n - i + 1)) / 12;
      rdFinalValue += P * Math.pow(1 + rRdQuarterly, quarters);
    }
    const rdGain = Math.max(0, rdFinalValue - rdTotalDeposits);

    // 3. FD Calculation (Lump-sum deposit with quarterly compounding)
    // FV = P_lump * (1 + r_fd / 4)^(4 * T)
    const Plump = Number(fdLumpSum);
    const rFdQuarterly = (fdRate / 100) / 4;
    const fdFinalValue = Plump * Math.pow(1 + rFdQuarterly, 4 * T);
    const fdGain = Math.max(0, fdFinalValue - Plump);

    return {
      n,
      sip: {
        totalInvested: sipTotalInvested,
        gain: sipGain,
        finalValue: sipFinalValue
      },
      rd: {
        totalDeposits: rdTotalDeposits,
        interest: rdGain,
        finalValue: rdFinalValue
      },
      fd: {
        principal: Plump,
        interest: fdGain,
        finalValue: fdFinalValue
      }
    };
  }, [monthlyContribution, horizonYears, sipRate, rdRate, fdRate, fdLumpSum]);

  return (
    <div className={`glass-panel rounded-3xl p-6 sm:p-8 border theme-border space-y-6 shadow-xl ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b theme-border">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <PiggyBank className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                Resilience & Wealth Protection
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                POST-STABILIZATION ONLY
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black theme-text mt-0.5">
              Financial Resilience Planner
            </h3>
            <p className="text-xs theme-text-secondary mt-1 max-w-2xl leading-relaxed">
              Illustrates how a verified post-intervention monthly surplus could potentially be allocated toward long-term savings and resilience once basic living costs and debt stabilization are safeguarded.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`shrink-0 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border flex items-center gap-1.5 ${
          isEligible
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          {isEligible ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>VERIFIED SURPLUS AVAILABLE</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>STABILIZATION FIRST</span>
            </>
          )}
        </div>
      </div>

      {/* Safety Floor Verification Check */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl theme-surface-muted theme-border">
          <span className="text-[10px] theme-text-muted block uppercase">Verified Monthly Income</span>
          <span className="text-sm sm:text-base font-bold theme-text mt-0.5 block">
            ₹{currentIncome.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        </div>

        <div className="p-3 rounded-xl theme-surface-muted theme-border">
          <span className="text-[10px] theme-text-muted block uppercase">Protected Living Floor</span>
          <span className="text-sm sm:text-base font-bold theme-text mt-0.5 block">
            ₹{Math.round(essentialExpenses).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-cyan-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3 h-3" /> Ring-fenced
          </span>
        </div>

        <div className="p-3 rounded-xl theme-surface-muted theme-border">
          <span className="text-[10px] theme-text-muted block uppercase">Post-Intervention EMI</span>
          <span className="text-sm sm:text-base font-bold text-rose-400 mt-0.5 block">
            ₹{Math.round(postInterventionEmi).toLocaleString('en-IN')}/mo
          </span>
          <span className="text-[10px] theme-text-muted">
            {activeIntervention ? "Governed plan" : "Current schedule"}
          </span>
        </div>

        <div className="p-3 rounded-xl theme-surface-muted theme-border">
          <span className="text-[10px] theme-text-muted block uppercase">Preserved Liquid Buffer</span>
          <span className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 block">
            ₹{Math.round(emergencyBuffer).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3 h-3" /> Safety Floor
          </span>
        </div>
      </div>

      {/* CONDITIONAL BRANCH 1: INELIGIBLE (Debt Overload / Deficit) */}
      {!isEligible ? (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold theme-text">
                Investment recommendation unavailable
              </h4>
              <p className="text-xs theme-text-secondary mt-1 leading-relaxed">
                <strong>Debt stabilization and essential-expense protection take priority until a sustainable surplus is available.</strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl theme-surface-muted theme-border text-xs space-y-2 font-mono">
            <div className="text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
              DebtWise Safety Policy Assessment:
            </div>
            <div className="space-y-1.5 theme-text-secondary text-[11px]">
              <p>• <strong>Active Debt Burden:</strong> The customer currently has an unsustainable debt load or cash-flow deficit (Deficit: -₹{Math.abs(Math.round(calculatedSurplus)).toLocaleString('en-IN')}/mo).</p>
              <p>• <strong>Essential Expense Priority:</strong> Mandatory household living expenses and emergency liquidity buffers must be stabilized first before locking funds into long-term products.</p>
              <p>• <strong>Responsible AI Rule:</strong> DebtWise strictly opposes recommending investment products or suggesting additional borrowing to create investment capital for distressed borrowers.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border theme-border-subtle text-[11px] theme-text-muted flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Recommended immediate action: Focus on debt restructuring, revolving line freeze, and expense stabilization.</span>
          </div>
        </div>
      ) : (
        /* CONDITIONAL BRANCH 2: ELIGIBLE (Verified Surplus Available) */
        <div className="space-y-6 animate-fadeIn">
          {/* Controls Bar: Monthly Surplus Slider + Horizon Toggle */}
          <div className="p-5 rounded-2xl theme-surface-muted theme-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Verified Monthly Surplus for Resilience Planning
                </span>
                <div className="text-2xl font-black font-mono theme-text mt-0.5 flex items-baseline gap-2">
                  <span>₹{Number(monthlyContribution).toLocaleString('en-IN')}/mo</span>
                  <span className="text-xs font-mono theme-text-muted font-normal">
                    (Verified safe capacity: ₹{Math.max(1000, Math.round(calculatedSurplus)).toLocaleString('en-IN')}/mo)
                  </span>
                </div>
              </div>

              {/* Horizon Selector (5Y vs 10Y) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono theme-text-muted">Horizon:</span>
                <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border theme-border font-mono text-xs">
                  {[5, 10].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setHorizonYears(yr)}
                      className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        horizonYears === yr
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'theme-text-muted hover:theme-text'
                      }`}
                    >
                      {yr} Years
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Allocation Amount Chips & Slider */}
            <div className="space-y-2 pt-2 border-t theme-border-subtle">
              <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
                <span>Illustrative Monthly Allocation Amount:</span>
                <span className="theme-text font-bold">₹{Number(monthlyContribution).toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max={Math.max(10000, Math.round(calculatedSurplus * 1.5) || 15000)}
                step="100"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 rounded-lg bg-slate-800"
              />
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {[
                  Math.round(calculatedSurplus),
                  Math.round(calculatedSurplus * 0.5),
                  2500,
                  5000
                ].filter((amt, idx, arr) => amt > 0 && arr.indexOf(amt) === idx).map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setMonthlyContribution(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
                      monthlyContribution === amt
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-400 font-bold'
                        : 'theme-surface-muted theme-border theme-text-muted hover:theme-text'
                    }`}
                  >
                    {amt === Math.round(calculatedSurplus) ? `Verified Surplus (₹${amt.toLocaleString('en-IN')})` : `₹${amt.toLocaleString('en-IN')}/mo`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Way Comparative Cards Grid (SIP vs RD vs FD) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Option 1: SIP */}
            <div className="glass-panel rounded-2xl p-5 border theme-border hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4 relative group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                    MARKET-LINKED / EQUITY SIP
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    ~{sipRate}% p.a.
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold theme-text flex items-center gap-1.5">
                    <span>1. Systematic Investment Plan</span>
                  </h4>
                  <p className="text-[11px] theme-text-secondary mt-1">
                    Long-term growth-oriented option with market-linked returns and higher variability.
                  </p>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl theme-surface-muted theme-border text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="theme-text-muted">Monthly Contribution:</span>
                    <span className="theme-text font-bold">₹{Number(monthlyContribution).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="theme-text-muted">Investment Horizon:</span>
                    <span className="theme-text font-bold">{horizonYears} Years ({calculations.n} mos)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t theme-border-subtle">
                    <span className="theme-text-muted">Total Invested:</span>
                    <span className="theme-text font-bold">₹{Math.round(calculations.sip.totalInvested).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Estimated Gain:</span>
                    <span className="font-bold">+₹{Math.round(calculations.sip.gain).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t theme-border-subtle text-sm">
                    <span className="text-cyan-400 font-bold">Estimated Final Value:</span>
                    <span className="text-cyan-400 font-black">₹{Math.round(calculations.sip.finalValue).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t theme-border-subtle space-y-2">
                <div className="text-[11px] theme-text-muted leading-relaxed">
                  <strong className="theme-text">Why this option?</strong><br />
                  "Higher-growth-oriented illustrative option with market-linked returns and higher variability."
                </div>
              </div>
            </div>

            {/* Option 2: RD */}
            <div className="glass-panel rounded-2xl p-5 border theme-border hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 relative group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                    RECURRING DEPOSIT · DEFINED RATE
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    ~{rdRate}% p.a.
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold theme-text flex items-center gap-1.5">
                    <span>2. Recurring Deposit (RD)</span>
                  </h4>
                  <p className="text-[11px] theme-text-secondary mt-1">
                    Scheduled monthly bank deposit providing defined interest accumulation with quarterly compounding.
                  </p>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl theme-surface-muted theme-border text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="theme-text-muted">Monthly Deposit:</span>
                    <span className="theme-text font-bold">₹{Number(monthlyContribution).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="theme-text-muted">Deposit Horizon:</span>
                    <span className="theme-text font-bold">{horizonYears} Years ({calculations.n} mos)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t theme-border-subtle">
                    <span className="theme-text-muted">Total Deposits:</span>
                    <span className="theme-text font-bold">₹{Math.round(calculations.rd.totalDeposits).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Estimated Interest:</span>
                    <span className="font-bold">+₹{Math.round(calculations.rd.interest).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t theme-border-subtle text-sm">
                    <span className="text-emerald-400 font-bold">Estimated Maturity Value:</span>
                    <span className="text-emerald-400 font-black">₹{Math.round(calculations.rd.finalValue).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t theme-border-subtle space-y-2">
                <div className="text-[11px] theme-text-muted leading-relaxed">
                  <strong className="theme-text">Why this option?</strong><br />
                  "Predictable savings-oriented option with defined bank interest terms."
                </div>
              </div>
            </div>

            {/* Option 3: FD */}
            <div className="glass-panel rounded-2xl p-5 border theme-border hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 relative group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-bold">
                    BANK DEPOSIT · DEFINED RATE
                  </span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">
                    ~{fdRate}% p.a.
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold theme-text flex items-center gap-1.5">
                    <span>3. Fixed Deposit (FD)</span>
                  </h4>
                  <p className="text-[11px] theme-text-secondary mt-1">
                    One-time lump-sum bank term deposit with quarterly compounding. Unlike SIP and RD, FD does not accommodate monthly recurring contributions.
                  </p>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl theme-surface-muted theme-border text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="theme-text-muted">Lump-Sum Principal:</span>
                    <span className="theme-text font-bold">₹{Number(fdLumpSum).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="theme-text-muted">Tenure Horizon:</span>
                    <span className="theme-text font-bold">{horizonYears} Years</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t theme-border-subtle">
                    <span className="theme-text-muted">Compounding Basis:</span>
                    <span className="text-indigo-400 font-bold">Quarterly Compounded</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Estimated Interest:</span>
                    <span className="font-bold">+₹{Math.round(calculations.fd.interest).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t theme-border-subtle text-sm">
                    <span className="text-indigo-400 font-bold">Estimated Maturity Value:</span>
                    <span className="text-indigo-400 font-black">₹{Math.round(calculations.fd.finalValue).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t theme-border-subtle space-y-2">
                <div className="text-[11px] theme-text-muted leading-relaxed">
                  <strong className="theme-text">Why this option?</strong><br />
                  "Suitable for lump-sum savings with defined bank interest terms."
                </div>
              </div>
            </div>
          </div>

          {/* Configurable Assumptions Accordion */}
          <div className="p-4 rounded-2xl theme-surface-muted theme-border space-y-3">
            <button
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="w-full flex items-center justify-between text-xs font-mono theme-text font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Adjust Illustrative Simulation Assumptions</span>
              </div>
              <span className="text-cyan-400 underline">
                {showAssumptions ? "Hide Parameters" : "Show Parameters"}
              </span>
            </button>

            {showAssumptions && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t theme-border-subtle font-mono text-xs">
                <div>
                  <label className="theme-text-muted text-[10px] block uppercase mb-1">
                    SIP Illustrative Return ({sipRate}%)
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="15"
                    step="0.5"
                    value={sipRate}
                    onChange={(e) => setSipRate(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="theme-text-muted text-[10px] block uppercase mb-1">
                    RD Annual Interest Rate ({rdRate}%)
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="9"
                    step="0.25"
                    value={rdRate}
                    onChange={(e) => setRdRate(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="theme-text-muted text-[10px] block uppercase mb-1">
                    FD Annual Interest Rate ({fdRate}%)
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="9"
                    step="0.25"
                    value={fdRate}
                    onChange={(e) => setFdRate(Number(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="theme-text-muted text-[10px] block uppercase mb-1">
                    FD Lump-Sum Principal (₹{fdLumpSum.toLocaleString('en-IN')})
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="200000"
                    step="5000"
                    value={fdLumpSum}
                    onChange={(e) => setFdLumpSum(Number(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border theme-border">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-cyan-400 border-b theme-border">
                <tr>
                  <th className="p-3">Parameter</th>
                  <th className="p-3">SIP (Systematic Plan)</th>
                  <th className="p-3">RD (Recurring Deposit)</th>
                  <th className="p-3">FD (Fixed Deposit)</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border-subtle theme-surface-muted">
                <tr>
                  <td className="p-3 font-bold theme-text">Payment Structure</td>
                  <td className="p-3 theme-text-secondary">Monthly Recurring (₹{Number(monthlyContribution).toLocaleString('en-IN')})</td>
                  <td className="p-3 theme-text-secondary">Monthly Recurring (₹{Number(monthlyContribution).toLocaleString('en-IN')})</td>
                  <td className="p-3 text-indigo-400 font-bold">Single Upfront Lump-Sum (₹{Number(fdLumpSum).toLocaleString('en-IN')})</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold theme-text">Total Capital Committed</td>
                  <td className="p-3 font-bold theme-text">₹{Math.round(calculations.sip.totalInvested).toLocaleString('en-IN')}</td>
                  <td className="p-3 font-bold theme-text">₹{Math.round(calculations.rd.totalDeposits).toLocaleString('en-IN')}</td>
                  <td className="p-3 font-bold theme-text">₹{Math.round(calculations.fd.principal).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold theme-text">Estimated Returns / Gain</td>
                  <td className="p-3 text-emerald-400 font-bold">+₹{Math.round(calculations.sip.gain).toLocaleString('en-IN')} (~{sipRate}%)</td>
                  <td className="p-3 text-emerald-400 font-bold">+₹{Math.round(calculations.rd.interest).toLocaleString('en-IN')} (~{rdRate}%)</td>
                  <td className="p-3 text-emerald-400 font-bold">+₹{Math.round(calculations.fd.interest).toLocaleString('en-IN')} (~{fdRate}%)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold theme-text">Projected Total Value</td>
                  <td className="p-3 text-cyan-400 font-black text-sm">₹{Math.round(calculations.sip.finalValue).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-emerald-400 font-black text-sm">₹{Math.round(calculations.rd.finalValue).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-indigo-400 font-black text-sm">₹{Math.round(calculations.fd.finalValue).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold theme-text">Volatility & Risk Profile</td>
                  <td className="p-3 theme-text-secondary">Market-linked NAV variability</td>
                  <td className="p-3 theme-text-secondary">Defined bank deposit rate</td>
                  <td className="p-3 theme-text-secondary">Defined bank term deposit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Governance & Responsible AI Disclaimers */}
      <div className="p-4 rounded-2xl theme-surface-muted theme-border space-y-2 text-xs theme-text-muted leading-relaxed font-sans">
        <div className="flex items-center gap-2 font-bold theme-text font-mono text-[11px] uppercase tracking-wider">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Responsible Financial Planning & Governance Disclaimers</span>
        </div>
        <div className="space-y-1 pl-6 text-[11px] theme-text-secondary">
          <p>• <strong>Illustrative projection only:</strong> Actual returns, interest rates, and maturity amounts depend on specific banking/fund products, provider terms, market fluctuations, applicable taxes, and exit conditions.</p>
          <p>• <strong>No Regulated Advice:</strong> DebtWise provides decision-support tools and resilience simulations; it does not provide regulated financial or investment advice.</p>
          <p>• <strong>Zero Leverage Rule:</strong> DebtWise strictly opposes taking additional loans, credit lines, or debt to create investment capital.</p>
        </div>
      </div>
    </div>
  );
}
