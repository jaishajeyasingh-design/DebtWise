/**
 * DebtWise Isolated Mock API Service
 * 
 * Designed to mirror the exact contract of the FastAPI backend.
 * Once FastAPI is deployed, replace mock handlers with fetch/axios calls to /api/v1/*.
 */

export const PRIYA_DEMO_DATA = {
  customer_id: "CUST_PRIYA_34",
  name: "Priya Sharma",
  age: 34,
  account_number: "•••• 8492",
  phone: "+91 98765 43210",
  email: "priya.sharma@example.com",
  risk_level: "High Risk",
  salary_day: 1,
  emi_due_day: 5,
  credit_limit: 100000,
  current_monthly_income: 60000,
  current_obligations: 25000,
  living_cost_floor: 35000, // Essential living expenses floor
  emergency_buffer: 10000,
  sustainable_repayment_capacity: 15000, // Deterministic floor: Income - Living Cost - Buffer
  monthly_deficit: 10000, // Current obligations (25k) - Sustainable capacity (15k)
  
  // 12-Month Financial Time Series
  months: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  income_series: [60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000],
  essential_expenses_series: [22000, 22500, 22000, 23000, 22000, 22500, 22000, 23000, 24000, 39000, 41000, 39500],
  discretionary_expenses_series: [8000, 8500, 8000, 7500, 8000, 8000, 7500, 7000, 6000, 2000, 1500, 1500],
  obligations_series: [25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000],
  savings_series: [55000, 56000, 54000, 55000, 53000, 52000, 50000, 48000, 45000, 22000, 12000, 10000],
  credit_balance_series: [18000, 19000, 17500, 18000, 19000, 20000, 19500, 21000, 25000, 55000, 68000, 72000],
  overdraft_series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2],
  payment_delays_series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],

  // ML Distress Diagnosis (Matches predict_distress output)
  diagnosis: {
    primary_cause: "EXPENSE_SHOCK",
    confidence: 0.9939,
    probabilities: {
      EXPENSE_SHOCK: 0.9939,
      CASH_FLOW_MISMATCH: 0.0017,
      INCOME_SHOCK: 0.0015,
      DEBT_OVERLOAD: 0.0014,
      STRUCTURAL_DISTRESS: 0.0014
    },
    top_factors: [
      {
        feature: "expense_growth_rate",
        shap_value: 3.4286,
        feature_value: 0.3681,
        contribution: "positive",
        description: "Sudden surge in monthly living/emergency expenditures (+77% spike in medical expenses)"
      },
      {
        feature: "savings_decline_rate",
        shap_value: 0.2196,
        feature_value: 0.8182,
        contribution: "positive",
        description: "Liquid emergency savings heavily depleted (-82% drawdown from ₹55,000 to ₹10,000)"
      },
      {
        feature: "obligation_to_income_ratio",
        shap_value: -0.2453,
        feature_value: 0.4167,
        contribution: "negative",
        description: "Baseline loan repayments were historically affordable (41.6% DTI) prior to emergency"
      },
      {
        feature: "payment_delay_rate",
        shap_value: -0.4534,
        feature_value: 0.1667,
        contribution: "negative",
        description: "Strong historical on-time payment track record before the recent medical shock"
      }
    ]
  },

  // Visible Safety Rejection
  safety_rejection: {
    proposed_action: "Debt Consolidation Loan (₹500,000 @ 14.5% for 60 months)",
    status: "REJECTED BY SAFETY CHECK",
    rule_id: "RULE_SC_402_ANTI_DEBT_ESCALATION",
    reason: "Rejected by safety check — consolidation would increase long-term debt cost and does not address the immediate cash-flow problem.",
    timestamp: "2026-09-03 14:22:10 UTC",
    severity: "HIGH_SAFETY_VIOLATION"
  },

  // Candidate Safe Interventions
  safe_interventions: [
    {
      id: "INT_01",
      title: "Recommended: Payment-Date Adjustment + Temporary Payment Reduction",
      level: "Level 2 + Level 4",
      level_name: "TIMING FIX + TEMPORARY RELIEF",
      badge: "RECOMMENDED",
      tier: "Tier B",
      tier_description: "Pre-approved policy band / human approval where required",
      components: [
        {
          name: "Payment-Date Adjustment",
          type: "Timing Fix (Level 2)",
          tier: "Tier A (Immediate Post-Consent)",
          description: "Shift EMI deduction date from 1st to 7th (post-salary credit) to eliminate recurring overdrafts."
        },
        {
          name: "Temporary Payment Reduction",
          type: "Temporary Relief (Level 4)",
          tier: "Tier B (Pre-approved policy band / human approval where required)",
          description: "Temporarily lower monthly payment from ₹25,000 to ₹15,000 sustainable floor for 3 months."
        }
      ],
      summary: "Combines two targeted actions: Payment-Date Adjustment to align cash flow, plus Temporary Payment Reduction to ₹15,000/month.",
      policy_note: "Pre-approved policy band / human approval where required.",
      impact: "Eliminates ₹1,000/mo overdraft fees & provides ₹10,000/mo cash-flow buffer to replenish emergency savings.",
      reversibility: "100% Reversible Concession",
      monthly_payment_after: 15000,
      duration_months: 3,
      is_recommended: true
    },
    {
      id: "INT_02",
      title: "60-Day Principal Moratorium",
      level: "Level 4",
      level_name: "TEMPORARY RELIEF",
      badge: "ALTERNATIVE",
      tier: "Tier B",
      tier_description: "Pre-approved policy band / human approval where required",
      summary: "Pay interest-only (₹6,500/mo) for 2 months. Principal deferred to end of tenor.",
      policy_note: "Pre-approved policy band / human approval where required.",
      impact: "Maximizes short-term liquidity relief during acute hospital bill settlement.",
      reversibility: "Moderate (Adds 2 months to loan term)",
      monthly_payment_after: 6500,
      duration_months: 2,
      is_recommended: false
    },
    {
      id: "INT_03",
      title: "Hardship Officer Consultation",
      level: "Level 6",
      level_name: "HUMAN ESCALATION",
      badge: "MANUAL REVIEW",
      tier: "Tier C",
      tier_description: "Human Hardship Officer Decides — Zero AI Automation",
      summary: "Direct 1-on-1 case review with bank's specialized vulnerability specialist.",
      policy_note: "Full manual underwriting and hardship specialist agreement.",
      impact: "Custom workout plan for extended medical hardship.",
      reversibility: "Case-by-case legal agreement",
      monthly_payment_after: 0,
      duration_months: 0,
      is_recommended: false
    }
  ],

  // Projected Recovery Trajectory
  recovery_projection: [
    { month: "Current (M0)", stress: 88, balance: 10000, emi_paid: 25000, status: "Acute Shock" },
    { month: "Month 1", stress: 45, balance: 18000, emi_paid: 15000, status: "Relief Active" },
    { month: "Month 2", stress: 38, balance: 27000, emi_paid: 15000, status: "Buffer Rebuilding" },
    { month: "Month 3", stress: 30, balance: 36000, emi_paid: 15000, status: "Stabilized" },
    { month: "Month 4", stress: 24, balance: 44000, emi_paid: 25000, status: "Normalized EMI" },
    { month: "Month 6", stress: 18, balance: 58000, emi_paid: 25000, status: "Fully Recovered" }
  ],

  // Audit Timeline
  audit_events: [
    {
      id: "EVT_001",
      timestamp: "Today, 09:15 AM",
      type: "TELEMETRY_TRIGGER",
      title: "Early Distress Telemetry Triggered",
      detail: "Detected 2 overdraft charges and sudden +77% essential living expense surge."
    },
    {
      id: "EVT_002",
      timestamp: "Today, 09:16 AM",
      type: "ML_DIAGNOSIS",
      title: "XGBoost Diagnosis Completed",
      detail: "Classified as EXPENSE_SHOCK (99.4% confidence). Top driver: expense_growth_rate."
    },
    {
      id: "EVT_003",
      timestamp: "Today, 09:16 AM",
      type: "CAPACITY_CALC",
      title: "Deterministic Repayment Capacity Computed",
      detail: "Sustainable repayment floor established at ₹15,000/mo (Deficit: -₹10,000/mo)."
    },
    {
      id: "EVT_004",
      timestamp: "Today, 09:17 AM",
      type: "SAFETY_FILTER",
      title: "Safety Filter Triggered: Candidate Rejected",
      detail: "Rejected by safety check — consolidation would increase long-term debt cost and does not address the immediate cash-flow problem."
    },
    {
      id: "EVT_005",
      timestamp: "Today, 09:18 AM",
      type: "PLAN_PACKAGED",
      title: "Tier B Relief Proposal Packaged",
      detail: "Prepared Payment-Date Adjustment + Temporary Payment Reduction to ₹15,000 for customer consent & officer review."
    }
  ]
};


