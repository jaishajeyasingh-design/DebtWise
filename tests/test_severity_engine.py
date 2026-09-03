"""
Unit Tests for Deterministic Severity Classification Engine
Verifies explainable LOW, MODERATE, HIGH, CRITICAL scoring based on multi-factor indicators.
"""
import pytest
from app.services.capacity_engine import CapacityEngine
from app.services.diagnosis_service import DiagnosisService
from app.services.severity_engine import SeverityEngine
from app.schemas.customer import CustomerInput
from finshield_ml.demo_customers import (
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
)


def test_severity_priya_high():
    cust = CustomerInput(**PRIYA_EXPENSE_SHOCK)
    cap = CapacityEngine.calculate_capacity(cust)
    diag = DiagnosisService.diagnose_customer(cust)
    sev = SeverityEngine.evaluate_severity(cust, cap, diag)

    assert sev.severity in ("HIGH", "CRITICAL")
    assert len(sev.reasons) > 0
    assert any("EMI gap" in r or "deficit" in r or "savings" in r for r in sev.reasons)


def test_severity_arun_critical():
    cust = CustomerInput(**ARUN_DEBT_OVERLOAD)
    cap = CapacityEngine.calculate_capacity(cust)
    diag = DiagnosisService.diagnose_customer(cust)
    sev = SeverityEngine.evaluate_severity(cust, cap, diag)

    assert sev.severity in ("HIGH", "CRITICAL")
    assert any("DTI" in r for r in sev.reasons)


def test_severity_healthy_customer_low():
    healthy = CustomerInput(
        customer_id="HEALTHY_02",
        income=[90000.0, 90000.0, 90000.0, 90000.0],
        essential_expenses=[25000.0, 25000.0, 25000.0, 25000.0],
        obligations=[10000.0, 10000.0, 10000.0, 10000.0],
        savings=[200000.0, 200000.0, 200000.0, 200000.0],
        payment_delays=[0, 0, 0, 0],
        overdraft_count=[0, 0, 0, 0]
    )
    cap = CapacityEngine.calculate_capacity(healthy)
    diag = DiagnosisService.diagnose_customer(healthy)
    sev = SeverityEngine.evaluate_severity(healthy, cap, diag)

    assert sev.severity in ("LOW", "MODERATE")
    assert sev.indicators["score"] <= 2
