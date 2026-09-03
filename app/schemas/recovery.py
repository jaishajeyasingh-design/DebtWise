"""
Recovery Simulation & Closed-Loop Adaptation Schemas
Defines request, response, trajectory, and delta models for Phase 2 recovery monitoring and XGBoost re-scoring.
"""
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

from app.schemas.customer import CustomerInput
from app.schemas.intervention import DecisionResponse

SimulationScenario = Literal[
    "ADHERENT_RECOVERY",
    "STAGNANT_DEFICIT",
    "SECONDARY_SHOCK"
]

RecoveryStatus = Literal[
    "RECOVERED",
    "SIGNIFICANT_IMPROVEMENT",
    "MODERATE_IMPROVEMENT",
    "STAGNANT",
    "PERSISTENT_DISTRESS"
]


class RecoverySimulationRequest(BaseModel):
    """
    Request payload for deterministic forward recovery simulation.
    Accepts baseline customer financial time-series, target intervention, simulation horizon, and scenario.
    """
    customer_input: CustomerInput = Field(
        ...,
        description="Baseline customer financial state with 12-month historical time-series"
    )
    selected_intervention_id: Optional[str] = Field(
        default=None,
        description="Candidate intervention identifier to simulate (defaults to optimal safe candidate if omitted)"
    )
    horizon_months: int = Field(
        default=6,
        ge=1,
        le=12,
        description="Forward simulation projection horizon in months (1 to 12)"
    )
    scenario: SimulationScenario = Field(
        default="ADHERENT_RECOVERY",
        description="Simulation scenario: ADHERENT_RECOVERY | STAGNANT_DEFICIT | SECONDARY_SHOCK"
    )


class TrajectoryPoint(BaseModel):
    """Monthly milestone in the forward recovery trajectory."""
    month: str = Field(..., description="Display label (e.g. 'Current (M0)', 'Month 1')")
    month_index: int = Field(..., ge=0, le=12, description="Month index (0 to 12)")
    stress_index: float = Field(..., ge=0.0, le=100.0, description="Calculated stress score percentage (0-100%)")
    savings_balance: float = Field(..., description="Projected liquid savings reserve (₹)")
    scheduled_emi: float = Field(..., ge=0.0, description="Projected scheduled monthly EMI obligation (₹)")
    dti_percent: float = Field(..., ge=0.0, description="Projected debt-to-income ratio percentage")
    status_label: str = Field(..., description="Descriptive recovery phase label")


class BeforeAfterDelta(BaseModel):
    """Measurable before vs. after comparison of financial and risk indicators."""
    baseline_diagnosis: str = Field(..., description="Initial ML diagnosed distress root cause")
    baseline_confidence: float = Field(..., description="Initial ML classification confidence")
    baseline_severity: str = Field(..., description="Initial deterministic severity classification")
    baseline_stress_index: float = Field(..., description="Initial calculated financial stress percentage")
    baseline_dti_percent: float = Field(..., description="Initial debt-to-income percentage")
    baseline_savings: float = Field(..., description="Initial liquid savings balance (₹)")
    baseline_obligations: float = Field(..., description="Initial monthly obligations (₹)")

    post_intervention_diagnosis: str = Field(..., description="Re-scored ML diagnosed distress cause")
    post_intervention_confidence: float = Field(..., description="Re-scored ML classification confidence")
    post_intervention_severity: str = Field(..., description="Re-scored severity classification")
    post_intervention_stress_index: float = Field(..., description="Projected financial stress percentage")
    post_intervention_dti_percent: float = Field(..., description="Projected debt-to-income percentage")
    post_intervention_savings: float = Field(..., description="Projected liquid savings balance (₹)")
    post_intervention_obligations: float = Field(..., description="Projected monthly obligations (₹)")

    stress_reduction_percent: float = Field(..., description="Percentage change in stress index (positive = improvement)")
    savings_growth_amount: float = Field(..., description="Net change in liquid savings reserve (₹)")
    monthly_relief_amount: float = Field(..., description="Monthly cash-flow relief applied during simulation (₹)")


class RecoverySimulationResponse(BaseModel):
    """
    Complete closed-loop recovery simulation response.
    Contains forward trajectory, before-after deltas, second-pass XGBoost re-scoring, and adaptation trigger.
    """
    customer_id: str = Field(..., description="Customer identifier")
    scenario: SimulationScenario = Field(..., description="Simulated scenario mode")
    horizon_months: int = Field(..., description="Simulated horizon in months")
    selected_intervention_id: str = Field(..., description="Intervention candidate applied in simulation")
    selected_intervention_title: str = Field(..., description="Display title of simulated intervention")

    delta: BeforeAfterDelta = Field(..., description="Before vs after quantitative metrics comparison")
    recovery_status: RecoveryStatus = Field(..., description="Measurable recovery progression classification")
    trajectory: List[TrajectoryPoint] = Field(..., description="Month-by-month forward telemetry trajectory")

    is_adaptation_required: bool = Field(
        ...,
        description="True if recovery stalled or secondary shock occurred, requiring an adapted plan"
    )
    adapted_decision: Optional[DecisionResponse] = Field(
        default=None,
        description="Fresh decision engine output generated on the post-intervention state when adaptation is required"
    )

    narrative_summary: str = Field(..., description="Plain-English explanation of the simulated recovery trajectory")
    disclaimer: str = Field(
        default="SIMULATED ESTIMATE — NOT A GUARANTEED OUTCOME. Projections are rule-based feasibility estimates, not causal guarantees.",
        description="Responsible AI simulation disclaimer"
    )
