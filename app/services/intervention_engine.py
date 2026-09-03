"""
Intervention Recommendation Engine
Generates and ranks candidate interventions along the 7-level FinShield ladder.
Prioritizes lowest-level, least intrusive, reversible, and affordable options.
"""
from typing import List, Dict, Any, Union
from app.schemas.customer import CustomerInput
from app.schemas.capacity import RepaymentCapacityResult
from app.schemas.diagnosis import DiagnosisResult
from app.schemas.intervention import InterventionCandidate, SeverityResult
from app.rules.intervention_rules import INTERVENTION_TEMPLATES_BY_CAUSE, LADDER_LEVELS


class InterventionEngine:
    """Deterministic candidate generator and ranking engine for distress interventions."""

    @classmethod
    def generate_candidates(
        cls,
        customer: Union[CustomerInput, Dict[str, Any]],
        capacity: RepaymentCapacityResult,
        diagnosis: DiagnosisResult,
        severity: SeverityResult
    ) -> List[InterventionCandidate]:
        """
        Generates candidate interventions for the diagnosed distress archetype with personalized relief estimates.
        """
        if isinstance(customer, CustomerInput):
            data = customer.to_dict()
        else:
            data = customer

        cause = diagnosis.primary_cause
        templates = INTERVENTION_TEMPLATES_BY_CAUSE.get(cause, INTERVENTION_TEMPLATES_BY_CAUSE["EXPENSE_SHOCK"])

        candidates: List[InterventionCandidate] = []
        curr_obligations = capacity.current_obligations
        safe_emi = capacity.safe_emi
        emi_gap = capacity.emi_gap
        avg_income = capacity.average_income

        # Include Level 0 Monitor option only for truly benign / low risk cases without active distress symptoms
        is_healthy = (
            severity.severity == "LOW" and
            sum(data.get("payment_delays", [0])) == 0 and
            sum(data.get("overdraft_count", [0])) == 0 and
            capacity.affordability_status == "SURPLUS" and
            capacity.dti <= 0.35
        )
        if is_healthy:
            candidates.append(
                InterventionCandidate(
                    id="MON-L0-STANDARD",
                    level=0,
                    name="Automated Early Distress Monitoring",
                    intervention_type="PASSIVE_TELEMETRY_MONITORING",
                    title="Continuous Healthy Financial Surveillance",
                    description="Maintain passive real-time telemetry monitoring for early cash-flow velocity changes.",
                    reason="Customer currently maintains healthy sustainable cash-flow and low distress risk.",
                    estimated_monthly_relief=0.0,
                    estimated_emi_after=curr_obligations,
                    reversibility="HIGH",
                    intrusiveness="MINIMAL",
                    friction="ZERO",
                    requires_human_approval=False,
                    requires_customer_consent=False,
                    priority=0
                )
            )

        # Generate candidates from templates
        for idx, tmpl in enumerate(templates):
            level = tmpl["level"]
            calc_type = tmpl.get("relief_calculation_type", "ZERO_RELIEF")

            # Dynamic relief and post-intervention EMI calculations
            if calc_type == "ZERO_RELIEF":
                relief = 0.0
                emi_after = curr_obligations
            elif calc_type == "CAPACITY_FLOOR_RELIEF":
                # Temporarily drop EMI down to safe capacity floor
                relief = max(0.0, curr_obligations - safe_emi)
                emi_after = safe_emi
            elif calc_type == "FULL_EMI_RELIEF_TEMP":
                # 100% temporary payment holiday
                relief = curr_obligations
                emi_after = 0.0
            elif calc_type == "TENOR_EXTENSION_RELIEF":
                # 25% permanent reduction via tenor extension
                relief = round(curr_obligations * 0.25, 2)
                emi_after = round(curr_obligations * 0.75, 2)
            elif calc_type == "INCOME_MATCHED_RELIEF":
                relief = max(0.0, curr_obligations - safe_emi)
                emi_after = safe_emi
            elif calc_type == "CONSOLIDATION_INTEREST_RELIEF":
                # Proposed consolidation loan: replaces revolving balances with a fixed installment
                # If DTI is high, consolidation may still be proposed by the generation engine,
                # which the Safety Filter (SC-003) will deterministically evaluate and reject.
                relief = round(min(curr_obligations * 0.15, 4000.0), 2)
                emi_after = round(curr_obligations - relief, 2)
            elif calc_type == "CAPACITY_MATCHED_RESTRUCTURING":
                relief = max(0.0, curr_obligations - safe_emi)
                emi_after = safe_emi
            elif calc_type == "DISCRETIONARY_SAVINGS_RELIEF":
                relief = round(min(capacity.average_discretionary_expenses * 0.5, 3000.0), 2)
                emi_after = curr_obligations
            elif calc_type == "OVERDRAFT_FEE_ELIMINATION":
                # Estimated savings from eliminating late fees & overdraft charges
                num_od = sum(data.get("overdraft_count", [0])[-3:])
                relief = round(max(1000.0, num_od * 500.0), 2)
                emi_after = curr_obligations
            elif calc_type == "CUSTOM_HARDSHIP":
                relief = round(curr_obligations * 0.50, 2)
                emi_after = round(curr_obligations * 0.50, 2)
            else:
                relief = 0.0
                emi_after = curr_obligations

            candidate = InterventionCandidate(
                id=tmpl["id"],
                level=level,
                name=tmpl["title"],
                intervention_type=tmpl["intervention_type"],
                title=tmpl["title"],
                description=tmpl["description"],
                reason=tmpl["rationale"],
                estimated_monthly_relief=round(relief, 2),
                estimated_emi_after=round(emi_after, 2),
                reversibility=tmpl["reversibility"],
                intrusiveness=tmpl["intrusiveness"],
                friction=tmpl["friction"],
                requires_human_approval=tmpl["requires_human_approval"],
                requires_customer_consent=tmpl["requires_customer_consent"],
                priority=level * 10 + idx
            )
            candidates.append(candidate)

        # Sort strictly by ladder level and priority
        candidates.sort(key=lambda c: (c.level, c.priority))
        return candidates
