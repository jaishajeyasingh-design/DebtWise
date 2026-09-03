# FinShield ML Integration Specification & Contract

## 📌 Overview
This document defines the integration contract between the **Phase 1 Machine Learning Package (`finshield_ml`)** and the **Phase 2 Backend Decision Engine (`app`)**.

---

## 🔬 ML Model Characteristics
- **Algorithm:** XGBoost Multi-Class Classifier (`objective="multi:softprob"`, `num_class=5`)
- **Classes:**
  1. `INCOME_SHOCK` (Sudden drop in earnings / job interruption)
  2. `DEBT_OVERLOAD` (Compounding unsustainable loan and credit card obligations)
  3. `CASH_FLOW_MISMATCH` (Payroll deposit date vs EMI autopay deduction timing conflict)
  4. `EXPENSE_SHOCK` (Acute surge in essential medical/repair expenses)
  5. `STRUCTURAL_DISTRESS` (Chronic long-term deficit between living floor and net income)
- **Explainability:** TreeSHAP local feature attribution (`shap.TreeExplainer`).

---

## 📥 Ingestion Interface: `predict_distress()`

```python
from finshield_ml import predict_distress

result = predict_distress(customer_data, top_k_factors=5)
```

### Input Schema (`customer_data`)
```json
{
  "customer_id": "CUST_PRIYA_34",
  "name": "Priya Sharma",
  "age": 34,
  "salary_day": 1,
  "emi_due_day": 5,
  "credit_limit": 100000.0,
  "income": [60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0],
  "essential_expenses": [22000.0, 22500.0, 22000.0, 23000.0, 22000.0, 22500.0, 22000.0, 23000.0, 24000.0, 39000.0, 41000.0, 39500.0],
  "discretionary_expenses": [8000.0, 8500.0, 8000.0, 7500.0, 8000.0, 8000.0, 7500.0, 7000.0, 6000.0, 2000.0, 1500.0, 1500.0],
  "obligations": [25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0],
  "total_debt": [480000.0, 475000.0, 470000.0, 465000.0, 460000.0, 455000.0, 450000.0, 445000.0, 440000.0, 435000.0, 430000.0, 425000.0],
  "savings": [55000.0, 56000.0, 54000.0, 55000.0, 53000.0, 52000.0, 50000.0, 48000.0, 45000.0, 22000.0, 12000.0, 10000.0],
  "credit_balance": [18000.0, 19000.0, 17500.0, 18000.0, 19000.0, 20000.0, 19500.0, 21000.0, 25000.0, 55000.0, 68000.0, 72000.0],
  "payment_delays": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  "overdraft_count": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2],
  "min_payment_flag": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1]
}
```

### Output Contract
```json
{
  "customer_id": "CUST_PRIYA_34",
  "primary_cause": "EXPENSE_SHOCK",
  "confidence": 0.885,
  "probabilities": {
    "INCOME_SHOCK": 0.032,
    "DEBT_OVERLOAD": 0.021,
    "CASH_FLOW_MISMATCH": 0.041,
    "EXPENSE_SHOCK": 0.885,
    "STRUCTURAL_DISTRESS": 0.021
  },
  "top_shap_factors": [
    {
      "feature": "expense_growth_rate",
      "shap_value": 1.452,
      "feature_value": 0.783,
      "contribution": "INCREASES_RISK",
      "description": "Recent expense surge significantly drives predicted EXPENSE_SHOCK"
    }
  ],
  "engineered_features": { ... }
}
```

---

## 🔒 Architectural Boundaries
1. `finshield_ml` provides root-cause diagnosis and SHAP attributions ONLY.
2. The ML model has **ZERO authority** to compute repayment capacity, override policy floors, or approve financial restructuring.