export const MOCK_CUSTOMERS_QUEUE = [
  {
    id: "CUST_PRIYA_34",
    name: "Priya Sharma",
    age: 34,
    account_number: "•••• 8492",
    distress_cause: "EXPENSE_SHOCK",
    confidence: 0.994,
    income: 60000,
    obligations: 25000,
    sustainable_capacity: 15000,
    dti: "41.6%",
    risk_level: "High Risk",
    automation_tier: "Tier B",
    tier_badge: "AI Prepares, Human Approves",
    days_in_queue: 2,
    status: "Pending Consent"
  },
  {
    id: "CUST_ARUN_42",
    name: "Arun Patel",
    age: 42,
    account_number: "•••• 1934",
    distress_cause: "DEBT_OVERLOAD",
    confidence: 0.998,
    income: 50000,
    obligations: 35000,
    sustainable_capacity: 8000,
    dti: "70.0%",
    risk_level: "Critical",
    automation_tier: "Tier B",
    tier_badge: "Officer Restructure Review",
    days_in_queue: 5,
    status: "Officer Review"
  },
  {
    id: "CUST_RAHUL_29",
    name: "Rahul Verma",
    age: 29,
    account_number: "•••• 7721",
    distress_cause: "INCOME_SHOCK",
    confidence: 0.999,
    income: 28000,
    obligations: 22000,
    sustainable_capacity: 4000,
    dti: "78.5%",
    risk_level: "Critical",
    automation_tier: "Tier B",
    tier_badge: "Moratorium Packaging",
    days_in_queue: 3,
    status: "Pending Review"
  },
  {
    id: "CUST_MEENA_31",
    name: "Meena Iyer",
    age: 31,
    account_number: "•••• 4091",
    distress_cause: "CASH_FLOW_MISMATCH",
    confidence: 0.999,
    income: 65000,
    obligations: 18000,
    sustainable_capacity: 22000,
    dti: "27.6%",
    risk_level: "Medium Risk",
    automation_tier: "Tier A",
    tier_badge: "Auto-Execute Post-Consent",
    days_in_queue: 1,
    status: "Ready for Auto-Sync"
  },
  {
    id: "CUST_VIKRAM_50",
    name: "Vikram Malhotra",
    age: 50,
    account_number: "•••• 6205",
    distress_cause: "STRUCTURAL_DISTRESS",
    confidence: 0.978,
    income: 38000,
    obligations: 24000,
    sustainable_capacity: 3500,
    dti: "63.1%",
    risk_level: "Critical",
    automation_tier: "Tier C",
    tier_badge: "Human Hardship Officer",
    days_in_queue: 8,
    status: "Assigned to Specialist"
  },
  {
    id: "CUST_ANANYA_26",
    name: "Ananya Sen",
    age: 26,
    account_number: "•••• 3319",
    distress_cause: "EXPENSE_SHOCK",
    confidence: 0.942,
    income: 48000,
    obligations: 16000,
    sustainable_capacity: 12000,
    dti: "33.3%",
    risk_level: "High Risk",
    automation_tier: "Tier B",
    tier_badge: "AI Prepares, Human Approves",
    days_in_queue: 2,
    status: "Proposal Sent"
  }
];

