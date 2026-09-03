"""
FinShield FastAPI Route Handlers
Implements REST endpoints for health, demo persona retrieval, ML diagnosis, and end-to-end decision orchestration.
"""
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status, Path

from app.schemas.customer import CustomerInput
from app.schemas.diagnosis import DiagnosisResult
from app.schemas.intervention import DecisionResponse
from app.schemas.explanation import ExplanationResponse
from app.services.diagnosis_service import DiagnosisService
from app.services.decision_engine import DecisionEngine
from app.services.explanation_service import ExplanationService
from app.config import settings
from finshield_ml.demo_customers import get_demo_customer, DEMO_CUSTOMERS
from finshield_ml.config import MODEL_FILE

api_router = APIRouter()


@api_router.get(
    "/health",
    summary="System Health & Diagnostic Status",
    response_description="Returns runtime health, ML model availability, and API version."
)
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint returning system status and model readiness.
    """
    model_loaded = MODEL_FILE.exists()
    return {
        "status": "healthy" if model_loaded else "degraded",
        "api_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "phase_1_ml": {
            "status": "active" if model_loaded else "model_file_missing",
            "model_path": str(MODEL_FILE),
            "model_ready": model_loaded
        },
        "phase_2_backend": {
            "status": "active",
            "capacity_engine": "deterministic_v1",
            "safety_filter": "enforced_sc001_sc008"
        }
    }


@api_router.get(
    "/demo-customer/{name}",
    summary="Retrieve Canonical Demo Customer Persona",
    response_description="Returns complete time-series and profile data for Priya, Arun, Rahul, or Meena."
)
async def get_demo_customer_by_name(
    name: str = Path(..., description="Customer persona name or distress cause (e.g. 'priya', 'arun', 'rahul', 'meena')")
) -> Dict[str, Any]:
    """
    Retrieves canonical deterministic demo customer records for live UI demonstrations and testing.
    """
    try:
        customer_data = get_demo_customer(name)
        return customer_data
    except KeyError:
        valid_options = [c["name"].split()[0].lower() for c in DEMO_CUSTOMERS]
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demo customer '{name}' not found. Available personas: {', '.join(valid_options)}"
        )


@api_router.get(
    "/demo-customers",
    summary="List All Demo Customer Personas",
    response_description="Returns all 4 canonical demo customer records."
)
async def list_all_demo_customers() -> List[Dict[str, Any]]:
    """
    Returns full list of canonical demo customer profiles.
    """
    return DEMO_CUSTOMERS


@api_router.post(
    "/diagnose-distress",
    response_model=DiagnosisResult,
    summary="Direct Phase 1 ML Distress Classification",
    response_description="Returns multi-class probabilities and top SHAP feature attributions."
)
async def diagnose_distress(customer: CustomerInput) -> DiagnosisResult:
    """
    Exposes raw Phase 1 ML distress diagnosis independently from downstream intervention logic.
    """
    try:
        return DiagnosisService.diagnose_customer(customer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing distress diagnosis: {str(e)}"
        )


@api_router.post(
    "/analyze",
    response_model=DecisionResponse,
    summary="Complete End-to-End FinShield Decision Pipeline",
    response_description="Executes Diagnosis -> Capacity -> Severity -> Candidates -> Safety Filter -> Final Recommendation."
)
async def analyze_customer(customer: CustomerInput) -> DecisionResponse:
    """
    Primary FinShield decision orchestration endpoint.
    Processes customer financial time-series through the complete closed-loop responsible intervention pipeline.
    """
    try:
        return DecisionEngine.analyze_customer(customer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing customer distress pipeline: {str(e)}"
        )


@api_router.post(
    "/explain",
    response_model=ExplanationResponse,
    summary="Generate Plain-English Post-Decision Explanation",
    response_description="Translates structured decision engine output into empathetic, non-judgmental customer communication."
)
async def explain_decision(decision: DecisionResponse) -> ExplanationResponse:
    """
    Dedicated post-decision explanation endpoint.
    Accepts authoritative DecisionResponse and returns structured customer communication.
    Has zero authority over financial calculations, safety filters, or intervention selection.
    """
    try:
        return ExplanationService.generate_explanation(decision)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating decision explanation: {str(e)}"
        )
