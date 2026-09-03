"""
Feature Engineering Module for FinShield
Extracts robust, explainable financial risk & distress features from customer time-series records.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Union

from finshield_ml.config import CORE_FEATURES, ADDITIONAL_FEATURES, ALL_FEATURES


class FinancialFeatureExtractor:
    """
    Transforms raw customer financial time-series into structured tabular features.
    Computes ratios, growth rates, volatility metrics, and cash-flow timing indicators.
    """

    @staticmethod
    def extract_features_from_customer(customer: Dict[str, Any]) -> Dict[str, float]:
        """Extracts engineered feature vector from a single customer dictionary."""
        
        income = np.array(customer.get("income", [1.0]), dtype=float)
        essential_exp = np.array(customer.get("essential_expenses", [0.0]), dtype=float)
        discretionary_exp = np.array(customer.get("discretionary_expenses", [0.0]), dtype=float)
        obligations = np.array(customer.get("obligations", [0.0]), dtype=float)
        total_debt = np.array(customer.get("total_debt", [0.0]), dtype=float)
        savings = np.array(customer.get("savings", [0.0]), dtype=float)
        credit_limit = float(customer.get("credit_limit", 50000.0))
        credit_balance = np.array(customer.get("credit_balance", [0.0]), dtype=float)
        payment_delays = np.array(customer.get("payment_delays", [0]), dtype=int)
        overdraft_count = np.array(customer.get("overdraft_count", [0]), dtype=int)
        min_payment_flag = np.array(customer.get("min_payment_flag", [0]), dtype=int)
        
        salary_day = int(customer.get("salary_day", 1))
        emi_due_day = int(customer.get("emi_due_day", 5))
        n_months = len(income)

        # 1. debt_to_income_ratio (monthly debt / monthly income)
        curr_income = max(100.0, income[-1])
        debt_to_income_ratio = float(total_debt[-1] / curr_income)

        # 2. expense_to_income_ratio
        total_curr_expenses = essential_exp[-1] + discretionary_exp[-1]
        expense_to_income_ratio = float(total_curr_expenses / curr_income)

        # 3. obligation_to_income_ratio
        obligation_to_income_ratio = float(obligations[-1] / curr_income)

        # 4. essential_expense_ratio (essential / total expenses)
        essential_expense_ratio = float(essential_exp[-1] / max(10.0, total_curr_expenses))

        # 5. income_volatility (coefficient of variation: std / mean)
        mean_inc = np.mean(income)
        income_volatility = float(np.std(income) / max(100.0, mean_inc))

        # 6. savings_decline_rate (fractional drawdown from peak/early savings to current)
        early_savings = max(100.0, np.mean(savings[:min(3, n_months)]))
        savings_decline_rate = float(max(0.0, early_savings - savings[-1]) / early_savings)

        # 7. debt_growth_rate (rate of increase in debt from start of history to current)
        early_debt = max(100.0, total_debt[0])
        debt_growth_rate = float((total_debt[-1] - early_debt) / early_debt)

        # 8. expense_growth_rate (growth in essential+discretionary expenses)
        total_exp_series = essential_exp + discretionary_exp
        early_exp = max(100.0, np.mean(total_exp_series[:min(3, n_months)]))
        recent_exp = np.mean(total_exp_series[-min(3, n_months):])
        expense_growth_rate = float((recent_exp - early_exp) / early_exp)

        # 9. payment_delay_rate (fraction of months with payment delays)
        payment_delay_rate = float(np.mean(payment_delays))

        # 10. overdraft_frequency (average overdrafts per month)
        overdraft_frequency = float(np.mean(overdraft_count))

        # 11. credit_utilization (latest revolving balance / credit limit)
        credit_utilization = float(credit_balance[-1] / max(1000.0, credit_limit))

        # 12. cash_flow_mismatch_score (timing lag where EMI is due before salary lands)
        timing_lag_days = max(0, salary_day - emi_due_day)
        has_overdrafts = 1.0 if np.sum(overdraft_count) > 0 else 0.1
        cash_flow_mismatch_score = float((timing_lag_days / 10.0) * has_overdrafts)

        # Supplementary Engineered Features
        # Liquid buffer in months of essential living cost
        liquid_buffer_months = float(savings[-1] / max(100.0, essential_exp[-1]))
        
        # Discretionary spend ratio
        discretionary_spend_ratio = float(discretionary_exp[-1] / max(10.0, total_curr_expenses))
        
        # Missed payment count
        missed_payment_count = float(np.sum(payment_delays))
        
        # Min payment only ratio
        min_payment_only_ratio = float(np.mean(min_payment_flag))

        return {
            "debt_to_income_ratio": round(debt_to_income_ratio, 4),
            "expense_to_income_ratio": round(expense_to_income_ratio, 4),
            "obligation_to_income_ratio": round(obligation_to_income_ratio, 4),
            "essential_expense_ratio": round(essential_expense_ratio, 4),
            "income_volatility": round(income_volatility, 4),
            "savings_decline_rate": round(savings_decline_rate, 4),
            "debt_growth_rate": round(debt_growth_rate, 4),
            "expense_growth_rate": round(expense_growth_rate, 4),
            "payment_delay_rate": round(payment_delay_rate, 4),
            "overdraft_frequency": round(overdraft_frequency, 4),
            "credit_utilization": round(credit_utilization, 4),
            "cash_flow_mismatch_score": round(cash_flow_mismatch_score, 4),
            "liquid_buffer_months": round(liquid_buffer_months, 4),
            "discretionary_spend_ratio": round(discretionary_spend_ratio, 4),
            "missed_payment_count": round(missed_payment_count, 1),
            "min_payment_only_ratio": round(min_payment_only_ratio, 4)
        }

    @classmethod
    def transform_dataset(cls, raw_dataset: List[Dict[str, Any]]) -> pd.DataFrame:
        """Transforms a list of raw customer dictionaries into a feature DataFrame with labels."""
        rows = []
        for cust in raw_dataset:
            features = cls.extract_features_from_customer(cust)
            features["customer_id"] = cust.get("customer_id", "UNKNOWN")
            features["distress_cause"] = cust.get("distress_cause", "UNKNOWN")
            rows.append(features)
            
        df = pd.DataFrame(rows)
        return df

    @classmethod
    def get_feature_matrix(cls, df: pd.DataFrame) -> pd.DataFrame:
        """Returns only the feature columns in canonical order for model ingestion."""
        return df[ALL_FEATURES].copy()
