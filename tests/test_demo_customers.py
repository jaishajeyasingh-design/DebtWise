"""Unit tests verifying deterministic predictions on canonical demo customer personas."""
import pytest
from finshield_ml.inference import predict_distress
from finshield_ml.demo_customers import (
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
)


def test_priya_expense_shock_prediction():
    res = predict_distress(PRIYA_EXPENSE_SHOCK)
    assert res["primary_cause"] == "EXPENSE_SHOCK"
    assert res["confidence"] >= 0.70
    
    # Check that expense-related feature appears in top SHAP factors
    shap_feature_names = [f["feature"] for f in res["top_shap_factors"]]
    assert any("expense" in f or "savings" in f for f in shap_feature_names)


def test_arun_debt_overload_prediction():
    res = predict_distress(ARUN_DEBT_OVERLOAD)
    assert res["primary_cause"] == "DEBT_OVERLOAD"
    assert res["confidence"] >= 0.70
    
    shap_feature_names = [f["feature"] for f in res["top_shap_factors"]]
    assert any("debt" in f or "obligation" in f or "credit_utilization" in f for f in shap_feature_names)


def test_rahul_income_shock_prediction():
    res = predict_distress(RAHUL_INCOME_SHOCK)
    assert res["primary_cause"] == "INCOME_SHOCK"
    assert res["confidence"] >= 0.70
    
    shap_feature_names = [f["feature"] for f in res["top_shap_factors"]]
    assert any("income" in f or "savings" in f for f in shap_feature_names)


def test_meena_cash_flow_mismatch_prediction():
    res = predict_distress(MEENA_CASH_FLOW_MISMATCH)
    assert res["primary_cause"] == "CASH_FLOW_MISMATCH"
    assert res["confidence"] >= 0.70
    
    shap_feature_names = [f["feature"] for f in res["top_shap_factors"]]
    assert any("cash_flow" in f or "overdraft" in f for f in shap_feature_names)
