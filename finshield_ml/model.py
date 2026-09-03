"""
XGBoost Distress-Cause Classifier Model Management
Handles model training, serialization, artifact versioning, and loading.
"""
import json
import joblib
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split

from finshield_ml.config import (
    MODEL_FILE,
    MODEL_PKL,
    FEATURE_CONFIG_FILE,
    DISTRESS_CLASSES,
    CLASS_TO_IDX,
    IDX_TO_CLASS,
    ALL_FEATURES,
    CORE_FEATURES,
    XGBOOST_PARAMS,
    RANDOM_SEED
)


class DistressClassifier:
    """
    XGBoost Multiclass Distress Classifier.
    Predicts the underlying cause of financial distress across 5 archetypes.
    """

    def __init__(self, model: Optional[xgb.XGBClassifier] = None):
        self.model = model
        self.features = ALL_FEATURES
        self.classes = DISTRESS_CLASSES

    @classmethod
    def train(
        cls,
        X: pd.DataFrame,
        y: pd.Series,
        test_size: float = 0.20,
        random_state: int = RANDOM_SEED
    ) -> Tuple["DistressClassifier", Dict[str, Any], Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]]:
        """
        Trains the XGBoost classifier and returns the trained wrapper, training metadata, and test split.
        """
        # Ensure numerical labels
        if y.dtype == 'object' or isinstance(y.iloc[0], str):
            y_encoded = y.map(CLASS_TO_IDX)
        else:
            y_encoded = y

        X_train, X_test, y_train, y_test = train_test_split(
            X[ALL_FEATURES],
            y_encoded,
            test_size=test_size,
            random_state=random_state,
            stratify=y_encoded
        )

        model = xgb.XGBClassifier(**XGBOOST_PARAMS)
        model.fit(
            X_train,
            y_train,
            eval_set=[(X_train, y_train), (X_test, y_test)],
            verbose=False
        )

        wrapper = cls(model=model)
        metadata = {
            "n_train_samples": len(X_train),
            "n_test_samples": len(X_test),
            "features": ALL_FEATURES,
            "classes": DISTRESS_CLASSES,
            "params": XGBOOST_PARAMS
        }

        return wrapper, metadata, (X_train, X_test, y_train, y_test)

    def save(
        self,
        model_path: Path = MODEL_FILE,
        pkl_path: Path = MODEL_PKL,
        config_path: Path = FEATURE_CONFIG_FILE
    ) -> None:
        """Saves the trained model in JSON and Joblib format, along with feature configuration."""
        if self.model is None:
            raise ValueError("Cannot save an uninitialized or untrained model.")

        model_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 1. Save native XGBoost JSON
        self.model.save_model(str(model_path))

        # 2. Save joblib pipeline artifact
        joblib.dump(self.model, pkl_path)

        # 3. Save feature configuration
        feature_config = {
            "version": "1.0.0",
            "model_type": "XGBoost Multiclass Distress Classifier",
            "classes": DISTRESS_CLASSES,
            "class_to_idx": CLASS_TO_IDX,
            "idx_to_class": IDX_TO_CLASS,
            "features": ALL_FEATURES,
            "core_features": CORE_FEATURES,
            "num_features": len(ALL_FEATURES),
            "hyperparameters": XGBOOST_PARAMS
        }
        with open(config_path, "w") as f:
            json.dump(feature_config, f, indent=2)

    @classmethod
    def load(
        cls,
        model_path: Path = MODEL_FILE,
        config_path: Path = FEATURE_CONFIG_FILE
    ) -> "DistressClassifier":
        """Loads a versioned model and feature configuration from disk."""
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at: {model_path}")

        model = xgb.XGBClassifier()
        model.load_model(str(model_path))
        
        instance = cls(model=model)
        if config_path.exists():
            with open(config_path, "r") as f:
                cfg = json.load(f)
                instance.features = cfg.get("features", ALL_FEATURES)
                instance.classes = cfg.get("classes", DISTRESS_CLASSES)
        return instance

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Returns predicted class probabilities for input features."""
        if self.model is None:
            raise ValueError("Model is not initialized.")
        return self.model.predict_proba(X[self.features])

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Returns predicted class index array."""
        if self.model is None:
            raise ValueError("Model is not initialized.")
        return self.model.predict(X[self.features])
