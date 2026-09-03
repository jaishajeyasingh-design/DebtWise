"""Unit tests for inference and SHAP explainability."""
import pytest
import numpy as np
from finshield_ml.inference import predict_distress
from finshield_ml.demo_customers import PRIYA_EXPENSE_SHOCK
from finshield_ml.config import DISTRESS_CLASSES


def test_predict_distress_structure():
    res = predict_distress(PRIYA_EXPENSE_SHOCK, top_k_factors=4)
    
    assert "primary_cause" in res
    assert "confidence" in res
    assert "probabilities" in res
    assert "top_shap_factors" in res
    assert "engineered_features" in res
    
    assert res["primary_cause"] in DISTRESS_CLASSES
    assert 0.0 <= res["confidence"] <= 1.0
    
    # Probabilities should sum to approximately 1.0
    prob_sum = sum(res["probabilities"].values())
    assert abs(prob_sum - 1.0) < 0.05
    
    # Check top SHAP factors structure
    assert len(res["top_shap_factors"]) == 4
    for factor in res["top_shap_factors"]:
        assert "feature" in factor
        assert "shap_value" in factor
        assert "feature_value" in factor
        assert "contribution" in factor
        assert "description" in factor
