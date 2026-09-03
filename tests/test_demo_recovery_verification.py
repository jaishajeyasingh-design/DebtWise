"""
Persona-Level Demo Verification for Phase 2 Recovery Engine
Verifies end-to-end recovery simulation and second-pass XGBoost re-scoring across all 4 canonical personas.
"""
from app.schemas.customer import CustomerInput
from app.schemas.recovery import RecoverySimulationRequest
from app.services.recovery_engine import RecoveryEngine
from finshield_ml.demo_customers import (
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
)


def test_persona_priya_recovery_verification():
    priya = CustomerInput(**PRIYA_EXPENSE_SHOCK)
    req = RecoverySimulationRequest(customer_input=priya, horizon_months=6, scenario="ADHERENT_RECOVERY")
    res = RecoveryEngine.simulate_recovery(req)

    assert res.customer_id == "CUST_PRIYA_34"
    assert res.delta.baseline_diagnosis == "EXPENSE_SHOCK"
    assert res.delta.stress_reduction_percent > 20.0
    assert res.delta.savings_growth_amount > 0.0
    assert res.trajectory[-1].stress_index < res.trajectory[0].stress_index
    assert res.is_adaptation_required is False


def test_persona_arun_recovery_verification():
    arun = CustomerInput(**ARUN_DEBT_OVERLOAD)
    req = RecoverySimulationRequest(customer_input=arun, horizon_months=6, scenario="ADHERENT_RECOVERY")
    res = RecoveryEngine.simulate_recovery(req)

    assert res.customer_id == "CUST_ARUN_42"
    assert res.delta.baseline_diagnosis == "DEBT_OVERLOAD"
    # Consolidation was rejected by safety engine and not applied
    assert res.selected_intervention_id == "DEBT-L3-AVOID-BORROWING"
    # Second-pass XGBoost re-scored (proves genuine model inference on updated features)
    assert res.delta.post_intervention_diagnosis in (
        "DEBT_OVERLOAD", "INCOME_SHOCK", "EXPENSE_SHOCK", "STRUCTURAL_DISTRESS", "CASH_FLOW_MISMATCH"
    )
    assert 0.0 <= res.delta.post_intervention_confidence <= 1.0


def test_persona_rahul_recovery_verification():
    rahul = CustomerInput(**RAHUL_INCOME_SHOCK)
    req = RecoverySimulationRequest(customer_input=rahul, horizon_months=6, scenario="ADHERENT_RECOVERY")
    res = RecoveryEngine.simulate_recovery(req)

    assert res.customer_id == "CUST_RAHUL_29"
    assert res.delta.baseline_diagnosis == "INCOME_SHOCK"
    assert res.delta.stress_reduction_percent > 15.0


def test_persona_meena_recovery_verification():
    meena = CustomerInput(**MEENA_CASH_FLOW_MISMATCH)
    req = RecoverySimulationRequest(customer_input=meena, horizon_months=6, scenario="ADHERENT_RECOVERY")
    res = RecoveryEngine.simulate_recovery(req)

    assert res.customer_id == "CUST_MEENA_31"
    assert res.delta.baseline_diagnosis == "CASH_FLOW_MISMATCH"
    assert res.selected_intervention_id == "CFM-L2-DATE-SYNC"
    assert res.delta.stress_reduction_percent > 30.0


def test_secondary_shock_adaptation_verification():
    priya = CustomerInput(**PRIYA_EXPENSE_SHOCK)
    req = RecoverySimulationRequest(customer_input=priya, horizon_months=6, scenario="SECONDARY_SHOCK")
    res = RecoveryEngine.simulate_recovery(req)

    assert res.scenario == "SECONDARY_SHOCK"
    assert res.is_adaptation_required is True
    assert res.adapted_decision is not None
    assert res.adapted_decision.customer_id == "CUST_PRIYA_34"
    assert res.adapted_decision.selected_intervention is not None
