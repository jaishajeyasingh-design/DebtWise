"""
Synthetic Financial Dataset Generator for FinShield
Generates realistic 6-12 month financial time-series for 5 distinct distress archetypes.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
import random

from finshield_ml.config import (
    DISTRESS_CLASSES,
    DEFAULT_NUM_CUSTOMERS,
    DEFAULT_HISTORY_MONTHS,
    RANDOM_SEED
)


class SyntheticFinancialGenerator:
    """
    Generates synthetic multi-month financial time-series for distressed customers.
    Ensures clear, explainable financial causality for the 5 archetypes:
      1. INCOME_SHOCK: Sudden 30-60% drop in net income in recent months.
      2. DEBT_OVERLOAD: High baseline debt, high DTI/obligations, maxed credit lines.
      3. CASH_FLOW_MISMATCH: Timing friction between deposit date (e.g. 7th) vs due date (1st).
      4. EXPENSE_SHOCK: Sudden spike in essential/medical expenses while income remains stable.
      5. STRUCTURAL_DISTRESS: Chronic deficit where living costs + obligations persistently exceed income.
    """

    def __init__(self, seed: int = RANDOM_SEED):
        self.seed = seed
        np.random.seed(seed)
        random.seed(seed)

    def generate_customer_series(
        self,
        customer_id: str,
        distress_cause: str,
        months: int = 12
    ) -> Dict[str, Any]:
        """Generates multi-month financial time series for a single customer."""
        
        # Base demographics / financial baseline
        base_income = float(np.random.choice([35000, 45000, 60000, 75000, 90000, 120000], 
                                             p=[0.15, 0.25, 0.30, 0.15, 0.10, 0.05]))
        # Add random baseline noise
        base_income += np.random.normal(0, 1500)
        base_income = max(25000.0, base_income)

        # Baseline ratios for healthy state before shock
        base_essential_pct = np.random.uniform(0.35, 0.48)
        base_discretionary_pct = np.random.uniform(0.12, 0.22)
        base_obligation_pct = np.random.uniform(0.20, 0.35)
        
        # Arrays to hold time series
        income = np.full(months, base_income)
        essential_exp = np.full(months, base_income * base_essential_pct)
        discretionary_exp = np.full(months, base_income * base_discretionary_pct)
        obligations = np.full(months, base_income * base_obligation_pct)
        total_debt = np.full(months, obligations[0] * np.random.uniform(18, 30))
        savings = np.full(months, base_income * np.random.uniform(1.5, 3.5))
        credit_limit = float(np.random.choice([50000, 100000, 150000, 200000]))
        credit_balance = np.full(months, credit_limit * np.random.uniform(0.15, 0.35))
        payment_delays = np.zeros(months, dtype=int)
        overdraft_count = np.zeros(months, dtype=int)
        min_payment_flag = np.zeros(months, dtype=int)

        # Default standard timing (healthy alignment: salary on 1st, EMI on 5th)
        salary_day = np.random.choice([1, 2, 3, 4])
        emi_due_day = salary_day + np.random.choice([3, 4, 5])

        # Add small natural monthly noise across standard months
        for m in range(months):
            income[m] += np.random.normal(0, base_income * 0.02)
            essential_exp[m] += np.random.normal(0, essential_exp[m] * 0.03)
            discretionary_exp[m] += np.random.normal(0, discretionary_exp[m] * 0.05)

        # -------------------------------------------------------------
        # Inject Archetype-Specific Distress Dynamics in recent 3-5 months
        # -------------------------------------------------------------
        shock_start = months - np.random.randint(3, 5) # Shock starts in recent 3-4 months

        if distress_cause == "INCOME_SHOCK":
            # Sudden drop in income (job loss, bonus cut, business slowdown)
            drop_factor = np.random.uniform(0.35, 0.65) # loses 35-65% income
            for m in range(shock_start, months):
                income[m] = base_income * (1.0 - drop_factor) + np.random.normal(0, 1000)
                # Customer tries cutting discretionary spend
                discretionary_exp[m] = max(1000.0, discretionary_exp[m] * 0.4)
                # But essential expenses and fixed obligations stay rigid
                # Savings drain rapidly to service debt & living costs
                drain = (essential_exp[m] + obligations[m]) - income[m]
                if drain > 0:
                    savings[m] = max(0.0, savings[m-1] - drain)
                else:
                    savings[m] = savings[m-1] * 0.85
                
                # Credit utilization climbs as customer borrows to bridge gap
                credit_balance[m] = min(credit_limit, credit_balance[m-1] + max(0, drain * 0.5))
                # Payment delays start occurring
                if m >= shock_start + 1:
                    payment_delays[m] = np.random.choice([0, 1, 1])
                    if savings[m] < 5000:
                        overdraft_count[m] = np.random.randint(1, 3)

        elif distress_cause == "DEBT_OVERLOAD":
            # High baseline debt and accelerating borrowing
            # Higher initial obligations (50-75% of income)
            base_obligation_pct = np.random.uniform(0.50, 0.72)
            obligations = np.full(months, base_income * base_obligation_pct)
            total_debt = obligations * np.random.uniform(25, 45)
            # Credit utilization starts high and stays saturated (> 80-95%)
            credit_balance = np.full(months, credit_limit * np.random.uniform(0.82, 0.98))
            savings = np.full(months, base_income * np.random.uniform(0.1, 0.5)) # very thin savings
            
            for m in range(1, months):
                # Debt compounding and taking new personal loans
                if m >= shock_start:
                    total_debt[m] = total_debt[m-1] * np.random.uniform(1.02, 1.06)
                    obligations[m] = obligations[m-1] * np.random.uniform(1.01, 1.04)
                    credit_balance[m] = min(credit_limit * 0.99, credit_balance[m-1] * 1.02)
                    min_payment_flag[m] = 1
                    payment_delays[m] = np.random.choice([0, 1, 1])
                    savings[m] = max(0.0, savings[m-1] * 0.9)
                else:
                    total_debt[m] = total_debt[m-1]
                    savings[m] = savings[m-1]

        elif distress_cause == "CASH_FLOW_MISMATCH":
            # Overall income is healthy and debt is moderate, but payment dates conflict
            salary_day = np.random.choice([6, 7, 8, 9, 10]) # salary credited later
            emi_due_day = np.random.choice([1, 2, 3])        # EMI deducted earlier
            
            # Low savings buffer so balance dips negative between 1st and salary day
            savings = np.full(months, base_income * np.random.uniform(0.2, 0.8))
            
            for m in range(months):
                # Persistent recurring overdrafts around month start
                if m >= shock_start - 2:
                    overdraft_count[m] = np.random.randint(1, 4)
                    payment_delays[m] = np.random.choice([0, 1]) # Technical delay until salary lands
                # But fundamental income and debt remain healthy
                credit_balance[m] = credit_limit * np.random.uniform(0.20, 0.45)

        elif distress_cause == "EXPENSE_SHOCK":
            # Income is stable, but non-discretionary expenses surge (medical, urgent repairs)
            for m in range(shock_start, months):
                expense_surge = np.random.uniform(0.45, 1.10) # +45% to +110% expense spike
                essential_exp[m] = essential_exp[0] * (1.0 + expense_surge)
                
                # Savings drain rapidly to cover the medical/repair shock
                deficit = (essential_exp[m] + obligations[m] + discretionary_exp[m]) - income[m]
                if deficit > 0:
                    savings[m] = max(0.0, savings[m-1] - deficit)
                
                # Credit balance increases to pay emergency bills
                credit_balance[m] = min(credit_limit, credit_balance[m-1] + max(0, deficit * 0.4))
                
                if m >= shock_start + 1:
                    if savings[m] < 10000:
                        overdraft_count[m] = np.random.randint(1, 3)
                        payment_delays[m] = np.random.choice([0, 1])

        elif distress_cause == "STRUCTURAL_DISTRESS":
            # Chronic, persistent deficit across all months
            # Income is inherently insufficient to cover basic life + minimum debt
            base_essential_pct = np.random.uniform(0.60, 0.78)
            base_obligation_pct = np.random.uniform(0.40, 0.55)
            essential_exp = np.full(months, base_income * base_essential_pct)
            obligations = np.full(months, base_income * base_obligation_pct)
            savings = np.full(months, np.random.uniform(0, 3000)) # practically zero
            credit_balance = np.full(months, credit_limit * np.random.uniform(0.85, 0.99))
            
            for m in range(months):
                min_payment_flag[m] = 1
                payment_delays[m] = np.random.choice([1, 1, 0])
                overdraft_count[m] = np.random.randint(1, 4)

        # Ensure all values are non-negative and properly formatted
        return {
            "customer_id": customer_id,
            "distress_cause": distress_cause,
            "history_months": months,
            "salary_day": int(salary_day),
            "emi_due_day": int(emi_due_day),
            "income": [round(float(x), 2) for x in income],
            "essential_expenses": [round(float(x), 2) for x in essential_exp],
            "discretionary_expenses": [round(float(x), 2) for x in discretionary_exp],
            "obligations": [round(float(x), 2) for x in obligations],
            "total_debt": [round(float(x), 2) for x in total_debt],
            "savings": [round(float(x), 2) for x in savings],
            "credit_limit": round(float(credit_limit), 2),
            "credit_balance": [round(float(x), 2) for x in credit_balance],
            "payment_delays": [int(x) for x in payment_delays],
            "overdraft_count": [int(x) for x in overdraft_count],
            "min_payment_flag": [int(x) for x in min_payment_flag]
        }

    def generate_dataset(
        self,
        num_customers: int = DEFAULT_NUM_CUSTOMERS,
        history_months: int = DEFAULT_HISTORY_MONTHS
    ) -> List[Dict[str, Any]]:
        """Generates a balanced dataset of synthetic customer histories."""
        dataset = []
        per_class = num_customers // len(DISTRESS_CLASSES)
        remainder = num_customers % len(DISTRESS_CLASSES)
        
        cust_idx = 1
        for cls_name in DISTRESS_CLASSES:
            count = per_class + (1 if remainder > 0 else 0)
            remainder = max(0, remainder - 1)
            
            for _ in range(count):
                cust_id = f"CUST_{cust_idx:05d}"
                # Add slight variance in history length (between 6 and 12 months)
                months = int(np.random.choice([6, 9, 12], p=[0.1, 0.2, 0.7]))
                months = min(months, history_months)
                
                record = self.generate_customer_series(cust_id, cls_name, months=months)
                dataset.append(record)
                cust_idx += 1
                
        # Shuffle dataset
        random.shuffle(dataset)
        return dataset
