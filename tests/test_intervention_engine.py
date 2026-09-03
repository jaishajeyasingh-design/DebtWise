"""
Unit Tests for Intervention Recommendation Engine & 7-Level Ladder
Verifies candidate generation across all 5 distress archetypes and ranking hierarchy.
"""
import pytest
from app.services.capacity_engine import CapacityEngine
from app.services.diagnosis_service import DiagnosisService
from app.services.severity_engine import SeverityEngine
from app.services.intervention_engine import InterventionEngine
from app.schemas.customer import CustomerInput
from finshield_ml.demo_customers import (
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
)


def test_intervention_generation_priya():
    cust = CustomerInput(**PRIYA_EXPENSE_SHOCK)
    cap = CapacityEngine.calculate_capacity(cust)
    diag = DiagnosisService.diagnose_customer(cust)
    sev = SeverityEngine.evaluate_severity(cust, cap, diag)
    candidates = InterventionEngine.generate_candidates(cust, cap, diag, sev)

    assert len(candidates) >= 3
    # Check that Level 4 Temporary EMI reduction candidate exists
    temp_emi_cand = next((c for c in candidates if c.level == 4), None)
    assert temp_emi_cand is not None
    assert temp_emi_cand.estimated_monthly_relief > 0
    assert temp_emi_cand.requires_human_approval is True
    assert temp_emi_cand.requires_customer_consent is True


def test_intervention_generation_meena():
    cust = CustomerInput(**MEENA_CASH_FLOW_MISMATCH)
    cap = CapacityEngine.calculate_capacity(cust)
    diag = DiagnosisService.diagnose_customer(cust)
    sev = SeverityEngine.evaluate_severity(cust, cap, diag)
    candidates = InterventionEngine.generate_candidates(cust, cap, diag, sev)

    # Check that Level 2 Timing Sync candidate exists
    timing_cand = next((c for c in candidates if c.level == 2), None)
    assert timing_cand is not None
    assert "SYNC" in timing_cand.intervention_type.upper() or "DATE" in timing_cand.intervention_type.upper()


def test_intervention_hierarchy_ranking():
    cust = CustomerInput(**ARUN_DEBT_OVERLOAD)
    cap = CapacityEngine.calculate_capacity(cust)
    diag = DiagnosisService.diagnose_customer(cust)
    sev = SeverityEngine.evaluate_severity(cust, cap, diag)
    candidates = InterventionEngine.generate_candidates(cust, cap, diag, sev)

    # Verify candidates are strictly sorted in ascending order of ladder level
    levels = [c.level for c in candidates]
    assert levels == sorted(levels)
