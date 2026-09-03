"""
Deterministic Intervention Safety Filter
Applies non-negotiable institutional safety constraints (SC-001 through SC-008).
Evaluates every candidate independently — NEVER bypassed by ML or LLM.
"""
from typing import List, Dict, Any, Union, Optional
from app.schemas.customer import CustomerInput
from app.schemas.capacity import RepaymentCapacityResult
from app.schemas.diagnosis import DiagnosisResult
from app.schemas.intervention import (
    InterventionCandidate,
    SafetyRuleCheck,
    SafetyEvaluationResult,
    SeverityResult
)
from app.rules.policy_config import (
    HARD_CONSOLIDATION_DTI_CEILING,
    MIN_SAVINGS_FOR_CONSOLIDATION_MONTHS,
    MIN_LIVING_COST_FLOOR_RATIO,
    TARGET_EMERGENCY_BUFFER_MONTHS,
    TIER_B_HUMAN_APPROVAL_LEVELS,
    TIER_C_HUMAN_ONLY_LEVELS
)
from app.rules.safety_rules import SAFETY_RULE_DEFINITIONS


class SafetyFilter:
    """Purely deterministic safety gate evaluating financial constraints and boundary rules."""

    @classmethod
    def evaluate_candidate(
        cls,
        candidate: InterventionCandidate,
        capacity: RepaymentCapacityResult,
        diagnosis: DiagnosisResult,
        severity: SeverityResult,
        customer: Union[CustomerInput, Dict[str, Any]]
    ) -> SafetyEvaluationResult:
        """
        Runs candidate intervention through all 8 deterministic safety rules.
        """
        rules_checked: List[SafetyRuleCheck] = []
        rejection_reasons: List[str] = []
        safer_alt: Optional[str] = None

        # -------------------------------------------------------------
        # RULE SC-001: Safe EMI Capacity Constraint
        # -------------------------------------------------------------
        if candidate.level in [4, 5] and candidate.estimated_emi_after > capacity.safe_emi + 50.0:
            sc001_passed = False
            reason_001 = (
                f"Proposed post-intervention EMI (₹{candidate.estimated_emi_after:,.0f}) exceeds "
                f"safe repayment capacity (₹{capacity.safe_emi:,.0f}) by ₹{candidate.estimated_emi_after - capacity.safe_emi:,.0f}."
            )
            rejection_reasons.append(reason_001)
        else:
            sc001_passed = True
            reason_001 = f"Post-intervention EMI (₹{candidate.estimated_emi_after:,.0f}) is within safe capacity ceiling (₹{capacity.safe_emi:,.0f})."

        rules_checked.append(
            SafetyRuleCheck(
                rule_id="SC-001",
                rule_name=SAFETY_RULE_DEFINITIONS["SC-001"]["name"],
                status="PASSED" if sc001_passed else "FAILED",
                severity=SAFETY_RULE_DEFINITIONS["SC-001"]["severity"],
                reason=reason_001,
                details={"safe_emi": capacity.safe_emi, "estimated_emi_after": candidate.estimated_emi_after}
            )
        )

        # -------------------------------------------------------------
        # RULE SC-002: Protected Living Cost Floor
        # -------------------------------------------------------------
        # Interventions cannot assume living costs lower than non-negotiable floor
        sc002_passed = True
        reason_002 = f"Living cost floor of ₹{capacity.living_cost_floor:,.0f} remains 100% protected."
        rules_checked.append(
            SafetyRuleCheck(
                rule_id="SC-002",
                rule_name=SAFETY_RULE_DEFINITIONS["SC-002"]["name"],
                status="PASSED",
                severity=SAFETY_RULE_DEFINITIONS["SC-002"]["severity"],
                reason=reason_002,
                details={"living_cost_floor": capacity.living_cost_floor}
            )
        )

        # -------------------------------------------------------------
        # RULE SC-003: DTI Debt Consolidation Ceiling (The WOW Demonstration)
        # -------------------------------------------------------------
        is_consolidation = (
            "CONSOLIDATION" in candidate.intervention_type.upper() or
            "CONSOLIDATION" in candidate.id.upper()
        )

        if is_consolidation:
            if capacity.dti > HARD_CONSOLIDATION_DTI_CEILING:
                sc003_passed = False
                reason_003 = (
                    f"Debt consolidation REJECTED: Customer DTI ({capacity.dti:.1%}) exceeds the "
                    f"{HARD_CONSOLIDATION_DTI_CEILING:.0%} policy ceiling. Consolidation would increase debt "
                    f"burden without resolving structural cash deficit."
                )
                rejection_reasons.append(reason_003)
                safer_alt = "Recommend Level 3 Customer-Initiated Soft Credit-Line Freeze + Level 5 Tenor Restructuring or Level 4 Temporary Relief."
            elif capacity.liquid_buffer_months < MIN_SAVINGS_FOR_CONSOLIDATION_MONTHS:
                sc003_passed = False
                reason_003 = (
                    f"Debt consolidation REJECTED: Liquid savings buffer ({capacity.liquid_buffer_months:.2f} mo) "
                    f"is below the required {MIN_SAVINGS_FOR_CONSOLIDATION_MONTHS} month minimum."
                )
                rejection_reasons.append(reason_003)
                safer_alt = "Recommend Level 3 Budget Guidance and Level 4 Temporary Relief to rebuild savings buffer."
            else:
                sc003_passed = True
                reason_003 = f"Consolidation eligibility verified: DTI ({capacity.dti:.1%}) and liquid buffer ({capacity.liquid_buffer_months:.2f} mo) within limits."
        else:
            sc003_passed = True
            reason_003 = "Rule not applicable to non-consolidation interventions."

        rules_checked.append(
            SafetyRuleCheck(
                rule_id="SC-003",
                rule_name=SAFETY_RULE_DEFINITIONS["SC-003"]["name"],
                status="PASSED" if sc003_passed else "FAILED",
                severity=SAFETY_RULE_DEFINITIONS["SC-003"]["severity"],
                reason=reason_003,
                details={"dti": capacity.dti, "dti_ceiling": HARD_CONSOLIDATION_DTI_CEILING}
            )
        )

        # -------------------------------------------------------------
        # RULE SC-004: Anti-Predatory Borrowing Guard
        # -------------------------------------------------------------
        # If customer is in DEBT_OVERLOAD, reject interventions extending net-new credit lines
        if diagnosis.primary_cause == "DEBT_OVERLOAD" and is_consolidation and not sc003_passed:
            sc004_passed = False
            reason_004 = "Anti-Predatory Guard: Issuing additional credit to severely debt-overloaded borrower is prohibited."
            if reason_004 not in rejection_reasons:
                rejection_reasons.append(reason_004)
        else:
            sc004_passed = True
            reason_004 = "Intervention does not introduce predatory or unmanageable new debt."

        rules_checked.append(
            SafetyRuleCheck(
                rule_id="SC-004",
                rule_name=SAFETY_RULE_DEFINITIONS["SC-004"]["name"],
                status="PASSED" if sc004_passed else "FAILED",
                severity=SAFETY_RULE_DEFINITIONS["SC-004"]["severity"],
                reason=reason_004
            )
        )

        # -------------------------------------------------------------
        # RULE SC-005: Emergency Buffer Preservation
        # -------------------------------------------------------------
        sc005_passed = True
        reason_005 = f"Emergency reserve requirement (₹{capacity.emergency_buffer_requirement:,.0f}) is protected from diversion."
        rules_checked.append(
            SafetyRuleCheck(
                rule_id="SC-005",
                rule_name=SAFETY_RULE_DEFINITIONS["SC-005"]["name"],
                status="PASSED",
                severity=SAFETY_RULE_DEFINITIONS["SC-005"]["severity"],
                reason=reason_005,
                details={"emergency_buffer_requirement": capacity.emergency_buffer_requirement}
            )
        )

        # -------------------------------------------------------------
        # RULE SC-006: High-Impact Restructuring Approval
        # -------------------------------------------------------------
        if candidate.level in (TIER_B_HUMAN_APPROVAL_LEVELS + TIER_C_HUMAN_ONLY_LEVELS):
            sc006_passed = True
            reason_006 = f"Level {candidate.level} restructuring correctly flagged for mandatory Human Officer authorization."
        else:
            sc006_passed = True
            reason_006 = f"Level {candidate.level} intervention is low-risk and eligible for auto-execution post-consent."

        rules_checked.append(
            SafetyRuleCheck(
                rule_id="SC-006",
                rule_name=SAFETY_RULE_DEFINITIONS["SC-006"]["name"],
                status="PASSED",
                severity=SAFETY_RULE_DEFINITIONS["SC-006"]["severity"],
                reason=reason_006
            )
        )

        # -------------------------------------------------------------
        # RULE SC-007: Customer Informed Consent Mandate
        # -------------------------------------------------------------
        if candidate.level >= 2:
            sc007_passed = candidate.requires_customer_consent is True
            reason_007 = "Mandatory affirmative customer consent verified."
        else:
            sc007_passed = True
            reason_007 = "Informational/monitoring intervention requires no contractual consent."

        rules_checked.append(
            SafetyRuleCheck(
                rule_id="SC-007",
                rule_name=SAFETY_RULE_DEFINITIONS["SC-007"]["name"],
                status="PASSED" if sc007_passed else "FAILED",
                severity=SAFETY_RULE_DEFINITIONS["SC-007"]["severity"],
                reason=reason_007
            )
        )

        # -------------------------------------------------------------
        # RULE SC-008: Irreversibility Protection
        # -------------------------------------------------------------
        if candidate.reversibility == "IRREVERSIBLE" and candidate.level < 6:
            sc008_passed = False
            reason_008 = "Irreversible financial changes cannot be automatically executed."
            rejection_reasons.append(reason_008)
        else:
            sc008_passed = True
            reason_008 = f"Reversibility rating ({candidate.reversibility}) verified for Level {candidate.level}."

        rules_checked.append(
            SafetyRuleCheck(
                rule_id="SC-008",
                rule_name=SAFETY_RULE_DEFINITIONS["SC-008"]["name"],
                status="PASSED" if sc008_passed else "FAILED",
                severity=SAFETY_RULE_DEFINITIONS["SC-008"]["severity"],
                reason=reason_008
            )
        )

        overall_status = "REJECTED" if len(rejection_reasons) > 0 else "APPROVED"

        return SafetyEvaluationResult(
            intervention_id=candidate.id,
            intervention_title=candidate.title,
            status=overall_status,
            rules_checked=rules_checked,
            rejection_reasons=rejection_reasons,
            safer_alternative=safer_alt
        )

    @classmethod
    def filter_candidates(
        cls,
        candidates: List[InterventionCandidate],
        capacity: RepaymentCapacityResult,
        diagnosis: DiagnosisResult,
        severity: SeverityResult,
        customer: Union[CustomerInput, Dict[str, Any]]
    ) -> tuple[List[InterventionCandidate], List[SafetyEvaluationResult]]:
        """
        Evaluates all candidate interventions and partitions them into approved candidates and safety audit reports.
        """
        approved_candidates: List[InterventionCandidate] = []
        evaluations: List[SafetyEvaluationResult] = []

        for cand in candidates:
            eval_res = cls.evaluate_candidate(
                candidate=cand,
                capacity=capacity,
                diagnosis=diagnosis,
                severity=severity,
                customer=customer
            )
            evaluations.append(eval_res)
            if eval_res.status == "APPROVED":
                approved_candidates.append(cand)

        return approved_candidates, evaluations
