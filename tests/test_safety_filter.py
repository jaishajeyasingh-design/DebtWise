"""
Unit Tests for Deterministic Safety Filter & Hard Institutional Rules
Includes the Hackathon WOW Demo: Self-Rejecting Safety Filter on Unsafe Debt Consolidation (Rule SC-003).
"""
import pytest
from app.services.capacity_engine import CapacityEngine
from app.services.diagnosis_service import DiagnosisService
from app.services.severity_engine import SeverityEngine
from app.services.safety_filter import SafetyFilter
from app.schemas.customer import CustomerInput
from app.schemas.intervention import InterventionCandidate
from finshield_ml.demo_customers import ARUN_DEBT_OVERLOAD, PRIYA_EXPENSE_SHOCK


def test_wow_demo_self_rejecting_safety_filter_on_high_dti_consolidation():
    """
    HACKATHON WOW MOMENT TEST:
    Arun (DTI = 71% > 65% ceiling) has a proposed Debt Consolidation loan.
    The FinShield Safety Filter MUST deterministically REJECT it under Rule SC-003.
    """
    cust = CustomerInput(**ARUN_DEBT_OVERLOAD)
    cap = CapacityEngine.calculate_capacity(cust)
    diag = DiagnosisService.diagnose_customer(cust)
    sev = SeverityEngine.evaluate_severity(cust, cap, diag)

    assert cap.dti > 0.65, f"Expected Arun DTI > 65%, got {cap.dti}"

    # Construct the proposed Debt Consolidation candidate
    consolidation_candidate = InterventionCandidate(
        id="DEBT-L5-CONSOLIDATION",
        level=5,
        name="Low-Interest Debt Consolidation Facility",
        intervention_type="DEBT_CONSOLIDATION_FACILITY",
        title="Consolidation Term Loan",
        description="Consolidate multiple cards into a single installment loan.",
        reason="Reduces blended interest rate.",
        estimated_monthly_relief=3500.0,
        estimated_emi_after=32000.0,
        reversibility="LOW",
        intrusiveness="SIGNIFICANT",
        friction="MEDIUM",
        requires_human_approval=True,
        requires_customer_consent=True,
        priority=50
    )

    safety_result = SafetyFilter.evaluate_candidate(
        candidate=consolidation_candidate,
        capacity=cap,
        diagnosis=diag,
        severity=sev,
        customer=cust
    )

    # 1. Must be REJECTED
    assert safety_result.status == "REJECTED"
    assert len(safety_result.rejection_reasons) > 0

    # 2. Rule SC-003 must be explicitly marked FAILED
    sc003_check = next((r for r in safety_result.rules_checked if r.rule_id == "SC-003"), None)
    assert sc003_check is not None
    assert sc003_check.status == "FAILED"
    assert "exceeds" in sc003_check.reason.lower() and "65" in sc003_check.reason

    # 3. Must provide a safer alternative
    assert safety_result.safer_alternative is not None


def test_safety_filter_rejects_unaffordable_emi_sc001():
    """Rule SC-001: Rejects proposals where post-intervention EMI exceeds safe repayment capacity."""
    cust = CustomerInput(**PRIYA_EXPENSE_SHOCK)
    cap = CapacityEngine.calculate_capacity(cust)
    diag = DiagnosisService.diagnose_customer(cust)
    sev = SeverityEngine.evaluate_severity(cust, cap, diag)

    # Candidate with an unaffordable EMI of ₹45,000 (way above Priya's ₹17,000 safe capacity)
    unaffordable_cand = InterventionCandidate(
        id="BAD-L4-PLAN",
        level=4,
        name="Aggressive Catch-Up Plan",
        intervention_type="AGGRESSIVE_INSTALLMENT",
        title="High Payment Plan",
        description="Accelerated debt payment plan.",
        reason="Pay off debt rapidly.",
        estimated_monthly_relief=0.0,
        estimated_emi_after=45000.0,
        reversibility="MEDIUM",
        intrusiveness="MODERATE",
        friction="LOW",
        requires_human_approval=True,
        requires_customer_consent=True,
        priority=40
    )

    safety_result = SafetyFilter.evaluate_candidate(
        candidate=unaffordable_cand,
        capacity=cap,
        diagnosis=diag,
        severity=sev,
        customer=cust
    )

    assert safety_result.status == "REJECTED"
    sc001_check = next((r for r in safety_result.rules_checked if r.rule_id == "SC-001"), None)
    assert sc001_check is not None
    assert sc001_check.status == "FAILED"


def test_safety_filter_approves_safe_temporary_relief():
    """Safe, reversible temporary relief tailored to sustainable capacity must be APPROVED."""
    cust = CustomerInput(**PRIYA_EXPENSE_SHOCK)
    cap = CapacityEngine.calculate_capacity(cust)
    diag = DiagnosisService.diagnose_customer(cust)
    sev = SeverityEngine.evaluate_severity(cust, cap, diag)

    safe_cand = InterventionCandidate(
        id="EXP-L4-TEMP-EMI-REDUCTION",
        level=4,
        name="3-Month Temporary EMI Relief",
        intervention_type="TEMPORARY_EMI_REDUCTION_3MO",
        title="3-Month Temporary EMI Relief to Sustainable Floor",
        description="Temporarily reduce EMI to safe capacity floor.",
        reason="Relief during medical emergency.",
        estimated_monthly_relief=cap.emi_gap,
        estimated_emi_after=cap.safe_emi,
        reversibility="MEDIUM",
        intrusiveness="MODERATE",
        friction="LOW",
        requires_human_approval=True,
        requires_customer_consent=True,
        priority=40
    )

    safety_result = SafetyFilter.evaluate_candidate(
        candidate=safe_cand,
        capacity=cap,
        diagnosis=diag,
        severity=sev,
        customer=cust
    )

    assert safety_result.status == "APPROVED"
    assert len(safety_result.rejection_reasons) == 0
