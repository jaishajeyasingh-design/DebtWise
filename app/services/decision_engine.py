"""
End-to-End Decision Pipeline Engine
Orchestrates diagnosis, capacity calculation, severity classification,
candidate generation, safety filtering, governance gates, and structured audit logging.
"""
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Union, Optional

from app.schemas.customer import CustomerInput
from app.schemas.diagnosis import DiagnosisResult
from app.schemas.capacity import RepaymentCapacityResult
from app.schemas.intervention import (
    InterventionCandidate,
    SafetyEvaluationResult,
    SeverityResult,
    RiskProfile,
    ConsentGate,
    HumanApprovalGate,
    AuditRecord,
    DecisionResponse
)
from app.services.diagnosis_service import DiagnosisService
from app.services.capacity_engine import CapacityEngine
from app.services.severity_engine import SeverityEngine
from app.services.intervention_engine import InterventionEngine
from app.services.safety_filter import SafetyFilter
from app.rules.policy_config import (
    TIER_A_AUTO_EXECUTE_LEVELS,
    TIER_B_HUMAN_APPROVAL_LEVELS,
    TIER_C_HUMAN_ONLY_LEVELS
)


class DecisionEngine:
    """Main FinShield Orchestrator executing the 6-stage closed-loop decision flow."""

    @classmethod
    def analyze_customer(
        cls,
        customer_input: Union[CustomerInput, Dict[str, Any]]
    ) -> DecisionResponse:
        """
        Executes complete FinShield end-to-end pipeline:
        DIAGNOSE -> CALCULATE CAPACITY -> EVALUATE SEVERITY -> GENERATE INTERVENTIONS -> SAFETY FILTER -> GOVERNANCE GATES -> AUDIT LOG -> FINAL PLAN.
        """
        # 1. Normalize and validate input
        if isinstance(customer_input, dict):
            customer = CustomerInput(**customer_input)
        else:
            customer = customer_input

        now_iso = datetime.now(timezone.utc).isoformat()

        # 2. ML Diagnosis (Phase 1 XGBoost + SHAP)
        diagnosis: DiagnosisResult = DiagnosisService.diagnose_customer(customer)

        # 3. Deterministic Repayment Capacity Engine
        capacity: RepaymentCapacityResult = CapacityEngine.calculate_capacity(customer)

        # 4. Multi-Factor Severity Classification
        severity: SeverityResult = SeverityEngine.evaluate_severity(customer, capacity, diagnosis)

        # 5. Intervention Candidate Generation (7-Level Ladder)
        candidates: List[InterventionCandidate] = InterventionEngine.generate_candidates(
            customer=customer,
            capacity=capacity,
            diagnosis=diagnosis,
            severity=severity
        )

        # 6. Deterministic Safety Filter Evaluation
        approved_candidates, safety_evaluations = SafetyFilter.filter_candidates(
            candidates=candidates,
            capacity=capacity,
            diagnosis=diagnosis,
            severity=severity,
            customer=customer
        )

        # 7. Select Optimal Intervention (Lowest appropriate ladder level that realistically resolves distress)
        selected_intervention: Optional[InterventionCandidate] = None

        if approved_candidates:
            if diagnosis.primary_cause == "CASH_FLOW_MISMATCH":
                # Primary root-cause resolution for timing lag is Level 2 Date Synchronization
                timing_options = [c for c in approved_candidates if c.level == 2]
                selected_intervention = timing_options[0] if timing_options else approved_candidates[0]
            elif capacity.affordability_status in ("DEFICIT", "CRITICAL_DEFICIT"):
                # In active cash deficit, select the lowest level that provides contractual/budget relief (Level 2+)
                actionable = [c for c in approved_candidates if c.level >= 2]
                selected_intervention = actionable[0] if actionable else approved_candidates[0]
            elif severity.severity in ("HIGH", "CRITICAL", "MODERATE"):
                actionable = [c for c in approved_candidates if c.level >= 1]
                selected_intervention = actionable[0] if actionable else approved_candidates[0]
            else:
                selected_intervention = approved_candidates[0]
        else:
            # Fallback to Level 6 Human Escalation if all algorithmic candidates failed safety
            selected_intervention = InterventionCandidate(
                id="ESC-L6-SAFETY-FALLBACK",
                level=6,
                name="Mandatory Human Hardship Officer Escalation",
                intervention_type="EMERGENCY_HUMAN_HARDSHIP_ESCALATION",
                title="Emergency Human Hardship Specialist Assignment",
                description="Algorithmic safety gates rejected all automated proposals; manual officer intervention is required.",
                reason="Severe financial constraints require human discretion to construct a bespoke sustainable plan.",
                estimated_monthly_relief=round(capacity.current_obligations * 0.50, 2),
                estimated_emi_after=round(capacity.current_obligations * 0.50, 2),
                reversibility="HIGH",
                intrusiveness="SEVERE",
                friction="HIGH",
                requires_human_approval=True,
                requires_customer_consent=True,
                priority=60
            )

        # 8. Determine Governance Tier and Approval Requirements
        if selected_intervention.level in TIER_A_AUTO_EXECUTE_LEVELS:
            tier = "TIER_A"
            customer_consent_required = selected_intervention.requires_customer_consent
            human_approval_required = False
        elif selected_intervention.level in TIER_B_HUMAN_APPROVAL_LEVELS:
            tier = "TIER_B"
            customer_consent_required = True
            human_approval_required = True
        else:
            tier = "TIER_C"
            customer_consent_required = True
            human_approval_required = True

        # 9. Explicit Consent Gate
        if customer_consent_required:
            consent_gate = ConsentGate(
                consent_required=True,
                consent_status="PENDING_CUSTOMER_CONSENT",
                consent_channel="DIGITAL_MOBILE_APP",
                terms_summary=(
                    f"Customer authorizes '{selected_intervention.title}' (Level {selected_intervention.level}), "
                    f"adjusting monthly obligation to ₹{selected_intervention.estimated_emi_after:,.0f} "
                    f"with estimated monthly cash-flow relief of ₹{selected_intervention.estimated_monthly_relief:,.0f}."
                )
            )
        else:
            consent_gate = ConsentGate(
                consent_required=False,
                consent_status="NOT_REQUIRED",
                consent_channel="NOT_APPLICABLE",
                terms_summary="Informational notification or passive monitoring; no contractual consent required."
            )

        # 10. Explicit Human Approval Gate
        if human_approval_required:
            role = "SENIOR_HARDSHIP_CARE_OFFICER" if selected_intervention.level == 6 else "BANK_CREDIT_OFFICER"
            human_approval_gate = HumanApprovalGate(
                approval_required=True,
                approval_status="PENDING_OFFICER_REVIEW",
                officer_role_required=role,
                action_items=[
                    f"Verify customer living floor protection (₹{capacity.living_cost_floor:,.0f}/mo)",
                    f"Authorize '{selected_intervention.title}' under Governance {tier}",
                    f"Confirm customer consent before binding core banking execution"
                ]
            )
        else:
            human_approval_gate = HumanApprovalGate(
                approval_required=False,
                approval_status="NOT_REQUIRED",
                officer_role_required="NOT_APPLICABLE",
                action_items=["Eligible for auto-execution via Core Banking API upon customer consent"]
            )

        # 11. Execution Readiness & Barriers
        is_executable = (
            (not consent_gate.consent_required or consent_gate.consent_status == "CONSENT_GRANTED") and
            (not human_approval_gate.approval_required or human_approval_gate.approval_status == "OFFICER_APPROVED")
        )

        if not is_executable:
            barriers: List[str] = []
            if consent_gate.consent_required and consent_gate.consent_status != "CONSENT_GRANTED":
                barriers.append("Awaiting affirmative customer consent")
            if human_approval_gate.approval_required and human_approval_gate.approval_status != "OFFICER_APPROVED":
                barriers.append("Awaiting bank officer authorization")
            execution_barrier = " & ".join(barriers)
        else:
            execution_barrier = None

        # 12. Structured Audit Record (Immutable Event Log)
        audit_seed = f"{customer.customer_id}-{now_iso}-{selected_intervention.id}"
        audit_hash = hashlib.sha256(audit_seed.encode("utf-8")).hexdigest()[:12].upper()
        audit_id = f"AUDIT-{customer.customer_id}-{audit_hash}"

        rejected_list = [
            {
                "id": e.intervention_id,
                "title": e.intervention_title,
                "rejection_reasons": e.rejection_reasons,
                "safer_alternative": e.safer_alternative
            }
            for e in safety_evaluations if e.status == "REJECTED"
        ]

        total_rule_checks = sum(len(e.rules_checked) for e in safety_evaluations)

        audit_record = AuditRecord(
            audit_id=audit_id,
            timestamp=now_iso,
            customer_id=customer.customer_id,
            diagnosis_cause=diagnosis.primary_cause,
            ml_confidence=round(diagnosis.confidence, 4),
            severity=severity.severity,
            capacity_summary={
                "average_income": capacity.average_income,
                "living_cost_floor": capacity.living_cost_floor,
                "safe_emi": capacity.safe_emi,
                "emi_gap": capacity.emi_gap,
                "dti": capacity.dti,
                "liquid_buffer_months": capacity.liquid_buffer_months,
                "affordability_status": capacity.affordability_status
            },
            candidates_evaluated_count=len(candidates),
            safety_rules_evaluated_count=total_rule_checks,
            rejected_candidates=rejected_list,
            selected_intervention_id=selected_intervention.id,
            tier=tier,
            is_executable=is_executable,
            execution_barrier=execution_barrier
        )

        # 13. Empathetic Plain-English Explanation
        explanation = cls._generate_explanation(
            customer=customer,
            diagnosis=diagnosis,
            capacity=capacity,
            severity=severity,
            selected=selected_intervention
        )

        # 14. Assemble Actionable Next Steps
        next_steps = cls._generate_next_steps(
            tier=tier,
            selected=selected_intervention,
            capacity=capacity,
            customer_consent_required=customer_consent_required,
            human_approval_required=human_approval_required
        )

        risk_profile = RiskProfile(
            primary_cause=diagnosis.primary_cause,
            confidence=round(diagnosis.confidence, 4),
            severity=severity.severity,
            severity_reasons=severity.reasons,
            top_factors=diagnosis.top_shap_factors,
            probabilities=diagnosis.probabilities
        )

        return DecisionResponse(
            customer_id=customer.customer_id,
            timestamp=now_iso,
            risk=risk_profile,
            capacity=capacity,
            candidate_interventions=candidates,
            safety_evaluation=safety_evaluations,
            selected_intervention=selected_intervention,
            tier=tier,
            customer_consent_required=customer_consent_required,
            human_approval_required=human_approval_required,
            consent_gate=consent_gate,
            human_approval_gate=human_approval_gate,
            is_executable=is_executable,
            explanation=explanation,
            next_steps=next_steps,
            audit_record=audit_record
        )

    @staticmethod
    def _generate_explanation(
        customer: CustomerInput,
        diagnosis: DiagnosisResult,
        capacity: RepaymentCapacityResult,
        severity: SeverityResult,
        selected: InterventionCandidate
    ) -> str:
        name = customer.name if customer.name else "Customer"
        cause_names = {
            "EXPENSE_SHOCK": "an unexpected surge in essential living expenses (e.g. medical or emergency repairs)",
            "INCOME_SHOCK": "a significant sudden drop or interruption in monthly income",
            "DEBT_OVERLOAD": "high cumulative debt obligations consuming an unsustainable fraction of monthly income",
            "CASH_FLOW_MISMATCH": "a calendar timing gap between the salary credit date and the loan deduction date",
            "STRUCTURAL_DISTRESS": "a chronic structural shortfall between basic living costs and net income"
        }
        cause_desc = cause_names.get(diagnosis.primary_cause, diagnosis.primary_cause)

        explanation = (
            f"Diagnosis: {name} is experiencing {diagnosis.primary_cause.replace('_', ' ').title()} ({diagnosis.confidence:.1%} confidence), "
            f"primarily driven by {cause_desc}. "
            f"Financial Capacity: Sustainable monthly repayment capacity is ₹{capacity.safe_emi:,.0f}, leaving an EMI gap of ₹{capacity.emi_gap:,.0f} against current commitments of ₹{capacity.current_obligations:,.0f}. "
            f"Recommendation: FinShield proposes '{selected.title}' (Level {selected.level} on the 7-Level Ladder). "
            f"This provides an estimated ₹{selected.estimated_monthly_relief:,.0f}/month in immediate cash-flow relief while preserving the ₹{capacity.living_cost_floor:,.0f} essential living cost floor."
        )
        return explanation

    @staticmethod
    def _generate_next_steps(
        tier: str,
        selected: InterventionCandidate,
        capacity: RepaymentCapacityResult,
        customer_consent_required: bool,
        human_approval_required: bool
    ) -> List[str]:
        steps: List[str] = []
        if customer_consent_required:
            steps.append(f"Present clear, transparent digital consent disclosure for '{selected.title}' to customer.")
        if human_approval_required:
            steps.append(f"Route packaged intervention dossier to Bank Hardship Officer for binding approval ({tier}).")
        if tier == "TIER_A":
            steps.append("Upon customer one-click consent, automatically execute schedule adjustment via Core Banking API.")
        steps.append(f"Maintain protected ₹{capacity.living_cost_floor:,.0f} living floor and monitor post-intervention repayment velocity.")
        steps.append("Schedule 60-day automated financial recovery review.")
        return steps
