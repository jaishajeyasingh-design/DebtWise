"""
Unit Tests for End-to-End Decision Pipeline Engine
Verifies complete flow across canonical demo customer personas: Priya, Arun, Rahul, Meena.
Tests explicit consent gates, human approval gates, execution state, and structured audit logs.
"""
import pytest
from app.services.decision_engine import DecisionEngine
from app.schemas.customer import CustomerInput
from finshield_ml.demo_customers import (
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
)


def test_decision_priya_expense_shock_flow():
    cust = CustomerInput(**PRIYA_EXPENSE_SHOCK)
    decision = DecisionEngine.analyze_customer(cust)

    assert decision.customer_id == "CUST_PRIYA_34"
    assert decision.risk.primary_cause == "EXPENSE_SHOCK"
    assert decision.risk.confidence >= 0.70
    assert decision.capacity.affordability_status in ("DEFICIT", "CRITICAL_DEFICIT")
    assert decision.selected_intervention is not None
    assert decision.selected_intervention.level in (3, 4, 5)
    assert decision.tier in ("TIER_B", "TIER_C")
    assert decision.customer_consent_required is True
    assert decision.human_approval_required is True

    # Consent Gate Verification
    assert decision.consent_gate.consent_required is True
    assert decision.consent_gate.consent_status == "PENDING_CUSTOMER_CONSENT"
    assert "3-Month" in decision.consent_gate.terms_summary or "Priya" in decision.explanation

    # Human Approval Gate Verification
    assert decision.human_approval_gate.approval_required is True
    assert decision.human_approval_gate.approval_status == "PENDING_OFFICER_REVIEW"
    assert len(decision.human_approval_gate.action_items) > 0

    # Execution State (Cannot auto-execute pending approvals)
    assert decision.is_executable is False
    assert "consent" in decision.audit_record.execution_barrier.lower()

    # Audit Trail Verification
    assert decision.audit_record.audit_id.startswith("AUDIT-CUST_PRIYA_34-")
    assert decision.audit_record.diagnosis_cause == "EXPENSE_SHOCK"
    assert decision.audit_record.candidates_evaluated_count > 0
    assert decision.audit_record.safety_rules_evaluated_count > 0


def test_decision_meena_cash_flow_mismatch_flow():
    cust = CustomerInput(**MEENA_CASH_FLOW_MISMATCH)
    decision = DecisionEngine.analyze_customer(cust)

    assert decision.risk.primary_cause == "CASH_FLOW_MISMATCH"
    assert decision.selected_intervention is not None
    # Meena has an affordable 27% DTI, so the optimal fix is Level 2 Timing Sync
    assert decision.selected_intervention.level == 2
    assert decision.tier == "TIER_A"
    assert "SYNC" in decision.selected_intervention.intervention_type.upper() or "DATE" in decision.selected_intervention.intervention_type.upper()

    # Tier A Requires Customer Consent but zero human approval
    assert decision.customer_consent_required is True
    assert decision.human_approval_required is False
    assert decision.consent_gate.consent_required is True
    assert decision.human_approval_gate.approval_required is False
    assert decision.audit_record.tier == "TIER_A"


def test_decision_arun_debt_overload_flow():
    cust = CustomerInput(**ARUN_DEBT_OVERLOAD)
    decision = DecisionEngine.analyze_customer(cust)

    assert decision.risk.primary_cause == "DEBT_OVERLOAD"
    assert decision.capacity.dti > 0.65
    assert decision.selected_intervention is not None
    
    # Verify safety filter evaluated all candidates and rejected consolidation
    assert len(decision.safety_evaluation) > 0
    consolidation_eval = next(
        (e for e in decision.safety_evaluation if "CONSOLIDATION" in e.intervention_id.upper()),
        None
    )
    if consolidation_eval:
        assert consolidation_eval.status == "REJECTED"
        assert len(decision.audit_record.rejected_candidates) > 0


def test_decision_rahul_income_shock_flow():
    cust = CustomerInput(**RAHUL_INCOME_SHOCK)
    decision = DecisionEngine.analyze_customer(cust)

    assert decision.risk.primary_cause == "INCOME_SHOCK"
    assert decision.selected_intervention is not None
    assert decision.selected_intervention.level in (4, 5, 6)
    assert decision.customer_consent_required is True
    assert decision.audit_record.diagnosis_cause == "INCOME_SHOCK"


def test_audit_record_structure_and_serialization():
    cust = CustomerInput(**PRIYA_EXPENSE_SHOCK)
    decision = DecisionEngine.analyze_customer(cust)
    audit = decision.audit_record

    # Verify JSON serializability of audit record
    audit_dict = audit.model_dump()
    assert "audit_id" in audit_dict
    assert "capacity_summary" in audit_dict
    assert "living_cost_floor" in audit_dict["capacity_summary"]
    assert isinstance(audit_dict["rejected_candidates"], list)
    assert audit_dict["candidates_evaluated_count"] == len(decision.candidate_interventions)
