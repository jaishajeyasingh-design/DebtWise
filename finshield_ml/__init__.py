"""
FinShield ML Package
AI-Assisted Financial Distress Intervention Engine — Core AI/ML Track
"""
from finshield_ml.config import (
    DISTRESS_CLASSES,
    CORE_FEATURES,
    ALL_FEATURES,
    MODEL_FILE,
    FEATURE_CONFIG_FILE
)
from finshield_ml.feature_engineering import FinancialFeatureExtractor
from finshield_ml.generator import SyntheticFinancialGenerator
from finshield_ml.model import DistressClassifier
from finshield_ml.evaluate import ModelEvaluator
from finshield_ml.explainability import DistressExplainer
from finshield_ml.inference import predict_distress
from finshield_ml.demo_customers import (
    DEMO_CUSTOMERS,
    get_demo_customer,
    PRIYA_EXPENSE_SHOCK,
    ARUN_DEBT_OVERLOAD,
    RAHUL_INCOME_SHOCK,
    MEENA_CASH_FLOW_MISMATCH
)

__all__ = [
    "predict_distress",
    "DistressClassifier",
    "DistressExplainer",
    "FinancialFeatureExtractor",
    "SyntheticFinancialGenerator",
    "ModelEvaluator",
    "DEMO_CUSTOMERS",
    "get_demo_customer",
    "PRIYA_EXPENSE_SHOCK",
    "ARUN_DEBT_OVERLOAD",
    "RAHUL_INCOME_SHOCK",
    "MEENA_CASH_FLOW_MISMATCH",
    "DISTRESS_CLASSES",
    "CORE_FEATURES",
    "ALL_FEATURES",
    "MODEL_FILE",
    "FEATURE_CONFIG_FILE"
]
