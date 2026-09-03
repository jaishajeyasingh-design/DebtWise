"""Unit tests for feature engineering module."""
import pytest
import pandas as pd
from finshield_ml.feature_engineering import FinancialFeatureExtractor
from finshield_ml.generator import SyntheticFinancialGenerator
from finshield_ml.config import CORE_FEATURES, ALL_FEATURES


def test_feature_extraction_keys():
    generator = SyntheticFinancialGenerator(seed=42)
    cust = generator.generate_customer_series("CUST_TEST", "INCOME_SHOCK", months=12)
    
    features = FinancialFeatureExtractor.extract_features_from_customer(cust)
    
    # Check that all core and total features are present
    for feat in CORE_FEATURES:
        assert feat in features, f"Missing core feature: {feat}"
        assert not pd.isna(features[feat]), f"NaN found in feature {feat}"
        
    for feat in ALL_FEATURES:
        assert feat in features, f"Missing feature: {feat}"


def test_feature_matrix_transformation():
    generator = SyntheticFinancialGenerator(seed=42)
    dataset = generator.generate_dataset(num_customers=50, history_months=12)
    
    df = FinancialFeatureExtractor.transform_dataset(dataset)
    
    assert len(df) == 50
    assert "customer_id" in df.columns
    assert "distress_cause" in df.columns
    
    X = FinancialFeatureExtractor.get_feature_matrix(df)
    assert X.shape == (50, len(ALL_FEATURES))
    assert X.isnull().sum().sum() == 0
