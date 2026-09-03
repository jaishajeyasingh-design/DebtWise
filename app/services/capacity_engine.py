"""
Deterministic Repayment Capacity Engine
Calculates sustainable monthly debt repayment affordability, living cost floors, and cash-flow gaps.
Purely deterministic arithmetic — ZERO black-box ML model overrides.
"""
import numpy as np
from typing import Dict, Any, List, Union
from app.schemas.customer import CustomerInput
from app.schemas.capacity import RepaymentCapacityResult
from app.rules.policy_config import (
    MIN_LIVING_COST_FLOOR_RATIO,
    TARGET_EMERGENCY_BUFFER_MONTHS,
    MAX_SAFE_DTI_RATIO,
    SAFE_DISPOSABLE_CAPACITY_FACTOR
)


class CapacityEngine:
    """Deterministic mathematical engine for borrower repayment capacity."""

    @classmethod
    def calculate_capacity(
        cls,
        customer: Union[CustomerInput, Dict[str, Any]],
        recent_window_months: int = 3
    ) -> RepaymentCapacityResult:
        """
        Calculates deterministic repayment capacity and affordability metrics.
        
        Args:
            customer: CustomerInput schema instance or raw customer dictionary.
            recent_window_months: Number of recent months for rolling average calculation.
            
        Returns:
            RepaymentCapacityResult with verified financial metrics and explicit assumptions.
        """
        if isinstance(customer, CustomerInput):
            data = customer.to_dict()
        else:
            data = customer

        # Extract series safely with robust non-empty defaults
        income_series = [float(x) for x in data.get("income", [0.0])]
        essential_series = [float(x) for x in data.get("essential_expenses", [0.0])]
        discretionary_series = [float(x) for x in data.get("discretionary_expenses", [0.0])]
        obligations_series = [float(x) for x in data.get("obligations", [0.0])]
        savings_series = [float(x) for x in data.get("savings", [0.0])]

        # Use recent window (default 3 months) or full series if shorter
        k = max(1, min(recent_window_months, len(income_series)))
        recent_income = income_series[-k:]
        recent_essential = essential_series[-k:]
        recent_discretionary = discretionary_series[-k:]

        # 1. Representative Monthly Averages
        avg_income = max(0.0, float(np.mean(recent_income)))
        avg_essential = max(0.0, float(np.mean(recent_essential)))
        avg_discretionary = max(0.0, float(np.mean(recent_discretionary)))
        curr_obligations = max(0.0, float(obligations_series[-1]))
        curr_savings = max(0.0, float(savings_series[-1]))

        # 2. Non-Negotiable Living Cost Floor
        # Baseline protected living expenses: at least 40% of income or actual essential expenses
        living_cost_floor = max(avg_essential, avg_income * MIN_LIVING_COST_FLOOR_RATIO)

        # 3. Safe Disposable Income
        safe_disposable_income = max(0.0, avg_income - living_cost_floor)

        # 4. Emergency Buffer Requirement (1.0 month of living cost floor)
        emergency_buffer_requirement = living_cost_floor * TARGET_EMERGENCY_BUFFER_MONTHS

        # 5. Maximum Sustainable Safe EMI
        # Capped by 85% of safe disposable income AND 50% max DTI
        safe_emi_disposable_cap = safe_disposable_income * SAFE_DISPOSABLE_CAPACITY_FACTOR
        safe_emi_dti_cap = avg_income * MAX_SAFE_DTI_RATIO
        safe_emi = max(0.0, min(safe_emi_disposable_cap, safe_emi_dti_cap))

        # 6. Current EMI Gap (Deficit if positive, surplus if negative)
        emi_gap = curr_obligations - safe_emi

        # 7. Liquid Buffer Months
        denom_floor = max(1.0, living_cost_floor)
        liquid_buffer_months = max(0.0, curr_savings / denom_floor)

        # 8. Debt-to-Income (DTI) Ratio
        denom_income = max(1.0, avg_income)
        dti = max(0.0, curr_obligations / denom_income)

        # 9. Deterministic Affordability Status & Warnings
        warnings: List[str] = []

        if avg_income <= 0.0:
            affordability_status = "CRITICAL_DEFICIT"
            warnings.append("Zero or non-positive income recorded.")
        elif dti > 0.70:
            affordability_status = "CRITICAL_DEFICIT"
            warnings.append(f"Severe debt overload: DTI of {dti:.1%} exceeds critical 70% threshold.")
        elif emi_gap > 0.0 and (safe_disposable_income + (curr_savings / 3.0) < curr_obligations):
            affordability_status = "CRITICAL_DEFICIT"
            warnings.append(f"Monthly cash shortfall of ₹{emi_gap:,.0f} cannot be sustained by liquid reserves.")
        elif emi_gap > 0.0:
            affordability_status = "DEFICIT"
            warnings.append(f"Monthly EMI of ₹{curr_obligations:,.0f} exceeds safe capacity of ₹{safe_emi:,.0f}.")
        elif safe_disposable_income < curr_obligations * 1.15:
            affordability_status = "TIGHT"
            warnings.append("Tight cash-flow: obligations consume majority of safe disposable income.")
        else:
            affordability_status = "SURPLUS"

        if liquid_buffer_months < 0.25:
            warnings.append(f"Depleted emergency reserves: {liquid_buffer_months:.2f} months remaining.")

        policy_assumptions = {
            "min_living_cost_floor_ratio": MIN_LIVING_COST_FLOOR_RATIO,
            "target_emergency_buffer_months": TARGET_EMERGENCY_BUFFER_MONTHS,
            "max_safe_dti_ratio": MAX_SAFE_DTI_RATIO,
            "safe_disposable_capacity_factor": SAFE_DISPOSABLE_CAPACITY_FACTOR,
            "recent_window_months": k
        }

        return RepaymentCapacityResult(
            affordability_status=affordability_status,
            average_income=round(avg_income, 2),
            average_essential_expenses=round(avg_essential, 2),
            average_discretionary_expenses=round(avg_discretionary, 2),
            current_obligations=round(curr_obligations, 2),
            living_cost_floor=round(living_cost_floor, 2),
            safe_disposable_income=round(safe_disposable_income, 2),
            emergency_buffer_requirement=round(emergency_buffer_requirement, 2),
            safe_emi=round(safe_emi, 2),
            emi_gap=round(emi_gap, 2),
            liquid_buffer_months=round(liquid_buffer_months, 3),
            dti=round(dti, 4),
            policy_assumptions=policy_assumptions,
            warnings=warnings
        )