export const PORTFOLIO_STATS = {
  total_monitored_accounts: 14850,
  active_distress_cases: 342,
  tier_a_automated_rate: "58.4%",
  tier_b_packaged_rate: "32.1%",
  tier_c_human_rate: "9.5%",
  avg_resolution_days: 3.4,
  cure_rate_improvement: "+41.2%",
  prevented_defaults_value: "₹4.82 Cr",
  
  cause_distribution: [
    { name: "Expense Shock", count: 118, percentage: 34.5, color: "#00F0FF" },
    { name: "Cash-Flow Timing", count: 96, percentage: 28.0, color: "#10B981" },
    { name: "Debt Overload", count: 62, percentage: 18.1, color: "#F59E0B" },
    { name: "Income Shock", count: 44, percentage: 12.9, color: "#3A86FF" },
    { name: "Structural Deficit", count: 22, percentage: 6.5, color: "#F43F5E" }
  ],

  tier_breakdown: [
    { tier: "Tier A (Automate Post-Consent)", count: 200, color: "#10B981" },
    { tier: "Tier B (Officer Sign-Off)", count: 110, color: "#F59E0B" },
    { tier: "Tier C (Human Only)", count: 32, color: "#F43F5E" }
  ]
};

// API Service Mock Methods
export const api = {
  async getPortfolioStats() {
    return PORTFOLIO_STATS;
  },

  async getDistressedQueue(filter = "ALL") {
    if (filter === "ALL") return MOCK_CUSTOMERS_QUEUE;
    return MOCK_CUSTOMERS_QUEUE.filter(c => c.distress_cause === filter || c.automation_tier.includes(filter));
  },

  async getCustomerDetails(customerId) {
    if (customerId === "CUST_PRIYA_34" || customerId === "PRIYA") {
      return PRIYA_DEMO_DATA;
    }
    // Return matching customer or fallback to Priya
    const match = MOCK_CUSTOMERS_QUEUE.find(c => c.id === customerId);
    if (match) {
      return {
        ...PRIYA_DEMO_DATA,
        customer_id: match.id,
        name: match.name,
        age: match.age,
        risk_level: match.risk_level,
        current_monthly_income: match.income,
        current_obligations: match.obligations,
        sustainable_repayment_capacity: match.sustainable_capacity,
        diagnosis: {
          ...PRIYA_DEMO_DATA.diagnosis,
          primary_cause: match.distress_cause,
          confidence: match.confidence
        }
      };
    }
    return PRIYA_DEMO_DATA;
  },

  async submitCustomerConsent(customerId, interventionId) {
    return {
      status: "SUCCESS",
      message: "Customer consent securely recorded in immutable audit log.",
      action_id: `ACT_${Date.now()}`,
      execution_mode: "TIER_B_ROUTED_FOR_APPROVAL",
      active_status: "Intervention Active — Reversible Monitoring"
    };
  }
};
