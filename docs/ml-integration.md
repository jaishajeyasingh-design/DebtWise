# FinShield ML Integration Contract & Developer Guide

This document defines the stable integration interface between the **FinShield AI/ML Module** and the **FastAPI Backend**.

---

## 📌 1. Primary Entry Point

FastAPI routes should import `predict_distress` directly from the `finshield_ml` package:

```python
from finshield_ml import predict_distress
```

> **Important Architectural Boundary:**  
> The `predict_distress()` function provides **Distress-Cause Diagnosis & SHAP Explainability ONLY**.  
> In adherence to FinShield's "Diagnosis Before Treatment" architecture, **Sustainable Repayment Capacity calculation** and **Intervention Selection/Safety Filtering** must remain in their respective dedicated backend modules.

---

## 📥 2. Accepted `customer_data` Input Schema

`predict_distress(customer_data)` accepts a standard Python dictionary containing multi-month financial time-series (6–12 months recommended):

| Field | Type | Description | Required | Example |
| :--- | :--- | :--- | :---: | :--- |
| `customer_id` | `str` | Unique identifier for customer account | Yes | `"CUST_PRIYA_34"` |
| `income` | `List[float]` | Monthly net income time-series | Yes | `[60000.0, ...]` |
| `essential_expenses`| `List[float]` | Non-discretionary expenses (rent, food, medical) | Yes | `[22000.0, 39000.0, ...]` |
| `discretionary_expenses`| `List[float]` | Discretionary lifestyle spending | Yes | `[8000.0, 1500.0, ...]` |
| `obligations` | `List[float]` | Monthly debt repayments (loan EMIs, cards) | Yes | `[25000.0, ...]` |
| `total_debt` | `List[float]` | Total outstanding debt balance per month | Yes | `[480000.0, ...]` |
| `savings` | `List[float]` | Liquid savings account balance per month | Yes | `[55000.0, 10000.0, ...]` |
| `credit_limit` | `float` | Approved revolving credit line limit | Yes | `100000.0` |
| `credit_balance` | `List[float]` | Revolving credit line balance per month | Yes | `[18000.0, 72000.0, ...]` |
| `payment_delays` | `List[int]` | Delayed/missed payment indicator (0=on time, 1=late) | Yes | `[0, 0, ..., 1, 1]` |
| `overdraft_count` | `List[int]` | Count of overdraft incidents in month | Yes | `[0, 0, ..., 2, 2]` |
| `min_payment_flag` | `List[int]` | Minimum payment only flag (0=normal, 1=min only) | No | `[0, 0, ..., 1, 1]` |
| `salary_day` | `int` | Day of month when salary is credited (1–31) | Yes | `1` |
| `emi_due_day` | `int` | Day of month when primary EMI is deducted (1–31) | Yes | `5` |

---

## 📤 3. Return Schema

The function returns a pure Python dictionary containing native JSON-serializable types:

```typescript
interface DistressPredictionResponse {
  customer_id: string;
  primary_cause: "INCOME_SHOCK" | "DEBT_OVERLOAD" | "CASH_FLOW_MISMATCH" | "EXPENSE_SHOCK" | "STRUCTURAL_DISTRESS";
  confidence: number; // Float between 0.0 and 1.0 (e.g. 0.9939)
  probabilities: {
    INCOME_SHOCK: number;
    DEBT_OVERLOAD: number;
    CASH_FLOW_MISMATCH: number;
    EXPENSE_SHOCK: number;
    STRUCTURAL_DISTRESS: number;
  };
  top_factors: Array<{
    feature: string;
    shap_value: number;
    feature_value: number;
    contribution: "positive" | "negative";
    description: string;
  }>;
  engineered_features: Record<string, number>;
}
```

---

## 💡 4. Complete Example: Priya Sharma (Expense Shock)

### Example Input (`customer_data`):
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

