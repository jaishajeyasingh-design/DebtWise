"""
Deterministic Demo Customers for FinShield
Provides canonical, realistic customer profiles for live demos, testing, and pitch presentations.
"""
from typing import Dict, List, Any


# 1. PRIYA — EXPENSE SHOCK (The Hero Presentation Story)
PRIYA_EXPENSE_SHOCK: Dict[str, Any] = {
    "customer_id": "CUST_PRIYA_34",
    "name": "Priya Sharma",
    "age": 34,
    "distress_cause": "EXPENSE_SHOCK",
    "history_months": 12,
    "salary_day": 1,
    "emi_due_day": 5,
    "credit_limit": 100000.0,
    # Stable monthly income of ₹60,000 across all 12 months
    "income": [60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0],
    # Baseline essential expenses ₹22,000 suddenly surging to ₹38,000-₹41,000 due to medical emergency in months 10-12
    "essential_expenses": [22000.0, 22500.0, 22000.0, 23000.0, 22000.0, 22500.0, 22000.0, 23000.0, 24000.0, 39000.0, 41000.0, 39500.0],
    # Tightened discretionary spend as emergency hit
    "discretionary_expenses": [8000.0, 8500.0, 8000.0, 7500.0, 8000.0, 8000.0, 7500.0, 7000.0, 6000.0, 2000.0, 1500.0, 1500.0],
    # Fixed Home Loan EMI obligations: ₹25,000/month
    "obligations": [25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0],
    "total_debt": [480000.0, 475000.0, 470000.0, 465000.0, 460000.0, 455000.0, 450000.0, 445000.0, 440000.0, 435000.0, 430000.0, 425000.0],
    # Emergency savings drained from ₹55,000 to ₹10,000
    "savings": [55000.0, 56000.0, 54000.0, 55000.0, 53000.0, 52000.0, 50000.0, 48000.0, 45000.0, 22000.0, 12000.0, 10000.0],
    # Revolving credit climbed to cover clinic bills
    "credit_balance": [18000.0, 19000.0, 17500.0, 18000.0, 19000.0, 20000.0, 19500.0, 21000.0, 25000.0, 55000.0, 68000.0, 72000.0],
    "payment_delays": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    "overdraft_count": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2],
    "min_payment_flag": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1]
}


