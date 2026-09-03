# FinShield API Reference & Developer Guide

## 🌐 Base URL
```
http://localhost:8000/api/v1
```

Interactive OpenAPI documentation is available locally at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 📌 Endpoints

### 1. Health Check
`GET /api/v1/health`

#### Response (`200 OK`)
```json
{
  "status": "healthy",
  "api_name": "FinShield Backend Engine",
  "version": "1.0.0",
  "phase_1_ml": {
    "status": "active",
    "model_path": ".../finshield_xgboost_distress_v1.json",
    "model_ready": true
  },
  "phase_2_backend": {
    "status": "active",
    "capacity_engine": "deterministic_v1",
    "safety_filter": "enforced_sc001_sc008"
  }
}
```

---

### 2. Retrieve Demo Customer Persona
`GET /api/v1/demo-customer/{name}`

#### Path Parameters
- `name`: Persona keyword (`priya`, `arun`, `rahul`, `meena`).

#### Response (`200 OK`)
```json
{
  "customer_id": "CUST_PRIYA_34",
  "name": "Priya Sharma",
  "age": 34,
  "distress_cause": "EXPENSE_SHOCK",
  "salary_day": 1,
  "emi_due_day": 5,
  "credit_limit": 100000.0,
  "income": [60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0],
  "essential_expenses": [22000.0, 22500.0, 22000.0, 23000.0, 22000.0, 22500.0, 22000.0, 23000.0, 24000.0, 39000.0, 41000.0, 39500.0],
  "obligations": [25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0],
  "savings": [55000.0, 56000.0, 54000.0, 55000.0, 53000.0, 52000.0, 50000.0, 48000.0, 45000.0, 22000.0, 12000.0, 10000.0],
  "credit_balance": [18000.0, 19000.0, 17500.0, 18000.0, 19000.0, 20000.0, 19500.0, 21000.0, 25000.0, 55000.0, 68000.0, 72000.0]
}
```

---

### 3. Direct Phase 1 ML Diagnosis
`POST /api/v1/diagnose-distress`

#### Request Body
```json
{
  "customer_id": "CUST_PRIYA_34",
  "income": [60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0, 60000.0],
  "essential_expenses": [22000.0, 22500.0, 22000.0, 23000.0, 22000.0, 22500.0, 22000.0, 23000.0, 24000.0, 39000.0, 41000.0, 39500.0],
  "obligations": [25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0, 25000.0],
  "savings": [55000.0, 56000.0, 54000.0, 55000.0, 53000.0, 52000.0, 50000.0, 48000.0, 45000.0, 22000.0, 12000.0, 10000.0]
}
```

#### Response (`200 OK`)
```json
{
  "customer_id": "CUST_PRIYA_34",
  "primary_cause": "EXPENSE_SHOCK",
  "confidence": 0.885,
  "probabilities": {
    "INCOME_SHOCK": 0.03,
    "DEBT_OVERLOAD": 0.02,
    "CASH_FLOW_MISMATCH": 0.04,
    "EXPENSE_SHOCK": 0.885,
    "STRUCTURAL_DISTRESS": 0.025
  },
  "top_shap_factors": [
    {
      "feature": "expense_growth_rate",
      "shap_value": 1.45,
      "feature_value": 0.78,
      "contribution": "INCREASES_RISK",
      "description": "Recent expense surge significantly drives predicted EXPENSE_SHOCK"
    }
  ],
  "engineered_features": { ... }
}
```

---

### 4. End-to-End Decision Pipeline
`POST /api/v1/analyze`

#### Response (`200 OK`)
```json
{
  "customer_id": "CUST_PRIYA_34",
  "timestamp": "2026-09-03T19:30:00Z",
  "risk": {
    "primary_cause": "EXPENSE_SHOCK",
    "confidence": 0.885,
    "severity": "HIGH",
    "severity_reasons": [
      "Monthly EMI gap of ₹9,850 exceeds sustainable surplus.",
      "Emergency buffer is depleted below 1.0 month (0.25 months)."
    ],
    "top_factors": [ ... ]
  },
  "capacity": {
    "affordability_status": "DEFICIT",
    "average_income": 60000.0,
    "average_essential_expenses": 39833.33,
    "average_discretionary_expenses": 1666.67,
    "current_obligations": 25000.0,
    "living_cost_floor": 39833.33,
    "safe_disposable_income": 20166.67,
    "emergency_buffer_requirement": 39833.33,
    "safe_emi": 17141.67,
    "emi_gap": 7858.33,
    "liquid_buffer_months": 0.251,
    "dti": 0.4167,
    "warnings": [
      "Monthly EMI of ₹25,000 exceeds safe capacity of ₹17,142."
    ]
  },
  "candidate_interventions": [ ... ],
  "safety_evaluation": [ ... ],
  "selected_intervention": {
    "id": "EXP-L4-TEMP-EMI-REDUCTION",
    "level": 4,
    "name": "3-Month Temporary EMI Relief to Sustainable Floor",
    "intervention_type": "TEMPORARY_EMI_REDUCTION_3MO",
    "title": "3-Month Temporary EMI Relief to Sustainable Floor",
    "estimated_monthly_relief": 7858.33,
    "estimated_emi_after": 17141.67,
    "reversibility": "MEDIUM",
    "intrusiveness": "MODERATE",
    "requires_human_approval": true,
    "requires_customer_consent": true
  },
  "tier": "TIER_B",
  "customer_consent_required": true,
  "human_approval_required": true,
  "explanation": "Diagnosis: Priya Sharma is experiencing Expense Shock (88.5% confidence)...",
  "next_steps": [
    "Present clear, transparent digital consent disclosure for '3-Month Temporary EMI Relief to Sustainable Floor' to customer.",
    "Route packaged intervention dossier to Bank Hardship Officer for binding approval (TIER_B)."
  ]
}
```
