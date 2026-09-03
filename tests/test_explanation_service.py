"""
Unit and Integration Tests for FinShield LLM Explanation & Communication Layer
Verifies:
- Structured post-decision explanation generation across all canonical personas.
- Deterministic fallback behavior when LLM API key is missing.
- Resilience against provider errors, timeouts, and malformed JSON.
- Responsible AI constraint: Arun's consolidation rejection is faithfully explained, no debt is recommended.
- Immutability guarantee: Decision values (capacity, safe EMI, DTI, safety status) remain unchanged.
- POST /api/v1/explain endpoint contract and schema validation.
"""
import json
import pytest
from unittest.mock import patch, MagicMock
from starlette.testclient import TestClient

from app.main import app
from app.services.decision_engine import DecisionEngine
from app.services.explanation_service import ExplanationService
from app.schemas.customer import CustomerInput
from app.schemas.intervention import DecisionResponse
from app.schemas.explanation import ExplanationResponse
from finshield_ml.demo_customers import (
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
)

client = TestClient(app)


@pytest.fixture
def priya_decision() -> DecisionResponse:
    cust = CustomerInput(**PRIYA_EXPENSE_SHOCK)
    return DecisionEngine.analyze_customer(cust)


@pytest.fixture
def arun_decision() -> DecisionResponse:
    cust = CustomerInput(**ARUN_DEBT_OVERLOAD)
    return DecisionEngine.analyze_customer(cust)


@pytest.fixture
def rahul_decision() -> DecisionResponse:
    cust = CustomerInput(**RAHUL_INCOME_SHOCK)
    return DecisionEngine.analyze_customer(cust)


@pytest.fixture
def meena_decision() -> DecisionResponse:
    cust = CustomerInput(**MEENA_CASH_FLOW_MISMATCH)
    return DecisionEngine.analyze_customer(cust)


def test_explanation_fallback_when_api_key_missing(priya_decision):
    """When no API key is set, explanation service returns deterministic fallback seamlessly."""
    explanation = ExplanationService.generate_explanation(priya_decision, api_key=None)

    assert isinstance(explanation, ExplanationResponse)
    assert explanation.metadata.fallback_used is True
    assert explanation.metadata.provider == "deterministic_fallback"
    assert "Priya" in priya_decision.explanation or "EXPENSE_SHOCK" in priya_decision.risk.primary_cause
    assert "expense shock" in explanation.summary.lower() or "expense shock" in explanation.why_this_happened.lower()
    assert len(explanation.what_we_can_do) > 0
    assert len(explanation.affordability_context) > 0
    assert len(explanation.customer_message) > 0
    assert "estimate" in explanation.disclaimer.lower()


def test_arun_debt_overload_safety_rejection_faithful_explanation(arun_decision):
    """
    CRITICAL DEMO VERIFICATION:
    Arun has DEBT_OVERLOAD with DTI > 65% and rejected consolidation loan.
    The explanation MUST explain the safety rejection and NEVER recommend additional debt.
    """
    explanation = ExplanationService.generate_explanation(arun_decision, api_key=None)

    assert arun_decision.risk.primary_cause == "DEBT_OVERLOAD"
    assert arun_decision.capacity.dti > 0.65

    # Check that consolidation was rejected in authoritative decision
    consolidation_eval = next(
        (e for e in arun_decision.safety_evaluation if "CONSOLIDATION" in e.intervention_id.upper()),
        None
    )
    assert consolidation_eval is not None
    assert consolidation_eval.status == "REJECTED"

    # Verify explanation faithfully explains rejection under safety constraints
    why_safer = explanation.why_this_option_is_safer.lower()
    assert "consolidation" in why_safer
    assert "rejected" in why_safer or "safety" in why_safer

    # Responsible AI constraint: Must NOT recommend taking more debt or a new loan
    summary_lower = explanation.summary.lower()
    what_we_can_do_lower = explanation.what_we_can_do.lower()
    assert "take a new loan" not in summary_lower
    assert "take a new loan" not in what_we_can_do_lower
    assert "borrow more" not in what_we_can_do_lower


def test_meena_cash_flow_mismatch_timing_explanation(meena_decision):
    """Meena's cash flow timing mismatch should be explained as a date alignment fix without debt changes."""
    explanation = ExplanationService.generate_explanation(meena_decision, api_key=None)

    assert meena_decision.risk.primary_cause == "CASH_FLOW_MISMATCH"
    assert "mismatch" in explanation.why_this_happened.lower() or "timing" in explanation.why_this_happened.lower()
    assert meena_decision.selected_intervention.level == 2


