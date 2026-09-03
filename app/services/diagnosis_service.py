"""
Diagnosis Service
Connects to Phase 1 finshield_ml.predict_distress() without modifying or duplicating ML code.
"""
from typing import Dict, Any
from app.schemas.customer import CustomerInput
from app.schemas.diagnosis import DiagnosisResult, ShapFactor
from finshield_ml import predict_distress


class DiagnosisService:
    """Service wrapper for ML model inference and SHAP explainability."""

    @staticmethod
    def diagnose_customer(customer: CustomerInput) -> DiagnosisResult:
        """
        Runs Phase 1 XGBoost multi-class distress classification and local SHAP explainability.
        
        Args:
            customer: Validated CustomerInput Pydantic object.
            
        Returns:
            DiagnosisResult containing primary cause, probabilities, and top SHAP factors.
        """
        raw_dict = customer.to_dict()
        ml_output = predict_distress(raw_dict, top_k_factors=5)

        shap_factors = [
            ShapFactor(
                feature=f.get("feature", "unknown"),
                shap_value=float(f.get("shap_value", 0.0)),
                feature_value=float(f.get("feature_value", 0.0)),
                contribution=str(f.get("contribution", "UNKNOWN")),
                description=str(f.get("description", ""))
            )
            for f in ml_output.get("top_shap_factors", [])
        ]

        return DiagnosisResult(
            customer_id=ml_output.get("customer_id", customer.customer_id),
            primary_cause=ml_output.get("primary_cause", "UNKNOWN"),
            confidence=float(ml_output.get("confidence", 0.0)),
            probabilities=ml_output.get("probabilities", {}),
            top_shap_factors=shap_factors,
            engineered_features=ml_output.get("engineered_features", {})
        )
