"""
FinShield Intervention Rules & 7-Level Ladder Templates
Defines standard intervention catalog, distress archetype mappings, and ladder metadata.
"""
from typing import Dict, List, Any
from app.rules.policy_config import (
    TIER_A_AUTO_EXECUTE_LEVELS,
    TIER_B_HUMAN_APPROVAL_LEVELS,
    TIER_C_HUMAN_ONLY_LEVELS
)

# Canonical Intervention Ladder Level Metadata
LADDER_LEVELS: Dict[int, Dict[str, Any]] = {
    0: {
        "level": 0,
        "name": "MONITOR",
        "description": "Passive telemetry tracking and early distress surveillance with zero customer friction.",
        "tier": "TIER_A",
        "intrusiveness": "MINIMAL",
        "reversibility": "HIGH"
    },
    1: {
        "level": 1,
        "name": "INFORM",
        "description": "Proactive financial insights, expense trend breakdown, and obligation calendar alerts.",
        "tier": "TIER_A",
        "intrusiveness": "LOW",
        "reversibility": "HIGH"
    },
    2: {
        "level": 2,
        "name": "TIMING FIX",
        "description": "Salary-to-EMI date synchronization, autopay re-timing, and grace period buffer.",
        "tier": "TIER_A",
        "intrusiveness": "LOW",
        "reversibility": "HIGH"
    },
    3: {
        "level": 3,
        "name": "SPENDING GUIDANCE / CATCH-UP",
        "description": "Personalized discretionary budget guardrails and structured catch-up payment schedule.",
        "tier": "TIER_B",
        "intrusiveness": "MODERATE",
        "reversibility": "HIGH"
    },
    4: {
        "level": 4,
        "name": "TEMPORARY RELIEF",
        "description": "1 to 3-month temporary EMI reduction, interest-only period, or short-term hardship relief.",
        "tier": "TIER_B",
        "intrusiveness": "MODERATE",
        "reversibility": "MEDIUM"
    },
    5: {
        "level": 5,
        "name": "FORMAL RESTRUCTURING",
        "description": "Contractual loan tenor extension, installment recalibration, or eligible debt consolidation.",
        "tier": "TIER_B",
        "intrusiveness": "SIGNIFICANT",
        "reversibility": "LOW"
    },
    6: {
        "level": 6,
        "name": "HUMAN ESCALATION",
        "description": "Dedicated Vulnerable Customer & Hardship Officer review for holistic financial intervention.",
        "tier": "TIER_C",
        "intrusiveness": "SEVERE",
        "reversibility": "IRREVERSIBLE"
    }
}


