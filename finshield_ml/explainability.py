"""
SHAP Explainability Module for FinShield
Wraps SHAP TreeExplainer to provide transparent, human-interpretable feature attributions for every prediction.
"""
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd
import shap
import xgboost as xgb

from finshield_ml.config import (
    ALL_FEATURES,
    DISTRESS_CLASSES,
    CLASS_TO_IDX,
    IDX_TO_CLASS
)

# Human-readable feature explanations
FEATURE_DESCRIPTIONS: Dict[str, Dict[str, str]] = {
    "essential_expense_ratio": {
        "pos": "High proportion of budget absorbed by non-discretionary essential expenses",
        "neg": "Essential expenses are within normal budget limits"
    },
    "expense_growth_rate": {
        "pos": "Sudden surge in monthly living/emergency expenditures",
        "neg": "Monthly expenses have remained stable or contracted"
    },
    "debt_to_income_ratio": {
        "pos": "Total outstanding debt is excessively high relative to income",
        "neg": "Overall debt-to-income burden is low"
    },
    "obligation_to_income_ratio": {
        "pos": "Monthly EMI commitments absorb an unsustainable share of income",
        "neg": "Monthly loan repayments are within affordable limits"
    },
    "income_volatility": {
        "pos": "High income instability and sharp recent earnings drop",
        "neg": "Monthly payroll deposits are consistent and predictable"
    },
    "savings_decline_rate": {
        "pos": "Liquid emergency savings have been heavily depleted",
        "neg": "Savings buffer has remained intact"
    },
    "debt_growth_rate": {
        "pos": "Accelerating debt accumulation and new borrowing",
        "neg": "Debt balances are stable or amortizing down"
    },
    "payment_delay_rate": {
        "pos": "Frequent missed or late repayment incidents",
        "neg": "Consistent on-time payment track record"
    },
    "overdraft_frequency": {
        "pos": "Repeated bank account overdrafts and negative balance dips",
        "neg": "No overdraft fees or balance dips recorded"
    },
    "credit_utilization": {
        "pos": "Credit card and revolving credit lines are near maximum capacity",
        "neg": "Revolving credit utilization is low"
    },
    "cash_flow_mismatch_score": {
        "pos": "Severe timing gap: loan repayment due date hits before salary credit date",
        "neg": "Repayment dates align smoothly with payroll deposits"
    },
    "liquid_buffer_months": {
        "pos": "Healthy emergency cash buffer available",
        "neg": "Near zero emergency savings buffer to absorb unexpected shocks"
    },
    "discretionary_spend_ratio": {
        "pos": "High discretionary lifestyle spending",
        "neg": "Strictly tightened discretionary spending"
    },
    "missed_payment_count": {
        "pos": "Multiple recent payment defaults flagged",
        "neg": "Zero recent payment delinquencies"
    },
    "min_payment_only_ratio": {
        "pos": "Borrower is persistently paying only the minimum credit card due",
        "neg": "Balances are paid down beyond the minimum requirement"
    }
}


class DistressExplainer:
    """Computes SHAP feature attributions for multiclass XGBoost models."""

    def __init__(self, model: xgb.XGBClassifier, feature_names: List[str] = ALL_FEATURES):
        self.model = model
        self.feature_names = feature_names
        self.explainer = shap.TreeExplainer(model)

    def explain_instance(
        self,
        features_df: pd.DataFrame,
        target_class_idx: Optional[int] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Computes local SHAP values for a single customer feature vector and returns top contributing factors.
        """
        # Ensure correct column order
        X = features_df[self.feature_names].copy()
        
        # Calculate raw SHAP values: shape (n_samples, n_features, n_classes) or list of arrays
        shap_values = self.explainer.shap_values(X)

        # If target class is not provided, use the model's top predicted class
        if target_class_idx is None:
            preds = self.model.predict_proba(X)[0]
            target_class_idx = int(np.argmax(preds))

        # Handle multiclass output structure
        if isinstance(shap_values, list):
            # List of arrays per class: shap_values[class_idx][sample_idx, feature_idx]
            class_shap = shap_values[target_class_idx][0]
        elif len(shap_values.shape) == 3:
            # 3D array: (n_samples, n_features, n_classes)
            class_shap = shap_values[0, :, target_class_idx]
        else:
            # 2D array
            class_shap = shap_values[0]

        feature_vals = X.iloc[0].values
        
        # Build explanation items
        factors = []
        for i, f_name in enumerate(self.feature_names):
            s_val = float(class_shap[i])
            f_val = float(feature_vals[i])
            contrib = "positive" if s_val > 0 else "negative"
            
            desc_map = FEATURE_DESCRIPTIONS.get(f_name, {})
            human_desc = desc_map.get("pos" if s_val > 0 else "neg", f"{f_name} impacted decision")
            
            factors.append({
                "feature": f_name,
                "shap_value": round(s_val, 4),
                "feature_value": round(f_val, 4),
                "abs_importance": abs(s_val),
                "contribution": contrib,
                "description": human_desc
            })

        # Sort by absolute SHAP value importance
        factors = sorted(factors, key=lambda x: x["abs_importance"], reverse=True)
        
        # Return top_k with clean keys
        top_factors = []
        for item in factors[:top_k]:
            top_factors.append({
                "feature": item["feature"],
                "shap_value": item["shap_value"],
                "feature_value": item["feature_value"],
                "contribution": item["contribution"],
                "description": item["description"]
            })

        return top_factors
