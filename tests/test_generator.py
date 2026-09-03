"""Unit tests for synthetic dataset generator."""
import pytest
from finshield_ml.generator import SyntheticFinancialGenerator
from finshield_ml.config import DISTRESS_CLASSES


def test_generate_single_customer():
    generator = SyntheticFinancialGenerator(seed=123)
    cust = generator.generate_customer_series("CUST_TEST_001", "EXPENSE_SHOCK", months=12)
    
    assert cust["customer_id"] == "CUST_TEST_001"
    assert cust["distress_cause"] == "EXPENSE_SHOCK"
    assert len(cust["income"]) == 12
    assert len(cust["essential_expenses"]) == 12
    assert len(cust["obligations"]) == 12
    assert len(cust["savings"]) == 12
    assert cust["credit_limit"] > 0
    assert all(x >= 0 for x in cust["savings"])


def test_generate_dataset_balance():
    generator = SyntheticFinancialGenerator(seed=42)
    dataset = generator.generate_dataset(num_customers=500, history_months=12)
    
    assert len(dataset) == 500
    causes = [c["distress_cause"] for c in dataset]
    
    # Check that all 5 classes are present and roughly balanced
    for cls_name in DISTRESS_CLASSES:
        count = causes.count(cls_name)
        assert count == 100
