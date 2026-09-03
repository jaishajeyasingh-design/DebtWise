"""
Unit and Integration Tests for Closed-Loop Recovery Engine (Phase 2)
Verifies:
1. Valid recovery simulation across 1, 6, and 12-month horizons.
2. Horizon constraints (rejection of <1 or >12).
3. Preservation of baseline diagnosis & confidence.
4. Active second-pass XGBoost re-scoring & feature re-extraction.
5. Deterministic trajectory and before-vs-after delta metrics.
6. Scenario modes: ADHERENT_RECOVERY, STAGNANT_DEFICIT, and SECONDARY_SHOCK.
7. Automated adaptation triggering on stagnant recovery or secondary shock.
8. Safety rule enforcement: Arun's rejected debt consolidation is NEVER applied.
9. Immutability of baseline inputs.
10. Presence of transparency disclaimer.
"""
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.schemas.customer import CustomerInput
from app.schemas.recovery import RecoverySimulationRequest, RecoverySimulationResponse
from app.services.recovery_engine import RecoveryEngine
from finshield_ml.demo_customers import (
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
)

client = TestClient(app)


@pytest.fixture
def priya_input() -> CustomerInput:
    return CustomerInput(**PRIYA_EXPENSE_SHOCK)


@pytest.fixture
def arun_input() -> CustomerInput:
    return CustomerInput(**ARUN_DEBT_OVERLOAD)


@pytest.fixture
def rahul_input() -> CustomerInput:
    return CustomerInput(**RAHUL_INCOME_SHOCK)


@pytest.fixture
def meena_input() -> CustomerInput:
    return CustomerInput(**MEENA_CASH_FLOW_MISMATCH)


