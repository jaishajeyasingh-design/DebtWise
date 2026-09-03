"""
Diagnosis Result Schema
Defines response models for ML distress classification and SHAP explainability outputs.
"""
from typing import List, Dict, Any
from pydantic import BaseModel, Field


class ShapFactor(BaseModel):
    feature: str = Field(..., description="Engineered feature name")
    shap_value: float = Field(..., description="Local SHAP attribution score")
    feature_value: float = Field(..., description="Customer's actual feature value")
    contribution: str = Field(..., description="Directional impact: INCREASES_RISK or REDUCES_RISK")
    description: str = Field(..., description="Human-readable plain English explanation")


class DiagnosisResult(BaseModel):
    customer_id: str = Field(..., description="Customer ID")
    primary_cause: str = Field(..., description="Predicted distress archetype")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score for predicted class")
    probabilities: Dict[str, float] = Field(..., description="Probabilities across all 5 distress classes")
    top_shap_factors: List[ShapFactor] = Field(default_factory=list, description="Top SHAP feature attributions")
    engineered_features: Dict[str, float] = Field(default_factory=dict, description="Engineered feature matrix values")
