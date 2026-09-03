"""
Integration Tests for FastAPI REST Endpoints
Verifies health, demo personas, ML diagnosis, and end-to-end analysis endpoints using FastAPI TestClient.
"""
import pytest
from starlette.testclient import TestClient
from app.main import app
from finshield_ml.demo_customers import PRIYA_EXPENSE_SHOCK, MEENA_CASH_FLOW_MISMATCH

client = TestClient(app)


def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "FinShield" in data["app"]
    assert data["status"] == "online"


def test_api_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["phase_1_ml"]["status"] == "active"
    assert data["phase_2_backend"]["status"] == "active"


def test_api_get_demo_customer_priya():
    response = client.get("/api/v1/demo-customer/priya")
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "CUST_PRIYA_34"
    assert data["distress_cause"] == "EXPENSE_SHOCK"


def test_api_get_demo_customer_not_found():
    response = client.get("/api/v1/demo-customer/nonexistent_person")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


def test_api_list_demo_customers():
    response = client.get("/api/v1/demo-customers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    names = [c["name"] for c in data]
    assert any("Priya" in n for n in names)
    assert any("Arun" in n for n in names)


def test_api_diagnose_distress_endpoint():
    response = client.post("/api/v1/diagnose-distress", json=PRIYA_EXPENSE_SHOCK)
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "CUST_PRIYA_34"
    assert data["primary_cause"] == "EXPENSE_SHOCK"
    assert data["confidence"] >= 0.70
    assert len(data["top_shap_factors"]) > 0


def test_api_analyze_endpoint_priya():
    response = client.post("/api/v1/analyze", json=PRIYA_EXPENSE_SHOCK)
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "CUST_PRIYA_34"
    assert data["risk"]["primary_cause"] == "EXPENSE_SHOCK"
    assert "capacity" in data
    assert data["capacity"]["living_cost_floor"] > 0
    assert data["selected_intervention"] is not None
    assert len(data["safety_evaluation"]) > 0
    assert len(data["next_steps"]) > 0
    assert data["tier"] in ("TIER_A", "TIER_B", "TIER_C")

    # Verify Governance Gates
    assert "consent_gate" in data
    assert data["consent_gate"]["consent_required"] is True
    assert data["consent_gate"]["consent_status"] == "PENDING_CUSTOMER_CONSENT"
    assert "human_approval_gate" in data
    assert data["human_approval_gate"]["approval_required"] is True
    assert data["is_executable"] is False

    # Verify Audit Record
    assert "audit_record" in data
    assert data["audit_record"]["audit_id"].startswith("AUDIT-CUST_PRIYA_34-")
    assert data["audit_record"]["candidates_evaluated_count"] > 0


def test_api_analyze_endpoint_meena_timing_fix():
    response = client.post("/api/v1/analyze", json=MEENA_CASH_FLOW_MISMATCH)
    assert response.status_code == 200
    data = response.json()
    assert data["risk"]["primary_cause"] == "CASH_FLOW_MISMATCH"
    assert data["selected_intervention"]["level"] == 2
    assert data["tier"] == "TIER_A"
    assert data["consent_gate"]["consent_required"] is True
    assert data["human_approval_gate"]["approval_required"] is False
    assert "audit_record" in data


def test_api_analyze_invalid_input():
    # Negative income or empty lists should trigger validation failure (422)
    invalid_payload = {
        "customer_id": "INVALID_01",
        "income": [-5000.0],
        "essential_expenses": [20000.0],
        "obligations": [10000.0]
    }
    response = client.post("/api/v1/analyze", json=invalid_payload)
    assert response.status_code == 422