# 2. ARUN — DEBT OVERLOAD
ARUN_DEBT_OVERLOAD: Dict[str, Any] = {
    "customer_id": "CUST_ARUN_42",
    "name": "Arun Patel",
    "age": 42,
    "distress_cause": "DEBT_OVERLOAD",
    "history_months": 12,
    "salary_day": 1,
    "emi_due_day": 4,
    "credit_limit": 150000.0,
    # Monthly income of ₹50,000
    "income": [50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0, 50000.0],
    # Normal essential living costs (₹18,000 = 36% of income)
    "essential_expenses": [18000.0, 18500.0, 18000.0, 18000.0, 18500.0, 18000.0, 18500.0, 18000.0, 18500.0, 18000.0, 18500.0, 18000.0],
    "discretionary_expenses": [6000.0, 5500.0, 5000.0, 4500.0, 4000.0, 3500.0, 3000.0, 2500.0, 2000.0, 1500.0, 1000.0, 1000.0],
    # Excessive and compounding loan obligations: EMIs grow from ₹28k to ₹35k/month (56% -> 70% of income!)
    "obligations": [28000.0, 28000.0, 29000.0, 30000.0, 31000.0, 32000.0, 33000.0, 33500.0, 34000.0, 34500.0, 35000.0, 35500.0],
    # Rapidly compounding debt from ₹480,000 to ₹720,000 (+50% growth)
    "total_debt": [480000.0, 500000.0, 520000.0, 545000.0, 570000.0, 595000.0, 620000.0, 645000.0, 670000.0, 690000.0, 710000.0, 720000.0],
    "savings": [30000.0, 28000.0, 25000.0, 22000.0, 18000.0, 15000.0, 12000.0, 9000.0, 6000.0, 4000.0, 2500.0, 1500.0],
    # Credit cards almost 100% maxed out (utilization = 98%)
    "credit_balance": [95000.0, 105000.0, 115000.0, 125000.0, 132000.0, 138000.0, 142000.0, 145000.0, 146500.0, 147500.0, 148000.0, 148500.0],
    # Delays and min payments kick in as debt compounding becomes unsustainable
    "payment_delays": [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
    "overdraft_count": [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3],
    "min_payment_flag": [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]
}


# 3. RAHUL — INCOME SHOCK
RAHUL_INCOME_SHOCK: Dict[str, Any] = {
    "customer_id": "CUST_RAHUL_29",
    "name": "Rahul Verma",
    "age": 29,
    "distress_cause": "INCOME_SHOCK",
    "history_months": 12,
    "salary_day": 1,
    "emi_due_day": 5,
    "credit_limit": 120000.0,
    # High baseline income (₹75k) dropping severely to ₹28k in recent 4 months
    "income": [75000.0, 76000.0, 74000.0, 75000.0, 77000.0, 75000.0, 74000.0, 75000.0, 32000.0, 28000.0, 29000.0, 28000.0],
    "essential_expenses": [24000.0, 24500.0, 24000.0, 24000.0, 25000.0, 24000.0, 24500.0, 24000.0, 22000.0, 21000.0, 20500.0, 20000.0],
    "discretionary_expenses": [14000.0, 15000.0, 13500.0, 14000.0, 15000.0, 14000.0, 13000.0, 12000.0, 4000.0, 2000.0, 1500.0, 1000.0],
    # Fixed auto & gadget loan commitments: ₹22,000/mo
    "obligations": [22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0, 22000.0],
    "total_debt": [320000.0, 310000.0, 300000.0, 290000.0, 280000.0, 270000.0, 260000.0, 250000.0, 242000.0, 235000.0, 228000.0, 220000.0],
    "savings": [65000.0, 68000.0, 67000.0, 70000.0, 72000.0, 74000.0, 75000.0, 72000.0, 42000.0, 21000.0, 10000.0, 4000.0],
    "credit_balance": [20000.0, 22000.0, 19000.0, 21000.0, 23000.0, 20000.0, 22000.0, 25000.0, 52000.0, 78000.0, 92000.0, 98000.0],
    "payment_delays": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    "overdraft_count": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2],
    "min_payment_flag": [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
}


# 4. MEENA — CASH-FLOW MISMATCH
MEENA_CASH_FLOW_MISMATCH: Dict[str, Any] = {
    "customer_id": "CUST_MEENA_31",
    "name": "Meena Iyer",
    "age": 31,
    "distress_cause": "CASH_FLOW_MISMATCH",
    "history_months": 12,
    # Crucial timing conflict: Salary credited on 8th, while EMI autopay deducted on 1st
    "salary_day": 8,
    "emi_due_day": 1,
    "credit_limit": 100000.0,
    # Healthy, steady salary of ₹65,000/mo
    "income": [65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0, 65000.0],
    "essential_expenses": [25000.0, 25500.0, 25000.0, 25000.0, 26000.0, 25000.0, 25500.0, 25000.0, 25000.0, 25500.0, 25000.0, 25000.0],
    "discretionary_expenses": [10000.0, 10500.0, 10000.0, 9500.0, 10000.0, 10000.0, 9500.0, 10000.0, 9000.0, 9500.0, 9000.0, 9000.0],
    # Low/moderate EMI obligations: ₹18,000/mo (Affordable 27% DTI)
    "obligations": [18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0, 18000.0],
    "total_debt": [280000.0, 270000.0, 260000.0, 250000.0, 240000.0, 230000.0, 220000.0, 210000.0, 200000.0, 190000.0, 180000.0, 170000.0],
    # Moderate savings buffer (around ₹15k-₹20k) which gets temporarily emptied right before salary day
    "savings": [20000.0, 19000.0, 21000.0, 18000.0, 22000.0, 19000.0, 20000.0, 18000.0, 17000.0, 16000.0, 15000.0, 15000.0],
    "credit_balance": [25000.0, 24000.0, 26000.0, 23000.0, 27000.0, 25000.0, 26000.0, 24000.0, 25000.0, 26000.0, 25000.0, 25000.0],
    # Recurring temporary payment delay (1st to 8th) and overdraft charges
    "payment_delays": [0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    "overdraft_count": [1, 2, 1, 2, 2, 1, 2, 2, 3, 2, 3, 3],
    "min_payment_flag": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}


DEMO_CUSTOMERS = [
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
]


def get_demo_customer(name_or_cause: str) -> Dict[str, Any]:
    """Retrieves a deterministic demo customer by name or archetype keyword."""
    query = name_or_cause.lower().strip()
    for cust in DEMO_CUSTOMERS:
        if query in cust["name"].lower() or query in cust["distress_cause"].lower():
            return cust
    raise KeyError(f"No demo customer matching '{name_or_cause}'. Choose from Priya, Arun, Rahul, Meena.")
