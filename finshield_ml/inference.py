"""
Inference API for FinShield Distress Cause Engine
Provides a clean, reusable predict_distress(customer_data) function designed for FastAPI integration.
"""
from typing import Dict, Any, Optional, Union
import pandas as pd
import numpy as np

from finshield_ml.config import (
    MODEL_FILE,
    FEATURE_CONFIG_FILE,
    ALL_FEATURES,
    DISTRESS_CLASSES,
    CLASS_TO_IDX,
    IDX_TO_CLASS
)
from finshield_ml.feature_engineering import FinancialFeatureExtractor
from finshield_ml.model import DistressClassifier
from finshield_ml.explainability import DistressExplainer


# Global cached model and explainer instances for low-latency inference
_CACHED_CLASSIFIER: Optional[DistressClassifier] = None
_CACHED_EXPLAINER: Optional[DistressExplainer] = None


def get_or_load_classifier() -> DistressClassifier:
    """Retrieves or lazily loads the singleton DistressClassifier instance."""
    global _CACHED_CLASSIFIER
    if _CACHED_CLASSIFIER is None:
        if not MODEL_FILE.exists():
            raise FileNotFoundError(
                f"Model file not found at {MODEL_FILE}. Please run the training pipeline first."
            )
        _CACHED_CLASSIFIER = DistressClassifier.load(MODEL_FILE, FEATURE_CONFIG_FILE)
    return _CACHED_CLASSIFIER


def get_or_load_explainer() -> DistressExplainer:
    """Retrieves or lazily loads the singleton DistressExplainer instance."""
    global _CACHED_EXPLAINER
    if _CACHED_EXPLAINER is None:
        classifier = get_or_load_classifier()
        _CACHED_EXPLAINER = DistressExplainer(classifier.model, classifier.features)
    return _CACHED_EXPLAINER


def predict_distress(
    customer_data: Dict[str, Any],
    top_k_factors: int = 5,
    classifier: Optional[DistressClassifier] = None,
    explainer: Optional[DistressExplainer] = None
) -> Dict[str, Any]:
    """
    Main inference function for FinShield Distress Diagnosis.
    
    Accepts raw customer time-series history or engineered feature dict,
    runs XGBoost multi-class prediction, and computes local SHAP feature attributions.

    Args:
        customer_data: Dict containing either:
                       a) Raw time-series fields: 'income', 'essential_expenses', 'obligations',
                          'total_debt', 'savings', 'credit_balance', 'payment_delays', 'overdraft_count', etc.
                       b) Pre-extracted features matching ALL_FEATURES.
        top_k_factors: Number of top SHAP factors to return (default: 5).
        classifier: Optional custom DistressClassifier instance.
        explainer: Optional custom DistressExplainer instance.

    Returns:
        Dict with keys:
            - customer_id: Customer ID string
            - primary_cause: Predicted distress archetype string (e.g. 'EXPENSE_SHOCK')
            - confidence: Highest predicted probability float (e.g. 0.865)
            - probabilities: Dict mapping each of the 5 classes to its probability
            - top_shap_factors: List of top contributing SHAP factors with plain-English descriptions
            - engineered_features: Dict of all extracted features used for inference
    """
    clf = classifier if classifier is not None else get_or_load_classifier()
    exp = explainer if explainer is not None else get_or_load_explainer()

    customer_id = customer_data.get("customer_id", "ANONYMOUS_CUSTOMER")

    # Check if raw time-series needs feature extraction
    if "income" in customer_data and isinstance(customer_data["income"], (list, np.ndarray)):
        features_dict = FinancialFeatureExtractor.extract_features_from_customer(customer_data)
    else:
        # Assume pre-engineered feature dictionary
        features_dict = {f: float(customer_data.get(f, 0.0)) for f in ALL_FEATURES}

    features_df = pd.DataFrame([features_dict])[ALL_FEATURES]

    # Model inference
    proba_arr = clf.predict_proba(features_df)[0]
    predicted_idx = int(np.argmax(proba_arr))
    primary_cause = IDX_TO_CLASS.get(predicted_idx, "UNKNOWN")
    confidence = float(proba_arr[predicted_idx])

    # Probability mapping
    probabilities = {
        cls_name: round(float(proba_arr[idx]), 4)
        for idx, cls_name in enumerate(DISTRESS_CLASSES)
    }

    # SHAP feature attributions
    top_factors = exp.explain_instance(
        features_df=features_df,
        target_class_idx=predicted_idx,
        top_k=top_k_factors
    )

    return {
        "customer_id": customer_id,
        "primary_cause": primary_cause,
        "confidence": round(confidence, 4),
        "probabilities": probabilities,
        "top_factors": top_factors,
        "top_shap_factors": top_factors,
        "engineered_features": features_dict
    }