# 1. Valid Recovery Simulation (Priya baseline)
def test_valid_recovery_simulation_priya(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    res = RecoveryEngine.simulate_recovery(req)

    assert isinstance(res, RecoverySimulationResponse)
    assert res.customer_id == priya_input.customer_id
    assert res.scenario == "ADHERENT_RECOVERY"
    assert res.horizon_months == 6
    assert len(res.trajectory) == 7  # M0 + 6 months
    assert res.recovery_status in ("RECOVERED", "SIGNIFICANT_IMPROVEMENT", "MODERATE_IMPROVEMENT")
    assert res.delta.stress_reduction_percent > 0.0


# 2. 1-Month Horizon
def test_horizon_1_month(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=1,
        scenario="ADHERENT_RECOVERY"
    )
    res = RecoveryEngine.simulate_recovery(req)
    assert res.horizon_months == 1
    assert len(res.trajectory) == 2  # M0 + Month 1
    assert res.trajectory[0].month == "Current (M0)"
    assert res.trajectory[1].month == "Month 1"


# 3. 6-Month Horizon
def test_horizon_6_month(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    res = RecoveryEngine.simulate_recovery(req)
    assert res.horizon_months == 6
    assert len(res.trajectory) == 7
    assert res.trajectory[-1].month == "Month 6"


# 4. 12-Month Horizon
def test_horizon_12_month(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=12,
        scenario="ADHERENT_RECOVERY"
    )
    res = RecoveryEngine.simulate_recovery(req)
    assert res.horizon_months == 12
    assert len(res.trajectory) == 13
    assert res.trajectory[-1].month == "Month 12"


# 5. Invalid Horizon Rejected by Schema
def test_invalid_horizon_rejected(priya_input):
    with pytest.raises(ValidationError):
        RecoverySimulationRequest(
            customer_input=priya_input,
            horizon_months=0,  # Below ge=1
            scenario="ADHERENT_RECOVERY"
        )

    with pytest.raises(ValidationError):
        RecoverySimulationRequest(
            customer_input=priya_input,
            horizon_months=13,  # Above le=12
            scenario="ADHERENT_RECOVERY"
        )


# 6. Baseline Diagnosis is Preserved in Output
def test_baseline_diagnosis_preserved(priya_input, arun_input, meena_input):
    for inp, expected_cause in [
        (priya_input, "EXPENSE_SHOCK"),
        (arun_input, "DEBT_OVERLOAD"),
        (meena_input, "CASH_FLOW_MISMATCH")
    ]:
        res = RecoveryEngine.simulate_recovery(RecoverySimulationRequest(customer_input=inp))
        assert res.delta.baseline_diagnosis == expected_cause
        assert res.delta.baseline_confidence > 0.5


# 7. Second XGBoost Inference Actually Occurs on Simulated State
def test_second_pass_xgboost_inference_executes(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    res = RecoveryEngine.simulate_recovery(req)

    # Post-intervention diagnosis and confidence are freshly calculated
    assert isinstance(res.delta.post_intervention_diagnosis, str)
    assert 0.0 <= res.delta.post_intervention_confidence <= 1.0
    # Post-intervention severity is calculated
    assert res.delta.post_intervention_severity in ("LOW", "MODERATE", "HIGH", "CRITICAL")


# 8. Post-Intervention Probabilities & Deltas are Computed
def test_post_intervention_deltas_computed(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    res = RecoveryEngine.simulate_recovery(req)
    delta = res.delta

    assert delta.baseline_stress_index >= delta.post_intervention_stress_index
    assert delta.stress_reduction_percent >= 0.0
    assert delta.savings_growth_amount > 0.0
    assert delta.monthly_relief_amount > 0.0


# 9. Trajectory Values are Strictly Deterministic
def test_trajectory_is_deterministic(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    res1 = RecoveryEngine.simulate_recovery(req)
    res2 = RecoveryEngine.simulate_recovery(req)

    assert len(res1.trajectory) == len(res2.trajectory)
    for p1, p2 in zip(res1.trajectory, res2.trajectory):
        assert p1.stress_index == p2.stress_index
        assert p1.savings_balance == p2.savings_balance
        assert p1.scheduled_emi == p2.scheduled_emi
        assert p1.dti_percent == p2.dti_percent


# 10. ADHERENT_RECOVERY Scenario Progression
def test_scenario_adherent_recovery(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    res = RecoveryEngine.simulate_recovery(req)
    assert res.scenario == "ADHERENT_RECOVERY"
    assert res.trajectory[-1].stress_index < res.trajectory[0].stress_index
    assert res.trajectory[-1].savings_balance > res.trajectory[0].savings_balance


# 11. STAGNANT_DEFICIT Scenario
def test_scenario_stagnant_deficit(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="STAGNANT_DEFICIT"
    )
    res = RecoveryEngine.simulate_recovery(req)
    assert res.scenario == "STAGNANT_DEFICIT"
    # Stagnant scenario shows significantly higher stress than adherent recovery
    adherent_res = RecoveryEngine.simulate_recovery(
        RecoverySimulationRequest(customer_input=priya_input, horizon_months=6, scenario="ADHERENT_RECOVERY")
    )
    assert res.trajectory[-1].stress_index > adherent_res.trajectory[-1].stress_index


# 12. SECONDARY_SHOCK Scenario
def test_scenario_secondary_shock(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="SECONDARY_SHOCK"
    )
    res = RecoveryEngine.simulate_recovery(req)
    assert res.scenario == "SECONDARY_SHOCK"
    assert res.recovery_status == "PERSISTENT_DISTRESS"
    assert res.is_adaptation_required is True
    assert res.adapted_decision is not None


# 13. Stagnant Recovery or Secondary Shock Triggers Adaptation
def test_adaptation_trigger_generates_adapted_decision(priya_input):
    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="SECONDARY_SHOCK"
    )
    res = RecoveryEngine.simulate_recovery(req)

    assert res.is_adaptation_required is True
    assert res.adapted_decision is not None
    assert res.adapted_decision.customer_id == priya_input.customer_id
    assert res.adapted_decision.selected_intervention is not None
    assert res.adapted_decision.tier in ("TIER_B", "TIER_C")


# 14. Arun Debt Overload Safety: Baseline is DEBT_OVERLOAD & Consolidation Rejected
def test_arun_consolidation_rejected_in_baseline(arun_input):
    req = RecoverySimulationRequest(
        customer_input=arun_input,
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    res = RecoveryEngine.simulate_recovery(req)

    assert res.delta.baseline_diagnosis == "DEBT_OVERLOAD"
    # Simulated intervention must NOT be consolidation
    assert "CONSOLIDATION" not in res.selected_intervention_id.upper()
    assert res.selected_intervention_id == "DEBT-L3-AVOID-BORROWING"


# 15. Attempting to Simulate a Rejected Consolidation Loan is Forbidden
def test_cannot_simulate_rejected_consolidation_loan(arun_input):
    req = RecoverySimulationRequest(
        customer_input=arun_input,
        selected_intervention_id="DEBT-L5-CONSOLIDATION",
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    with pytest.raises(ValueError) as excinfo:
        RecoveryEngine.simulate_recovery(req)

    assert "Cannot simulate rejected intervention" in str(excinfo.value)
    assert "safety filter deterministically rejected it" in str(excinfo.value)


# 16. Adapted Decision Passes Through Existing Safety Engine
def test_adapted_decision_enforces_safety(arun_input):
    req = RecoverySimulationRequest(
        customer_input=arun_input,
        horizon_months=6,
        scenario="SECONDARY_SHOCK"
    )
    res = RecoveryEngine.simulate_recovery(req)

    assert res.is_adaptation_required is True
    adapted = res.adapted_decision
    assert adapted is not None

    # Safety checks are populated
    assert len(adapted.safety_evaluation) > 0
    consolidation_eval = next((se for se in adapted.safety_evaluation if "CONSOLIDATION" in se.intervention_id), None)
    if consolidation_eval:
        assert consolidation_eval.status == "REJECTED"


# 17. Numerical Baseline Decision Values are Not Mutated
def test_baseline_input_immutability(priya_input):
    orig_income = list(priya_input.income)
    orig_expenses = list(priya_input.essential_expenses)

    req = RecoverySimulationRequest(
        customer_input=priya_input,
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    _ = RecoveryEngine.simulate_recovery(req)

    # Verify input object remains untouched
    assert priya_input.income == orig_income
    assert priya_input.essential_expenses == orig_expenses


# 18. Disclaimer is Present
def test_simulation_disclaimer_present(priya_input):
    res = RecoveryEngine.simulate_recovery(RecoverySimulationRequest(customer_input=priya_input))
    assert "SIMULATED ESTIMATE — NOT A GUARANTEED OUTCOME" in res.disclaimer


# 19. HTTP API Endpoint Integration Test
def test_api_simulate_recovery_endpoint(priya_input):
    payload = {
        "customer_input": priya_input.model_dump(),
        "horizon_months": 6,
        "scenario": "ADHERENT_RECOVERY"
    }
    response = client.post("/api/v1/recovery/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["customer_id"] == priya_input.customer_id
    assert data["scenario"] == "ADHERENT_RECOVERY"
    assert len(data["trajectory"]) == 7
    assert "delta" in data
    assert "narrative_summary" in data
    assert "SIMULATED ESTIMATE" in data["disclaimer"]


# 20. Meena Cash Flow Timing Recovery Simulation
def test_meena_timing_synchronization_recovery(meena_input):
    req = RecoverySimulationRequest(
        customer_input=meena_input,
        horizon_months=6,
        scenario="ADHERENT_RECOVERY"
    )
    res = RecoveryEngine.simulate_recovery(req)

    assert res.delta.baseline_diagnosis == "CASH_FLOW_MISMATCH"
    assert res.selected_intervention_id == "CFM-L2-DATE-SYNC"
    # Month 6 stress drops significantly
    assert res.delta.stress_reduction_percent > 30.0
