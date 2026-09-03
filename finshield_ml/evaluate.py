"""
Model Evaluation Module for FinShield
Calculates accuracy, macro/weighted F1, per-class precision/recall, and confusion matrix.
"""
import json
from pathlib import Path
from typing import Dict, Any, Union
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    classification_report,
    confusion_matrix
)

from finshield_ml.config import (
    DISTRESS_CLASSES,
    IDX_TO_CLASS,
    METRICS_FILE
)


class ModelEvaluator:
    """Computes comprehensive multiclass performance metrics and serializes results."""

    @staticmethod
    def evaluate(
        y_true: Union[pd.Series, np.ndarray, list],
        y_pred: Union[pd.Series, np.ndarray, list],
        classes: list = DISTRESS_CLASSES
    ) -> Dict[str, Any]:
        """Calculates multi-dimensional performance metrics on test predictions."""
        
        y_true_arr = np.array(y_true)
        y_pred_arr = np.array(y_pred)

        # Map to class names if integers
        if np.issubdtype(y_true_arr.dtype, np.integer):
            y_true_names = [IDX_TO_CLASS[i] for i in y_true_arr]
            y_pred_names = [IDX_TO_CLASS[i] for i in y_pred_arr]
        else:
            y_true_names = list(y_true_arr)
            y_pred_names = list(y_pred_arr)

        acc = float(accuracy_score(y_true_names, y_pred_names))
        macro_f1 = float(f1_score(y_true_names, y_pred_names, average="macro", labels=classes))
        weighted_f1 = float(f1_score(y_true_names, y_pred_names, average="weighted", labels=classes))

        # Per-class metrics
        precisions = precision_score(y_true_names, y_pred_names, average=None, labels=classes, zero_division=0)
        recalls = recall_score(y_true_names, y_pred_names, average=None, labels=classes, zero_division=0)
        f1s = f1_score(y_true_names, y_pred_names, average=None, labels=classes, zero_division=0)

        per_class_metrics = {}
        for idx, cls_name in enumerate(classes):
            per_class_metrics[cls_name] = {
                "precision": round(float(precisions[idx]), 4),
                "recall": round(float(recalls[idx]), 4),
                "f1_score": round(float(f1s[idx]), 4)
            }

        # Confusion Matrix
        cm = confusion_matrix(y_true_names, y_pred_names, labels=classes)
        cm_dict = {
            classes[i]: {classes[j]: int(cm[i][j]) for j in range(len(classes))}
            for i in range(len(classes))
        }

        metrics = {
            "accuracy": round(acc, 4),
            "macro_f1": round(macro_f1, 4),
            "weighted_f1": round(weighted_f1, 4),
            "per_class_metrics": per_class_metrics,
            "confusion_matrix": cm_dict,
            "classes": classes,
            "total_test_samples": len(y_true_names)
        }

        return metrics

    @classmethod
    def save_metrics(cls, metrics: Dict[str, Any], filepath: Path = METRICS_FILE) -> None:
        """Saves evaluation metrics as a formatted JSON document."""
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, "w") as f:
            json.dump(metrics, f, indent=2)

    @classmethod
    def format_summary_table(cls, metrics: Dict[str, Any]) -> str:
        """Formats evaluation metrics into a clean text summary table."""
        lines = []
        lines.append("=" * 65)
        lines.append("FINSHIELD XGBOOST DISTRESS CLASSIFIER EVALUATION REPORT")
        lines.append("=" * 65)
        lines.append(f"Overall Accuracy:  {metrics['accuracy'] * 100:.2f}%")
        lines.append(f"Macro F1-Score:    {metrics['macro_f1']:.4f}")
        lines.append(f"Weighted F1-Score: {metrics['weighted_f1']:.4f}")
        lines.append(f"Total Test Set:    {metrics['total_test_samples']} samples")
        lines.append("-" * 65)
        lines.append(f"{'Class Name':<24} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
        lines.append("-" * 65)
        for cls_name, vals in metrics["per_class_metrics"].items():
            lines.append(
                f"{cls_name:<24} | {vals['precision']:<10.4f} | {vals['recall']:<10.4f} | {vals['f1_score']:<10.4f}"
            )
        lines.append("=" * 65)
        return "\n".join(lines)