### Example Output:
```json
{
  "customer_id": "CUST_PRIYA_34",
  "primary_cause": "EXPENSE_SHOCK",
  "confidence": 0.9939,
  "probabilities": {
    "INCOME_SHOCK": 0.0015,
    "DEBT_OVERLOAD": 0.0014,
    "CASH_FLOW_MISMATCH": 0.0017,
    "EXPENSE_SHOCK": 0.9939,
    "STRUCTURAL_DISTRESS": 0.0014
  },
  "top_factors": [
    {
      "feature": "expense_growth_rate",
      "shap_value": 3.4286,
      "feature_value": 0.3681,
      "contribution": "positive",
      "description": "Sudden surge in monthly living/emergency expenditures"
    },
    {
      "feature": "payment_delay_rate",
      "shap_value": -0.4534,
      "feature_value": 0.1667,
      "contribution": "negative",
      "description": "Consistent on-time payment track record"
    },
    {
      "feature": "obligation_to_income_ratio",
      "shap_value": -0.2453,
      "feature_value": 0.4167,
      "contribution": "negative",
      "description": "Monthly loan repayments are within affordable limits"
    },
    {
      "feature": "savings_decline_rate",
      "shap_value": 0.2196,
      "feature_value": 0.8182,
      "contribution": "positive",
      "description": "Liquid emergency savings have been heavily depleted"
    }
  ],
  "engineered_features": {
    "debt_to_income_ratio": 7.0833,
    "expense_to_income_ratio": 0.6833,
    "obligation_to_income_ratio": 0.4167,
    "essential_expense_ratio": 0.9634,
    "income_volatility": 0.0,
    "savings_decline_rate": 0.8182,
    "debt_growth_rate": -0.1146,
    "expense_growth_rate": 0.3681,
    "payment_delay_rate": 0.1667,
    "overdraft_frequency": 0.4167,
    "credit_utilization": 0.72,
    "cash_flow_mismatch_score": 0.0,
    "liquid_buffer_months": 0.2532,
    "discretionary_spend_ratio": 0.0366,
    "missed_payment_count": 2.0,
    "min_payment_only_ratio": 0.25
  }
}
```

---

## ⚡ 5. FastAPI Implementation Example

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from finshield_ml import predict_distress, get_demo_customer

app = FastAPI(title="FinShield API", version="1.0.0")

class CustomerTimeSeriesPayload(BaseModel):
    customer_id: str
    income: List[float] = Field(..., min_length=1)
    essential_expenses: List[float] = Field(..., min_length=1)
    discretionary_expenses: List[float] = Field(..., min_length=1)
    obligations: List[float] = Field(..., min_length=1)
    total_debt: List[float] = Field(..., min_length=1)
    savings: List[float] = Field(..., min_length=1)
    credit_limit: float
    credit_balance: List[float] = Field(..., min_length=1)
    payment_delays: List[int] = Field(..., min_length=1)
    overdraft_count: List[int] = Field(..., min_length=1)
    min_payment_flag: Optional[List[int]] = None
    salary_day: int = Field(1, ge=1, le=31)
    emi_due_day: int = Field(5, ge=1, le=31)

@app.post("/api/v1/diagnose-distress")
async def diagnose_customer_distress(payload: CustomerTimeSeriesPayload):
    try:
        # 1. Run ML Root-Cause Diagnosis + SHAP Attributions
        prediction_result = predict_distress(payload.model_dump())
        
        # 2. Return result for downstream capacity & intervention processing
        return {
            "status": "success",
            "data": prediction_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/demo-customer/{name}")
async def get_demo_profile(name: str):
    """Utility endpoint to fetch canonical demo profiles (Priya, Arun, Rahul, Meena)."""
    try:
        return get_demo_customer(name)
    except KeyError:
        raise HTTPException(status_code=404, detail="Demo customer not found")
```

---

## 📦 6. Dependencies Required

The following Python packages must be in the backend runtime environment:

```text
xgboost>=3.0.0
shap>=0.50.0
scikit-learn>=1.5.0
pandas>=2.2.0
numpy>=2.0.0
joblib>=1.4.0
pyarrow>=20.0.0
```

---

## 🔒 7. Architectural Boundary Reminders

1. **Diagnosis Only:** `predict_distress()` answers *“Why is this borrower struggling?”*. It does not decide what repayment reduction or loan restructuring to offer.
2. **Deterministic Capacity:** The Repayment Capacity Engine must take the customer's income and living cost floor to calculate max affordable EMI independently of ML predictions.
3. **Safety Filtering:** The Safety Layer must filter proposed interventions according to policy constraints (e.g. Rejecting Debt Consolidation if DTI > 65%).
