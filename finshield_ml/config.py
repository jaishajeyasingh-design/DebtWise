"""
FinShield ML Configuration
Defines class labels, feature lists, file paths, and model hyperparameters.
"""
from pathlib import Path
from typing import List, Dict

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
DATA_DIR = BASE_DIR / "data"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

MODEL_FILE = ARTIFACTS_DIR / "finshield_xgboost_distress_v1.json"
MODEL_PKL = ARTIFACTS_DIR / "finshield_xgboost_distress_v1.joblib"
FEATURE_CONFIG_FILE = ARTIFACTS_DIR / "feature_config.json"
METRICS_FILE = ARTIFACTS_DIR / "evaluation_metrics.json"
DATASET_FILE = DATA_DIR / "synthetic_customers_timeseries.parquet"
FEATURES_DATASET_FILE = DATA_DIR / "customer_features.parquet"

# Distress Cause Labels
DISTRESS_CLASSES: List[str] = [
    "INCOME_SHOCK",
    "DEBT_OVERLOAD",
    "CASH_FLOW_MISMATCH",
    "EXPENSE_SHOCK",
    "STRUCTURAL_DISTRESS"
]

CLASS_TO_IDX: Dict[str, int] = {cls_name: i for i, cls_name in enumerate(DISTRESS_CLASSES)}
IDX_TO_CLASS: Dict[int, str] = {i: cls_name for i, cls_name in enumerate(DISTRESS_CLASSES)}

# Feature Definitions
CORE_FEATURES: List[str] = [
    "debt_to_income_ratio",
    "expense_to_income_ratio",
    "obligation_to_income_ratio",
    "essential_expense_ratio",
    "income_volatility",
    "savings_decline_rate",
    "debt_growth_rate",
    "expense_growth_rate",
    "payment_delay_rate",
    "overdraft_frequency",
    "credit_utilization",
    "cash_flow_mismatch_score"
]

# Additional supplementary engineered features to improve model robustness
ADDITIONAL_FEATURES: List[str] = [
    "liquid_buffer_months",
    "discretionary_spend_ratio",
    "missed_payment_count",
    "min_payment_only_ratio"
]

ALL_FEATURES: List[str] = CORE_FEATURES + ADDITIONAL_FEATURES

# Model Hyperparameters
XGBOOST_PARAMS = {
    "n_estimators": 150,
    "max_depth": 5,
    "learning_rate": 0.08,
    "subsample": 0.85,
    "colsample_bytree": 0.85,
    "objective": "multi:softprob",
    "num_class": len(DISTRESS_CLASSES),
    "random_state": 42,
    "eval_metric": "mlogloss"
}

# Generator Parameters
DEFAULT_NUM_CUSTOMERS = 6000
DEFAULT_HISTORY_MONTHS = 12
RANDOM_SEED = 42