def test_rahul_income_shock_explanation(rahul_decision):
    """Rahul's income shock should be explained with sustainable temporary relief."""
    explanation = ExplanationService.generate_explanation(rahul_decision, api_key=None)

    assert rahul_decision.risk.primary_cause == "INCOME_SHOCK"
    assert "income shock" in explanation.summary.lower() or "income shock" in explanation.why_this_happened.lower()


def test_explanation_service_resilience_on_http_error(priya_decision):
    """When external LLM provider returns an HTTP 500 error, service falls back gracefully."""
    mock_response = MagicMock()
    mock_response.raise_for_status.side_effect = Exception("Anthropic 500 Internal Error")

    with patch("httpx.Client.post", return_value=mock_response):
        explanation = ExplanationService.generate_explanation(
            priya_decision,
            api_key="mock_test_key",
            model="claude-test-model"
        )

    assert isinstance(explanation, ExplanationResponse)
    assert explanation.metadata.fallback_used is True
    assert explanation.metadata.provider == "deterministic_fallback"
    assert len(explanation.summary) > 0


def test_explanation_service_resilience_on_malformed_json(priya_decision):
    """When external LLM returns invalid/malformed JSON, service falls back gracefully."""
    mock_response = MagicMock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {
        "content": [{"text": "Sorry, I cannot format this as JSON properly {broken"}]
    }

    with patch("httpx.Client.post", return_value=mock_response):
        explanation = ExplanationService.generate_explanation(
            priya_decision,
            api_key="mock_test_key",
            model="claude-test-model"
        )

    assert isinstance(explanation, ExplanationResponse)
    assert explanation.metadata.fallback_used is True
    assert explanation.metadata.provider == "deterministic_fallback"


def test_explanation_service_successful_mocked_llm_response(priya_decision):
    """When external LLM returns valid structured JSON, service parses and returns it with LLM metadata."""
    mock_llm_json = {
        "summary": "Priya is experiencing a temporary expense shock from sudden essential medical bills.",
        "why_this_happened": "Analysis identified elevated essential expenses consuming uncommitted cash flow.",
        "what_we_can_do": "DebtWise proposes 3-Month Temporary EMI Relief providing ₹8,000/mo cash-flow relief.",
        "why_this_option_is_safer": "All proposals adhere strictly to safe capacity rules SC-001 through SC-008.",
        "affordability_context": "Sustainable capacity is ₹17,000/mo, protecting a ₹25,000/mo essential living floor.",
        "customer_message": "You remain in control and can accept, choose another option, or speak with an officer.",
        "disclaimer": "This is an estimate, not a guaranteed outcome."
    }

    mock_response = MagicMock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {
        "content": [{"text": json.dumps(mock_llm_json)}]
    }

    with patch("httpx.Client.post", return_value=mock_response):
        explanation = ExplanationService.generate_explanation(
            priya_decision,
            api_key="valid_test_key",
            model="claude-sonnet-4-20250514"
        )

    assert isinstance(explanation, ExplanationResponse)
    assert explanation.metadata.fallback_used is False
    assert explanation.metadata.provider == "anthropic"
    assert explanation.metadata.model == "claude-sonnet-4-20250514"
    assert explanation.summary == mock_llm_json["summary"]
    assert explanation.why_this_happened == mock_llm_json["why_this_happened"]


def test_decision_immutability_guarantee(priya_decision):
    """The explanation layer must NEVER modify authoritative decision numbers or states."""
    orig_safe_emi = priya_decision.capacity.safe_emi
    orig_dti = priya_decision.capacity.dti
    orig_cause = priya_decision.risk.primary_cause
    orig_tier = priya_decision.tier
    orig_intervention_id = priya_decision.selected_intervention.id

    ExplanationService.generate_explanation(priya_decision, api_key=None)

    assert priya_decision.capacity.safe_emi == orig_safe_emi
    assert priya_decision.capacity.dti == orig_dti
    assert priya_decision.risk.primary_cause == orig_cause
    assert priya_decision.tier == orig_tier
    assert priya_decision.selected_intervention.id == orig_intervention_id


def test_api_explain_endpoint_integration(priya_decision):
    """POST /api/v1/explain endpoint returns valid ExplanationResponse JSON."""
    decision_payload = priya_decision.model_dump()
    response = client.post("/api/v1/explain", json=decision_payload)

    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "why_this_happened" in data
    assert "what_we_can_do" in data
    assert "why_this_option_is_safer" in data
    assert "affordability_context" in data
    assert "customer_message" in data
    assert "disclaimer" in data
    assert "metadata" in data
    assert data["metadata"]["fallback_used"] is True