# Base Templates Mapped by Distress Archetype
INTERVENTION_TEMPLATES_BY_CAUSE: Dict[str, List[Dict[str, Any]]] = {
    "EXPENSE_SHOCK": [
        {
            "id": "EXP-L1-INSIGHT",
            "level": 1,
            "intervention_type": "SPENDING_ALERT_AND_SUPPORT_REFERRAL",
            "title": "Expense Spike Breakdown & Community Resource Guide",
            "description": "Provide instant transparent breakdown of anomalous healthcare/essential expenses and provide verified support resources.",
            "reversibility": "HIGH",
            "friction": "ZERO",
            "intrusiveness": "LOW",
            "rationale": "Helps customer immediately visualize surge impact without financial obligation changes.",
            "requires_customer_consent": False,
            "requires_human_approval": False,
            "relief_calculation_type": "ZERO_RELIEF"
        },
        {
            "id": "EXP-L4-TEMP-EMI-REDUCTION",
            "level": 4,
            "intervention_type": "TEMPORARY_EMI_REDUCTION_3MO",
            "title": "3-Month Temporary EMI Relief to Sustainable Floor",
            "description": "Temporarily reduce monthly EMI commitments to the customer's safe capacity floor for 90 days while emergency costs normalize.",
            "reversibility": "MEDIUM",
            "friction": "LOW",
            "intrusiveness": "MODERATE",
            "rationale": "Creates immediate cash-flow buffer to prevent default during acute expense recovery without increasing total loan principal.",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "CAPACITY_FLOOR_RELIEF"
        },
        {
            "id": "EXP-L5-TENOR-EXTENSION",
            "level": 5,
            "intervention_type": "TENOR_EXTENSION_6MO",
            "title": "Loan Tenor Extension (6-12 Months)",
            "description": "Extend loan repayment period to structurally lower monthly installment commitments permanently.",
            "reversibility": "LOW",
            "friction": "MEDIUM",
            "intrusiveness": "SIGNIFICANT",
            "rationale": "Permanent adjustment to lower monthly burden if emergency expenses persist beyond 3 months.",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "TENOR_EXTENSION_RELIEF"
        },
        {
            "id": "EXP-L6-HARDSHIP-ESCALATION",
            "level": 6,
            "intervention_type": "HARDSHIP_OFFICER_ESCALATION",
            "title": "Specialized Medical Hardship Officer Assignment",
            "description": "Escalate to a human Hardship Care Specialist for custom emergency assistance and concession review.",
            "reversibility": "HIGH",
            "friction": "HIGH",
            "intrusiveness": "SEVERE",
            "rationale": "For severe or multi-month medical emergencies with complete savings depletion.",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "CUSTOM_HARDSHIP"
        }
    ],

    "INCOME_SHOCK": [
        {
            "id": "INC-L1-BUDGET-INSIGHT",
            "level": 1,
            "intervention_type": "INCOME_VOLATILITY_NOTIFICATION",
            "title": "Proactive Income Volatility & Cash Buffer Analysis",
            "description": "Detailed cash runway projection showing how long current reserves last under current income drop.",
            "reversibility": "HIGH",
            "friction": "ZERO",
            "intrusiveness": "LOW",
            "rationale": "Provides transparent runway awareness to prompt early proactive action.",
            "requires_customer_consent": False,
            "requires_human_approval": False,
            "relief_calculation_type": "ZERO_RELIEF"
        },
        {
            "id": "INC-L4-PAYMENT-HOLIDAY",
            "level": 4,
            "intervention_type": "TEMPORARY_HARDSHIP_MORATORIUM_2MO",
            "title": "60-Day Hardship Payment Moratorium",
            "description": "Grant a 2-month repayment holiday while customer stabilizes income, capitalizing interest safely.",
            "reversibility": "MEDIUM",
            "friction": "LOW",
            "intrusiveness": "MODERATE",
            "rationale": "Protects customer from credit impairment during temporary employment or gig income transition.",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "FULL_EMI_RELIEF_TEMP"
        },
        {
            "id": "INC-L5-INCOME-LINKED-PLAN",
            "level": 5,
            "intervention_type": "INCOME_CONTINGENT_REPAYMENT_PLAN",
            "title": "Step-Up / Income-Contingent Repayment Plan",
            "description": "Restructure loan into graded tranches where installments ramp back up over 6-12 months as income recovers.",
            "reversibility": "LOW",
            "friction": "MEDIUM",
            "intrusiveness": "SIGNIFICANT",
            "rationale": "Matches obligations to actual reduced income profile.",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "INCOME_MATCHED_RELIEF"
        },
        {
            "id": "INC-L6-HUMAN-ESCALATION",
            "level": 6,
            "intervention_type": "HUMAN_HARDSHIP_COUNSELOR",
            "title": "Vulnerable Customer Hardship Officer Review",
            "description": "Assign dedicated hardship specialist for comprehensive restructuring and income support liaison.",
            "reversibility": "HIGH",
            "friction": "HIGH",
            "intrusiveness": "SEVERE",
            "rationale": "Essential when income drop is severe (>50%) and liquid buffer is under 1 month.",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "CUSTOM_HARDSHIP"
        }
    ],

    "DEBT_OVERLOAD": [
        {
            "id": "DEBT-L1-AWARENESS",
            "level": 1,
            "intervention_type": "DEBT_BURDEN_DIAGNOSTIC_SUMMARY",
            "title": "Transparent Total Debt & Compounding Interest Diagnostic",
            "description": "Clear visual summary of all active credit facilities, utilization rates, and compounding interest cost.",
            "reversibility": "HIGH",
            "friction": "ZERO",
            "intrusiveness": "LOW",
            "rationale": "Ensures borrower understands true cost of minimum-payment-only spiral.",
            "requires_customer_consent": False,
            "requires_human_approval": False,
            "relief_calculation_type": "ZERO_RELIEF"
        },
        {
            "id": "DEBT-L3-AVOID-BORROWING",
            "level": 3,
            "intervention_type": "CREDIT_LINE_FREEZE_AND_BUDGET_DISCIPLINE",
            "title": "Revolving Line Freeze & Fixed Avalanche Plan",
            "description": "Voluntary pause on revolving credit lines combined with structured debt avalanche allocation.",
            "reversibility": "HIGH",
            "friction": "LOW",
            "intrusiveness": "MODERATE",
            "rationale": "Halts debt growth immediately without requiring new credit or formal restructuring.",
            "requires_customer_consent": True,
            "requires_human_approval": False,
            "relief_calculation_type": "DISCRETIONARY_SAVINGS_RELIEF"
        },
        {
            "id": "DEBT-L5-CONSOLIDATION",
            "level": 5,
            "intervention_type": "DEBT_CONSOLIDATION_FACILITY",
            "title": "Low-Interest Debt Consolidation Loan",
            "description": "Consolidate high-interest revolving balances into a single fixed installment term loan at reduced APR.",
            "reversibility": "LOW",
            "friction": "MEDIUM",
            "intrusiveness": "SIGNIFICANT",
            "rationale": "Reduces blended interest rate only if borrower has sufficient capacity (Strictly subject to Safety Rule SC-003).",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "CONSOLIDATION_INTEREST_RELIEF"
        },
        {
            "id": "DEBT-L5-RESTRUCTURING",
            "level": 5,
            "intervention_type": "MULTI_LOAN_TENOR_RESTRUCTURING",
            "title": "Comprehensive Tenor Extension & Installment Recalibration",
            "description": "Recalibrate all existing term loan schedules to align total aggregate EMI with safe disposable capacity.",
            "reversibility": "LOW",
            "friction": "MEDIUM",
            "intrusiveness": "SIGNIFICANT",
            "rationale": "Safely reduces monthly cash drain across all existing debt without extending additional credit.",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "CAPACITY_MATCHED_RESTRUCTURING"
        },
        {
            "id": "DEBT-L6-SPECIALIST",
            "level": 6,
            "intervention_type": "INDEPENDENT_DEBT_COUNSELING_REFERRAL",
            "title": "Accredited Debt Counseling & Vulnerable Customer Review",
            "description": "Direct referral to certified non-profit debt advisors and bank senior workout officer.",
            "reversibility": "HIGH",
            "friction": "HIGH",
            "intrusiveness": "SEVERE",
            "rationale": "Required when DTI exceeds sustainable restructuring thresholds (>70%).",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "CUSTOM_HARDSHIP"
        }
    ],

    "CASH_FLOW_MISMATCH": [
        {
            "id": "CFM-L1-CALENDAR-ALERT",
            "level": 1,
            "intervention_type": "TIMING_DISCREPANCY_ALERT",
            "title": "Cash-Flow Timing Gap Diagnostic",
            "description": "Visual timeline showing that overdrafts occur specifically in the gap between EMI due date and salary credit.",
            "reversibility": "HIGH",
            "friction": "ZERO",
            "intrusiveness": "LOW",
            "rationale": "Clarifies that customer has sufficient income but poor calendar synchronization.",
            "requires_customer_consent": False,
            "requires_human_approval": False,
            "relief_calculation_type": "ZERO_RELIEF"
        },
        {
            "id": "CFM-L2-DATE-SYNC",
            "level": 2,
            "intervention_type": "SALARY_EMI_DATE_SYNCHRONIZATION",
            "title": "Automated EMI Due Date Shift to Post-Salary Window",
            "description": "Shift recurring loan deduction date from the 1st of the month to 3 days after verified salary credit date (e.g. 10th).",
            "reversibility": "HIGH",
            "friction": "ZERO",
            "intrusiveness": "LOW",
            "rationale": "Directly eliminates 100% of timing overdrafts and late fees permanently with zero change in debt principal.",
            "requires_customer_consent": True,
            "requires_human_approval": False,
            "relief_calculation_type": "OVERDRAFT_FEE_ELIMINATION"
        },
        {
            "id": "CFM-L2-GRACE-BUFFER",
            "level": 2,
            "intervention_type": "7_DAY_GRACE_PERIOD_BUFFER",
            "title": "Automated 7-Day Fee-Free Grace Period",
            "description": "Provide a permanent 7-day penalty-free processing buffer on all installment deductions.",
            "reversibility": "HIGH",
            "friction": "ZERO",
            "intrusiveness": "LOW",
            "rationale": "Protects against variable payroll clearing delays without touching credit history.",
            "requires_customer_consent": True,
            "requires_human_approval": False,
            "relief_calculation_type": "OVERDRAFT_FEE_ELIMINATION"
        }
    ],

    "STRUCTURAL_DISTRESS": [
        {
            "id": "STR-L1-DIAGNOSTIC",
            "level": 1,
            "intervention_type": "STRUCTURAL_FINANCIAL_HEALTH_REPORT",
            "title": "Comprehensive Structural Financial Health Assessment",
            "description": "Full audit of chronic structural deficit, identifying persistent gap between minimum living floor and income.",
            "reversibility": "HIGH",
            "friction": "ZERO",
            "intrusiveness": "LOW",
            "rationale": "Establishes baseline transparency for customer and banking support team.",
            "requires_customer_consent": False,
            "requires_human_approval": False,
            "relief_calculation_type": "ZERO_RELIEF"
        },
        {
            "id": "STR-L4-HARDSHIP-STABILIZATION",
            "level": 4,
            "intervention_type": "LONG_TERM_HARDSHIP_CONCESSION",
            "title": "Concessionary Hardship Relief & Interest Waiver",
            "description": "Immediate temporary reduction of interest rates and suspension of all punitive charges for 6 months.",
            "reversibility": "MEDIUM",
            "friction": "LOW",
            "intrusiveness": "MODERATE",
            "rationale": "Halts immediate insolvency while structured rehabilitation plan is formulated.",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "CAPACITY_FLOOR_RELIEF"
        },
        {
            "id": "STR-L6-OFFICER-WORKOUT",
            "level": 6,
            "intervention_type": "SENIOR_HARDSHIP_OFFICER_REHABILITATION",
            "title": "Comprehensive Vulnerable Borrower Rehabilitation Dossier",
            "description": "Direct assignment to Senior Hardship Officer for holistic case management, restructuring, and social support linking.",
            "reversibility": "HIGH",
            "friction": "HIGH",
            "intrusiveness": "SEVERE",
            "rationale": "Chronic structural deficit cannot be solved by algorithmic changes alone; requires human discretion.",
            "requires_customer_consent": True,
            "requires_human_approval": True,
            "relief_calculation_type": "CUSTOM_HARDSHIP"
        }
    ]
}
