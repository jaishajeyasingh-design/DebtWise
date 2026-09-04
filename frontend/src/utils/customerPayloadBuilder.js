/**
 * DebtWise Customer Payload Builder
 * Prepares strictly-typed financial time-series payloads for the FastAPI /api/v1/analyze endpoint.
 */

// Canonical 12-month demo profiles matching the backend dataset
export const DEMO_PRESETS = {
  priya: {
    customer_id: "CUST_PRIYA_34",
    name: "Priya Sharma",
    age: 34,
    archetype: "EXPENSE_SHOCK",
    badge: "Medical Emergency Spike",
    description: "Stable ₹60,000 income, but recent clinic emergency surged essential expenses from ₹22k to ₹41k, draining savings.",
    salary_day: 1,
    emi_due_day: 5,
    credit_limit: 100000.0,
    income: [60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0],
    essential_expenses: [22000.0, 22500.0, 22000.0, 23000.0, 22000.0, 22500.0, 22000.0, 23000.0, 24000.0, 39000.0, 41000.0, 39500.0],
    discretionary_expenses: [8000.0, 8500.0, 8000.0, 7500.0, 8000.0, 8000.0, 7500.0, 7000.0, 6000.0, 2000.0, 1500.0, 1500.0],
    obligations: [25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0],
    total_debt: [480000.0, 475000.0, 470000.0, 465000.0, 460000.0, 455000.0, 450000.0, 445000.0, 440000.0, 435000.0, 430000.0, 425000.0],
    savings: [55000.0, 56000.0, 54000.0, 55000.0, 53000.0, 52000.0, 50000.0, 48000.0, 45000.0, 22000.0, 12000.0, 10000.0],
    credit_balance: [18000.0, 19000.0, 17500.0, 18000.0, 19000.0, 20000.0, 19500.0, 21000.0, 25000.0, 55000.0, 68000.0, 72000.0],
    payment_delays: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    overdraft_count: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2],
    min_payment_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1]
  },
  arun: {
    customer_id: "CUST_ARUN_42",
    name: "Arun Patel",
    age: 42,
    archetype: "DEBT_OVERLOAD",
    badge: "Compounding Debt & Max Utilization",
    description: "Income of ₹50,000 overwhelmed by ₹35.5k monthly EMIs (71% DTI), 98% credit card utilization, and safety-rejected consolidation proposal.",
    salary_day: 1,
    emi_due_day: 4,
    credit_limit: 150000.0,
    income: [50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0],
    essential_expenses: [18000.0, 18500.0, 18000.0, 18000.0, 18500.0, 18000.0, 18500.0, 18000.0, 18500.0, 18000.0, 18500.0, 18000.0],
    discretionary_expenses: [6000.0, 5500.0, 5000.0, 4500.0, 4000.0, 3500.0, 3000.0, 2500.0, 2000.0, 1500.0, 1000.0, 1000.0],
    obligations: [28000.0, 28000.0, 29000.0, 30000.0, 31000.0, 32000.0, 33000.0, 33500.0, 34000.0, 34500.0, 35000.0, 35500.0],
    total_debt: [480000.0, 500000.0, 520000.0, 545000.0, 570000.0, 595000.0, 620000.0, 645000.0, 670000.0, 690000.0, 710000.0, 720000.0],
    savings: [30000.0, 28000.0, 25000.0, 22000.0, 18000.0, 15000.0, 12000.0, 9000.0, 6000.0, 4000.0, 2500.0, 1500.0],
    credit_balance: [95000.0, 105000.0, 115000.0, 125000.0, 132000.0, 138000.0, 142000.0, 145000.0, 146500.0, 147500.0, 148000.0, 148500.0],
    payment_delays: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
    overdraft_count: [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3],
    min_payment_flag: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]
  },
  rahul: {
    customer_id: "CUST_RAHUL_29",
    name: "Rahul Verma",
    age: 29,
    archetype: "INCOME_SHOCK",
    badge: "Sudden Income Drop",
    description: "Previous ₹75,000 monthly income suddenly fell to ₹28,000 in recent 4 months, causing loan repayment distress.",
    salary_day: 1,
    emi_due_day: 5,
    credit_limit: 120000.0,
    income: [75000.0, 76000.0, 74000.0, 75000.0, 77000.0, 75000.0, 74000.0, 75000.0, 32000.0, 28000.0, 29000.0, 28000.0],
    essential_expenses: [24000.0, 24500.0, 24000.0, 24000.0, 25000.0, 24000.0, 24500.0, 24000.0, 22000.0, 21000.0, 20500.0, 20000.0],
    discretionary_expenses: [14000.0, 15000.0, 13500.0, 14000.0, 15000.0, 14000.0, 13000.0, 12000.0, 4000.0, 2000.0, 1500.0, 1000.0],
    obligations: [22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0],
    total_debt: [320000.0, 310000.0, 300000.0, 290000.0, 280000.0, 270000.0, 260000.0, 250000.0, 242000.0, 235000.0, 228000.0, 220000.0],
    savings: [65000.0, 68000.0, 67000.0, 70000.0, 72000.0, 74000.0, 75000.0, 72000.0, 42000.0, 21000.0, 10000.0, 4000.0],
    credit_balance: [20000.0, 22000.0, 19000.0, 21000.0, 23000.0, 20000.0, 22000.0, 25000.0, 52000.0, 78000.0, 92000.0, 98000.0],
    payment_delays: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    overdraft_count: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2],
    min_payment_flag: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
  },
  meena: {
    customer_id: "CUST_MEENA_31",
    name: "Meena Iyer",
    age: 31,
    archetype: "CASH_FLOW_MISMATCH",
    badge: "Salary / EMI Autopay Date Lag",
    description: "Affordable loan on paper (27% DTI), but salary arrives on the 8th while EMI auto-debits on the 1st, triggering monthly overdraft fees.",
    salary_day: 8,
    emi_due_day: 1,
    credit_limit: 100000.0,
    income: [65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0],
    essential_expenses: [25000.0, 25500.0, 25000.0, 25000.0, 26000.0, 25000.0, 25500.0, 25000.0, 25000.0, 25500.0, 25000.0, 25000.0],
    discretionary_expenses: [10000.0, 10500.0, 10000.0, 9500.0, 10000.0, 10000.0, 9500.0, 10000.0, 9000.0, 9500.0, 9000.0, 9000.0],
    obligations: [18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0],
    total_debt: [280000.0, 270000.0, 260000.0, 250000.0, 240000.0, 230000.0, 220000.0, 210000.0, 200000.0, 190000.0, 180000.0, 170000.0],
    savings: [20000.0, 19000.0, 21000.0, 18000.0, 22000.0, 19000.0, 20000.0, 18000.0, 17000.0, 16000.0, 15000.0, 15000.0],
    credit_balance: [25000.0, 24000.0, 26000.0, 23000.0, 27000.0, 25000.0, 26000.0, 24000.0, 25000.0, 26000.0, 25000.0, 25000.0],
    payment_delays: [0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    overdraft_count: [1, 2, 1, 2, 2, 1, 2, 2, 3, 2, 3, 3],
    min_payment_flag: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
};

/**
 * Constructs a validated 12-month CustomerInput payload from form state.
 * Translates single-point numbers and qualitative trends into realistic time-series.
 */
export function buildCustomerTimeSeriesPayload(formData) {
  // If formData already has complete 12-month series arrays (e.g. newly added customer or full record)
  if (
    Array.isArray(formData.income) &&
    formData.income.length === 12 &&
    Array.isArray(formData.essential_expenses) &&
    Array.isArray(formData.obligations)
  ) {
    return {
      customer_id: formData.customer_id || formData.customerId || "CUST_RECORD",
      name: formData.name || "Customer",
      age: Number(formData.age || 35),
      salary_day: Number(formData.salary_day || formData.salaryDay || 1),
      emi_due_day: Number(formData.emi_due_day || formData.emiDueDay || 5),
      credit_limit: Number(formData.credit_limit || formData.creditLimit || 100000),
      income: [...formData.income],
      essential_expenses: [...formData.essential_expenses],
      discretionary_expenses: Array.isArray(formData.discretionary_expenses)
        ? [...formData.discretionary_expenses]
        : Array(12).fill(Number(formData.discretionaryExpenses || 5000)),
      obligations: [...formData.obligations],
      total_debt: Array.isArray(formData.total_debt)
        ? [...formData.total_debt]
        : Array(12).fill(Number(formData.totalDebt || 200000)),
      savings: Array.isArray(formData.savings)
        ? [...formData.savings]
        : Array(12).fill(Number(formData.savings || 20000)),
      credit_balance: Array.isArray(formData.credit_balance)
        ? [...formData.credit_balance]
        : Array(12).fill(Number(formData.creditBalance || 20000)),
      payment_delays: Array.isArray(formData.payment_delays)
        ? [...formData.payment_delays]
        : Array(12).fill(Number(formData.paymentDelaysCount || 0)),
      overdraft_count: Array.isArray(formData.overdraft_count)
        ? [...formData.overdraft_count]
        : Array(12).fill(Number(formData.overdraftCount || 0)),
      min_payment_flag: Array.isArray(formData.min_payment_flag)
        ? [...formData.min_payment_flag]
        : Array(12).fill(formData.minPaymentOnly ? 1 : 0)
    };
  }

  // If the user selected a canonical preset and did not override it
  if (formData.presetKey && DEMO_PRESETS[formData.presetKey] && !formData.isCustomized) {
    const preset = DEMO_PRESETS[formData.presetKey];
    return {
      customer_id: formData.customerId || preset.customer_id,
      name: formData.name || preset.name,
      age: Number(formData.age || preset.age),
      salary_day: Number(formData.salaryDay || preset.salary_day),
      emi_due_day: Number(formData.emiDueDay || preset.emi_due_day),
      credit_limit: Number(formData.creditLimit || preset.credit_limit),
      income: [...preset.income],
      essential_expenses: [...preset.essential_expenses],
      discretionary_expenses: [...preset.discretionary_expenses],
      obligations: [...preset.obligations],
      total_debt: [...preset.total_debt],
      savings: [...preset.savings],
      credit_balance: [...preset.credit_balance],
      payment_delays: [...preset.payment_delays],
      overdraft_count: [...preset.overdraft_count],
      min_payment_flag: [...preset.min_payment_flag]
    };
  }

  const N = 12;
  const incomeVal = Math.max(1000, Number(formData.monthlyIncome || 60000));
  const essentialVal = Math.max(500, Number(formData.essentialExpenses || 25000));
  const discretionaryVal = Math.max(0, Number(formData.discretionaryExpenses || 5000));
  const obligationsVal = Math.max(0, Number(formData.monthlyObligations || 20000));
  const totalDebtVal = Math.max(obligationsVal * 12, Number(formData.totalDebt || obligationsVal * 20));
  const savingsVal = Math.max(0, Number(formData.savings || 20000));
  const creditLimitVal = Math.max(10000, Number(formData.creditLimit || 100000));
  const creditBalanceVal = Math.min(creditLimitVal, Math.max(0, Number(formData.creditBalance || 25000)));

  const salaryDay = Math.min(31, Math.max(1, Number(formData.salaryDay || 1)));
  const emiDueDay = Math.min(31, Math.max(1, Number(formData.emiDueDay || 5)));
  const age = Math.min(100, Math.max(18, Number(formData.age || 32)));

  // Trend multipliers
  const incomeTrend = formData.incomeTrend || "STABLE"; // "STABLE", "SUDDEN_DROP", "VOLATILE"
  const expenseTrend = formData.expenseTrend || "NORMAL"; // "NORMAL", "SURGE_EMERGENCY", "RISING"
  const savingsTrend = formData.savingsTrend || "STABLE"; // "STABLE", "DRAINED"
  const paymentDelaysCount = Number(formData.paymentDelaysCount || 0);
  const overdraftCountVal = Number(formData.overdraftCount || 0);
  const minPaymentOnly = Boolean(formData.minPaymentOnly);

  // 1. Build Income Series
  let incomeSeries = Array(N).fill(incomeVal);
  if (incomeTrend === "SUDDEN_DROP") {
    // Past 8 months were high baseline, recent 4 months dropped
    const baseline = incomeVal * 2.2;
    incomeSeries = [
      baseline, baseline, baseline, baseline,
      baseline, baseline, baseline, baseline,
      incomeVal * 1.15, incomeVal, incomeVal, incomeVal
    ];
  } else if (incomeTrend === "VOLATILE") {
    const shifts = [1.1, 0.85, 1.15, 0.75, 1.2, 0.8, 1.1, 0.7, 1.05, 0.85, 1.0, 0.9];
    incomeSeries = shifts.map(s => Math.round(incomeVal * s));
  }

  // 2. Build Essential Expenses Series
  let essentialSeries = Array(N).fill(essentialVal);
  if (expenseTrend === "SURGE_EMERGENCY") {
    // Past 9 months were lower normal, recent 3 months surged by ~70%
    const baseline = Math.round(essentialVal * 0.58);
    essentialSeries = [
      baseline, baseline, baseline, baseline,
      baseline, baseline, baseline, baseline, baseline + 1000,
      essentialVal * 0.95, essentialVal, essentialVal * 0.98
    ];
  } else if (expenseTrend === "RISING") {
    essentialSeries = Array.from({ length: N }, (_, i) => Math.round(essentialVal * (0.8 + (i * 0.02))));
  }

  // 3. Build Discretionary Expenses Series
  let discretionarySeries = Array(N).fill(discretionaryVal);
  if (expenseTrend === "SURGE_EMERGENCY" || incomeTrend === "SUDDEN_DROP") {
    // Customer drastically cut discretionary spend in recent months
    discretionarySeries = [
      discretionaryVal * 3, discretionaryVal * 3, discretionaryVal * 2.8, discretionaryVal * 2.5,
      discretionaryVal * 2.5, discretionaryVal * 2.5, discretionaryVal * 2, discretionaryVal * 1.8,
      discretionaryVal * 1.2, discretionaryVal, discretionaryVal * 0.8, discretionaryVal * 0.7
    ];
  }

  // 4. Build Loan Obligations Series
  let obligationsSeries = Array(N).fill(obligationsVal);
  if (formData.debtGrowthTrend === "COMPOUNDING") {
    obligationsSeries = Array.from({ length: N }, (_, i) => Math.round(obligationsVal * (0.75 + (i * 0.023))));
  }

  // 5. Build Total Debt Series
  let debtSeries = Array(N).fill(totalDebtVal);
  if (formData.debtGrowthTrend === "COMPOUNDING") {
    debtSeries = Array.from({ length: N }, (_, i) => Math.round(totalDebtVal * (0.65 + (i * 0.032))));
  } else {
    // Gradually amortizing
    debtSeries = Array.from({ length: N }, (_, i) => Math.round(totalDebtVal + ((N - 1 - i) * (obligationsVal * 0.4))));
  }

  // 6. Build Savings Series
  let savingsSeries = Array(N).fill(savingsVal);
  if (savingsTrend === "DRAINED" || expenseTrend === "SURGE_EMERGENCY") {
    const peak = Math.max(savingsVal * 5, 50000);
    savingsSeries = [
      peak, peak, peak * 0.98, peak * 0.96,
      peak * 0.92, peak * 0.90, peak * 0.85, peak * 0.80, peak * 0.75,
      savingsVal * 2.2, savingsVal * 1.2, savingsVal
    ];
  }

  // 7. Build Credit Balance Series
  let creditSeries = Array(N).fill(creditBalanceVal);
  if (formData.utilizationTrend === "SURGING") {
    creditSeries = [
      creditBalanceVal * 0.25, creditBalanceVal * 0.28, creditBalanceVal * 0.25, creditBalanceVal * 0.3,
      creditBalanceVal * 0.35, creditBalanceVal * 0.4, creditBalanceVal * 0.45, creditBalanceVal * 0.5,
      creditBalanceVal * 0.65, creditBalanceVal * 0.85, creditBalanceVal * 0.95, creditBalanceVal
    ];
  }

  // 8. Build Flags & Event Series
  let paymentDelays = Array(N).fill(0);
  if (paymentDelaysCount > 0) {
    const activeMonths = Math.min(N, paymentDelaysCount);
    for (let i = N - activeMonths; i < N; i++) {
      paymentDelays[i] = 1;
    }
  }

  let overdraftSeries = Array(N).fill(0);
  if (overdraftCountVal > 0) {
    for (let i = 0; i < N; i++) {
      if (i >= 8) {
        overdraftSeries[i] = overdraftCountVal;
      } else if (i % 2 === 0 && overdraftCountVal > 1) {
        overdraftSeries[i] = 1;
      }
    }
  }

  let minPaymentSeries = Array(N).fill(0);
  if (minPaymentOnly) {
    for (let i = 8; i < N; i++) {
      minPaymentSeries[i] = 1;
    }
  }

  const generatedId = formData.customerId || `CUST_${(formData.name || "USER").toUpperCase().replace(/\s+/g, "_")}_${Math.floor(100 + Math.random() * 900)}`;

  return {
    customer_id: generatedId,
    name: formData.name || "Customer",
    age: age,
    salary_day: salaryDay,
    emi_due_day: emiDueDay,
    credit_limit: creditLimitVal,
    income: incomeSeries,
    essential_expenses: essentialSeries,
    discretionary_expenses: discretionarySeries,
    obligations: obligationsSeries,
    total_debt: debtSeries,
    savings: savingsSeries,
    credit_balance: creditSeries,
    payment_delays: paymentDelays,
    overdraft_count: overdraftSeries,
    min_payment_flag: minPaymentSeries
  };
}

/**
 * Creates a complete customer record with 12-month financial arrays from the Add Customer form.
 */
export function createCustomerFromForm(formValues) {
  const N = 12;
  const incomeVal = Math.max(1, Number(formValues.monthlyIncome || formValues.income || 60000));
  const essentialVal = Math.max(0, Number(formValues.essentialExpenses || formValues.essential_expenses || 25000));
  const discretionaryVal = Math.max(0, Number(formValues.discretionaryExpenses || formValues.discretionary_expenses || 5000));
  const obligationsVal = Math.max(0, Number(formValues.monthlyObligations || formValues.obligations || 20000));
  const totalDebtVal = Math.max(0, Number(formValues.totalDebt || formValues.total_debt || obligationsVal * 20));
  const savingsVal = Math.max(0, Number(formValues.savings || 15000));
  const creditLimitVal = Math.max(0, Number(formValues.creditLimit || formValues.credit_limit || 100000));
  const creditBalanceVal = Math.max(0, Number(formValues.creditBalance || formValues.credit_balance || 25000));
  const paymentDelays = Math.max(0, Math.min(12, Number(formValues.paymentDelays || formValues.payment_delays || 0)));
  const overdraftCount = Math.max(0, Math.min(12, Number(formValues.overdraftCount || formValues.overdraft_count || 0)));
  const minPaymentFlag = formValues.minPaymentFlag ? 1 : 0;
  const salaryDay = Math.min(31, Math.max(1, Number(formValues.salaryDay || formValues.salary_day || 1)));
  const emiDueDay = Math.min(31, Math.max(1, Number(formValues.emiDueDay || formValues.emi_due_day || 5)));
  const age = Math.min(100, Math.max(18, Number(formValues.age || 35)));

  const name = formValues.name?.trim() || "New Customer";
  const customerId = formValues.customerId?.trim() || `CUST_${name.toUpperCase().replace(/\s+/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;

  // Build 12-month arrays
  const incomeSeries = Array(N).fill(incomeVal);
  const essentialSeries = Array(N).fill(essentialVal);
  const discretionarySeries = Array(N).fill(discretionaryVal);
  const obligationsSeries = Array(N).fill(obligationsVal);
  const debtSeries = Array(N).fill(totalDebtVal);
  const savingsSeries = Array(N).fill(savingsVal);
  const creditSeries = Array(N).fill(creditBalanceVal);

  const paymentDelaysSeries = Array(N).fill(0);
  if (paymentDelays > 0) {
    for (let i = Math.max(0, N - paymentDelays); i < N; i++) {
      paymentDelaysSeries[i] = 1;
    }
  }

  const overdraftSeries = Array(N).fill(0);
  if (overdraftCount > 0) {
    for (let i = Math.max(0, N - overdraftCount); i < N; i++) {
      overdraftSeries[i] = 1;
    }
  }

  const minPaymentSeries = Array(N).fill(minPaymentFlag);

  // Compute DTI for badge/description
  const dti = incomeVal > 0 ? ((obligationsVal / incomeVal) * 100).toFixed(0) : 0;
  let archetype = "SIMULATED_RECORD";
  let badge = `${dti}% DTI · Added Record`;
  if (dti > 60) {
    archetype = "HIGH_LEVERAGE";
    badge = "High Leverage · Intake";
  } else if (paymentDelays > 0 || overdraftCount > 0) {
    archetype = "EARLY_STRAIN";
    badge = "Early Strain · Intake";
  } else {
    badge = "Standard Intake · Simulated";
  }

  const description = `${name}, age ${age}. Net monthly income ₹${incomeVal.toLocaleString('en-IN')}, active EMIs ₹${obligationsVal.toLocaleString('en-IN')}/mo (${dti}% DTI), savings ₹${savingsVal.toLocaleString('en-IN')}.`;

  return {
    customer_id: customerId,
    name,
    age,
    archetype,
    badge,
    description,
    salary_day: salaryDay,
    emi_due_day: emiDueDay,
    credit_limit: creditLimitVal,
    income: incomeSeries,
    essential_expenses: essentialSeries,
    discretionary_expenses: discretionarySeries,
    obligations: obligationsSeries,
    total_debt: debtSeries,
    savings: savingsSeries,
    credit_balance: creditSeries,
    payment_delays: paymentDelaysSeries,
    overdraft_count: overdraftSeries,
    min_payment_flag: minPaymentSeries,
    isCustom: true
  };
}
