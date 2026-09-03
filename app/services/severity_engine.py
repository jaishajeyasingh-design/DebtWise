"""
Deterministic Severity Engine
Evaluates multi-factor risk indicators to assign explainable severity: LOW, MODERATE, HIGH, CRITICAL.
"""
from typing import Dict, Any, List, Union
from app.schemas.customer import CustomerInput
from app.schemas.capacity import RepaymentCapacityResult
from app.schemas.diagnosis import DiagnosisResult
from app.schemas.intervention import SeverityResult
from app.rules.policy_config import (
    SEVERITY_DTI_MODERATE,
    SEVERITY_DTI_HIGH,
    SEVERITY_DTI_CRITICAL,
    SEVERITY_BUFFER_LOW_MONTHS,
    SEVERITY_BUFFER_CRITICAL_MONTHS
)


class SeverityEngine:
    """Classifies financial distress severity deterministically using explainable multi-factor metrics."""

    @classmethod
    def evaluate_severity(
        cls,
        customer: Union[CustomerInput, Dict[str, Any]],
        capacity: RepaymentCapacityResult,
        diagnosis: DiagnosisResult
    ) -> SeverityResult:
        """
        Calculates explainable severity level based on financial metrics, cash-flow deficit, and payment history.
        """
        if isinstance(customer, CustomerInput):
            data = customer.to_dict()
        else:
            data = customer

        delays = data.get("payment_delays", [0])
        overdrafts = data.get("overdraft_count", [0])
        total_delays = sum(delays)
        recent_delays = sum(delays[-3:]) if len(delays) >= 3 else total_delays
        total_overdrafts = sum(overdrafts)

        reasons: List[str] = []
        score = 0  # 0: LOW, 1-2: MODERATE, 3-4: HIGH, 5+: CRITICAL

        # 1. DTI Evaluation
        if capacity.dti >= SEVERITY_DTI_CRITICAL:
            score += 3
            reasons.append(f"DTI ratio of {capacity.dti:.1%} is at a critical level (> {SEVERITY_DTI_CRITICAL:.0%}).")
        elif capacity.dti >= SEVERITY_DTI_HIGH:
            score += 2
            reasons.append(f"High DTI ratio of {capacity.dti:.1%} exceeds safe threshold ({SEVERITY_DTI_HIGH:.0%}).")
        elif capacity.dti >= SEVERITY_DTI_MODERATE:
            score += 1
            reasons.append(f"Moderate DTI ratio of {capacity.dti:.1%}.")

        # 2. EMI Deficit Gap
        if capacity.affordability_status == "CRITICAL_DEFICIT":
            score += 2
            reasons.append("Severe cash-flow deficit: obligations significantly exceed safe capacity.")
        elif capacity.affordability_status == "DEFICIT":
            score += 1
            reasons.append(f"Monthly EMI gap of ₹{capacity.emi_gap:,.0f} exceeds sustainable surplus.")

        # 3. Liquid Buffer Depletion
        if capacity.liquid_buffer_months < SEVERITY_BUFFER_CRITICAL_MONTHS:
            score += 2
            reasons.append(f"Near-total depletion of emergency savings ({capacity.liquid_buffer_months:.2f} months).")
        elif capacity.liquid_buffer_months < SEVERITY_BUFFER_LOW_MONTHS:
            score += 1
            reasons.append(f"Emergency buffer is depleted below 1.0 month ({capacity.liquid_buffer_months:.2f} months).")

        # 4. Behavioral Payment Indicators (Delays & Overdrafts)
        if recent_delays >= 2:
            score += 2
            reasons.append(f"Multiple recent payment delays ({recent_delays} in last 3 months).")
        elif recent_delays == 1 or total_delays >= 1:
            score += 1
            reasons.append("Recent payment delay recorded.")

        if total_overdrafts >= 3:
            score += 1
            reasons.append(f"Frequent recurring overdraft events ({total_overdrafts} total).")

        # 5. Archetype-Specific Weighting
        if diagnosis.primary_cause == "STRUCTURAL_DISTRESS":
            score += 1
            reasons.append("Diagnosed with Structural Distress (chronic income-to-living-cost deficit).")

        # Determine Final Categorical Severity
        if score >= 5 or capacity.affordability_status == "CRITICAL_DEFICIT" and score >= 3:
            severity = "CRITICAL"
        elif score >= 3:
            severity = "HIGH"
        elif score >= 1:
            severity = "MODERATE"
        else:
            severity = "LOW"
            reasons.append("Financial metrics within healthy sustainable parameters.")

        indicators = {
            "score": score,
            "dti": capacity.dti,
            "emi_gap": capacity.emi_gap,
            "liquid_buffer_months": capacity.liquid_buffer_months,
            "recent_payment_delays": recent_delays,
            "total_overdraft_count": total_overdrafts,
            "primary_distress_cause": diagnosis.primary_cause,
            "ml_confidence": diagnosis.confidence
        }

        return SeverityResult(
            severity=severity,
            reasons=reasons,
            indicators=indicators
        )
