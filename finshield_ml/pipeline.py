"""
FinShield ML Pipeline Runner
Executes the end-to-end AI/ML workflow:
  1. Generate synthetic financial dataset (6,000 customers across 5 archetypes)
  2. Perform feature engineering
  3. Train XGBoost Multiclass Distress Classifier
  4. Evaluate performance (Accuracy, Macro F1, Per-class metrics, Confusion Matrix)
  5. Save versioned model artifacts and feature configuration
  6. Run SHAP explainability on demo personas (Priya, Arun, Rahul, Meena)
"""
import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd

# Reconfigure stdout for UTF-8 on Windows environments
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from finshield_ml.config import (
    DEFAULT_NUM_CUSTOMERS,
    DEFAULT_HISTORY_MONTHS,
    DATASET_FILE,
    FEATURES_DATASET_FILE,
    METRICS_FILE,
    MODEL_FILE,
    DISTRESS_CLASSES,
    ALL_FEATURES
)
from finshield_ml.generator import SyntheticFinancialGenerator
from finshield_ml.feature_engineering import FinancialFeatureExtractor
from finshield_ml.model import DistressClassifier
from finshield_ml.evaluate import ModelEvaluator
from finshield_ml.explainability import DistressExplainer
from finshield_ml.inference import predict_distress
from finshield_ml.demo_customers import DEMO_CUSTOMERS


def run_pipeline(num_customers: int = DEFAULT_NUM_CUSTOMERS) -> dict:
    print("=" * 70)
    print("FINSHIELD ML PIPELINE - PHASE 1 EXECUTION")
    print("=" * 70)

    # 1. Dataset Generation
    print(f"\n[Step 1/5] Generating {num_customers} synthetic customer histories (6-12 months)...")
    generator = SyntheticFinancialGenerator(seed=42)
    raw_dataset = generator.generate_dataset(num_customers=num_customers)
    print(f"[OK] Generated {len(raw_dataset)} customer records.")

    # Convert to DataFrame and save raw series
    raw_df = pd.DataFrame(raw_dataset)
    raw_df.to_parquet(DATASET_FILE, index=False)
    print(f"[OK] Raw time-series dataset saved to: {DATASET_FILE}")

    # Class distribution
    class_dist = raw_df["distress_cause"].value_counts().to_dict()
    print("\nClass Distribution:")
    for cls_name, count in class_dist.items():
        print(f"  * {cls_name:<22}: {count:>5} customers ({count/len(raw_df)*100:.1f}%)")

    # 2. Feature Engineering
    print(f"\n[Step 2/5] Extracting {len(ALL_FEATURES)} engineered features from time-series...")
    features_df = FinancialFeatureExtractor.transform_dataset(raw_dataset)
    features_df.to_parquet(FEATURES_DATASET_FILE, index=False)
    print(f"[OK] Extracted feature matrix shape: {features_df[ALL_FEATURES].shape}")
    print(f"[OK] Feature dataset saved to: {FEATURES_DATASET_FILE}")

    # 3. Model Training
    print("\n[Step 3/5] Training XGBoost Multiclass Distress Classifier...")
    X = features_df[ALL_FEATURES]
    y = features_df["distress_cause"]
    
    classifier, train_meta, (X_train, X_test, y_train, y_test) = DistressClassifier.train(
        X, y, test_size=0.20, random_state=42
    )
    print(f"[OK] Training complete. Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 4. Evaluation
    print("\n[Step 4/5] Evaluating classifier on held-out test split...")
    y_pred_idx = classifier.predict(X_test)
    metrics = ModelEvaluator.evaluate(y_test, y_pred_idx, classes=DISTRESS_CLASSES)
    ModelEvaluator.save_metrics(metrics, METRICS_FILE)
    
    print(ModelEvaluator.format_summary_table(metrics))

    # Save versioned model artifacts
    classifier.save()
    print(f"[OK] Model artifact saved to: {MODEL_FILE}")

    # 5. SHAP Explainability & Demo Persona Evaluation
    print("\n[Step 5/5] Running SHAP Explainability on Deterministic Demo Personas...")
    explainer = DistressExplainer(classifier.model, classifier.features)

    demo_results = {}
    for cust in DEMO_CUSTOMERS:
        res = predict_distress(
            cust,
            top_k_factors=4,
            classifier=classifier,
            explainer=explainer
        )
        demo_results[cust["name"]] = res
        
        print("\n" + "-" * 70)
        print(f"PERSONA: {cust['name']} (Expected: {cust['distress_cause']})")
        print(f"Predicted Primary Cause: {res['primary_cause']} (Confidence: {res['confidence']*100:.1f}%)")
        print("Class Probabilities:")
        for cls_name, prob in res["probabilities"].items():
            bar = "#" * int(prob * 25)
            print(f"   {cls_name:<22}: {prob*100:>5.1f}% | {bar}")
        print("Top SHAP Feature Attributions:")
        for factor in res["top_shap_factors"]:
            sign = "(+)" if factor["contribution"] == "positive" else "(-)"
            print(f"   {sign} {factor['feature']:<28} [val={factor['feature_value']:>7.2f}, SHAP={factor['shap_value']:>+6.3f}] -> {factor['description']}")

    print("\n" + "=" * 70)
    print("PHASE 1 AI/ML PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 70)

    return {
        "dataset_size": len(raw_dataset),
        "feature_count": len(ALL_FEATURES),
        "class_distribution": class_dist,
        "metrics": metrics,
        "demo_results": demo_results
    }


if __name__ == "__main__":
    n_cust = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_NUM_CUSTOMERS
    run_pipeline(n_cust)

