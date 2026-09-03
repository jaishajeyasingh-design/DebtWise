"""
Unit Tests for Deterministic Repayment Capacity Engine
Verifies mathematical correctness, policy constant enforcement, and edge cases.
"""
import pytest
from app.services.capacity_engine import CapacityEngine
from app.schemas.customer import CustomerInput
from app.rules.policy_config import (
    MIN_LIVING_COST_FLOOR_RATIO,
    TARGET_EMERGENCY_BUFFER_MONTHS,
    MAX_SAFE_DTI_RATIO,
    SAFE_DISPOSABLE_CAPACITY_FACTOR
)
from finshield_ml.demo_customers import (
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
)


def test_capacity_healthy_customer():
    healthy = {
        "customer_id": "HEALTHY_01",
        "income": [80000.0, 80000.0, 80000.0],
        "essential_expenses": [25000.0, 25000.0, 25000.0],
        "discretionary_expenses": [10000.0, 10000.0, 10000.0],
        "obligations": [15000.0, 15000.0, 15000.0],
        "savings": [150000.0, 150000.0, 150000.0]
    }
    res = CapacityEngine.calculate_capacity(healthy)
    
    assert res.average_income == 80000.0
    # Living floor = max(25000, 80000 * 0.40 = 32000) -> 32000.0
    assert res.living_cost_floor == 32000.0
    # Safe disposable = 80000 - 32000 = 48000.0
    assert res.safe_disposable_income == 48000.0
    # Safe EMI = min(48000 * 0.85 = 40800, 80000 * 0.50 = 40000) -> 40000.0
    assert res.safe_emi == 40000.0
    assert res.emi_gap <= 0.0
    assert res.affordability_status == "SURPLUS"
    assert res.liquid_buffer_months > 1.0


def test_capacity_priya_expense_shock():
    res = CapacityEngine.calculate_capacity(PRIYA_EXPENSE_SHOCK)
    assert res.average_income == 60000.0
    assert res.current_obligations == 25000.0
    assert res.emi_gap > 0.0  # Has EMI shortfall during medical crisis
    assert res.affordability_status in ("DEFICIT", "CRITICAL_DEFICIT")
    assert res.liquid_buffer_months < 0.50  # Drained savings


def test_capacity_arun_debt_overload():
    res = CapacityEngine.calculate_capacity(ARUN_DEBT_OVERLOAD)
    assert res.average_income == 50000.0
    assert res.dti >= 0.65  # Heavy DTI debt burden
    assert res.affordability_status == "CRITICAL_DEFICIT"


def test_capacity_zero_income_edge_case():
    zero_inc = {
        "customer_id": "ZERO_INC_01",
        "income": [0.0, 0.0, 0.0],
        "essential_expenses": [20000.0, 20000.0, 20000.0],
        "obligations": [10000.0, 10000.0, 10000.0],
        "savings": [5000.0, 5000.0, 5000.0]
    }
    res = CapacityEngine.calculate_capacity(zero_inc)
    assert res.average_income == 0.0
    assert res.safe_emi == 0.0
    assert res.affordability_status == "CRITICAL_DEFICIT"
    assert len(res.warnings) > 0


def test_capacity_high_essential_expenses_floor():
    # Test case where essential expenses exceed 40% floor
    high_exp = {
        "customer_id": "HIGH_EXP_01",
        "income": [50000.0, 50000.0, 50000.0],
        "essential_expenses": [35000.0, 35000.0, 35000.0],  # 70% of income
        "obligations": [15000.0, 15000.0, 15000.0],
        "savings": [10000.0, 10000.0, 10000.0]
    }
    res = CapacityEngine.calculate_capacity(high_exp)
    assert res.living_cost_floor == 35000.0
    assert res.safe_disposable_income == 15000.0
    # Safe EMI = min(15000 * 0.85 = 12750, 25000) -> 12750.0
    assert res.safe_emi == 12750.0
    assert res.emi_gap == 2250.0
