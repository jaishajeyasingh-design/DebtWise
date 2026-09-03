"""
Repayment Capacity Schema
Defines strictly typed output model for deterministic repayment affordability math.
"""
from typing import List, Dict, Any
from pydantic import BaseModel, Field


class RepaymentCapacityResult(BaseModel):
    affordability_status: str = Field(
        ...,
        description="Affordability classification: SURPLUS | TIGHT | DEFICIT | CRITICAL_DEFICIT"
    )
    average_income: float = Field(..., description="Calculated representative monthly net income")
    average_essential_expenses: float = Field(..., description="Average monthly essential living expenses")
    average_discretionary_expenses: float = Field(..., description="Average monthly discretionary expenditures")
    current_obligations: float = Field(..., description="Latest monthly debt obligations / EMI")
    living_cost_floor: float = Field(..., description="Protected non-negotiable living cost floor")
    safe_disposable_income: float = Field(..., description="Income remaining after protecting living floor")
    emergency_buffer_requirement: float = Field(..., description="Target 1-month liquid emergency reserve")
    safe_emi: float = Field(..., description="Maximum sustainable monthly debt payment")
    emi_gap: float = Field(..., description="Difference between current EMI and safe affordable EMI")
    liquid_buffer_months: float = Field(..., description="Current liquid savings expressed in months of living cost")
    dti: float = Field(..., description="Debt-to-Income obligation ratio")
    policy_assumptions: Dict[str, Any] = Field(
        default_factory=dict,
        description="Explicit parameters used in calculation"
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Deterministic risk indicators and affordability alerts"
    )
