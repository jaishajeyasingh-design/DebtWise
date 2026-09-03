# FinShield Backend Architecture & Policy Specification

## 🛡️ 1. Executive Mission
**FinShield** moves banks from merely predicting Probability of Default (PD) to actively, safely, and sustainably resolving customer financial distress.

Our foundational motto: **"Diagnosis Before Treatment."**

---

## 🏛️ 2. Architectural Overview

```
                      [ Raw Financial Time-Series ]
                                    │
                                    ▼
                      [ POST /api/v1/analyze ]
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
[ Phase 1 ML Diagnosis ]                          [ Deterministic Capacity ]
• 5-Class XGBoost Classifier                      • Non-Negotiable Living Floor
• Local TreeSHAP Attributions                     • Safe Disposable Income & EMI
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    │
                                    ▼
                         [ Multi-Factor Severity ]
                         • LOW / MODERATE / HIGH / CRITICAL
                                    │
                                    ▼
                     [ 7-Level Intervention Ladder ]
                     • Level 0: MONITOR
                     • Level 1: INFORM
                     • Level 2: TIMING FIX
                     • Level 3: SPENDING GUIDANCE / CATCH-UP
                     • Level 4: TEMPORARY RELIEF
                     • Level 5: FORMAL RESTRUCTURING
                     • Level 6: HUMAN ESCALATION
                                    │
                                    ▼
                    [ Deterministic Safety Filter ]
                    • SC-001: Safe EMI Capacity Constraint
                    • SC-002: Protected Living Cost Floor
                    • SC-003: DTI Consolidation Ceiling (65%)
                    • SC-004: Anti-Predatory Borrowing Guard
                    • SC-005: Emergency Buffer Preservation
                    • SC-006: High-Impact Human Approval
                    • SC-007: Customer Informed Consent
                    • SC-008: Irreversibility Protection
                                    │
                                    ▼
                    [ Final Structured Decision & Tier ]
                    • Tier A: Automated Post-Consent
                    • Tier B: Human Officer Authorization
                    • Tier C: Human Specialist Only
```

---

## 📐 3. Mathematical Capacity Formulas
The repayment capacity engine is **100% deterministic arithmetic** without black-box ML:

$$\text{Living Cost Floor} = \max(\text{Average Essential Expenses}, \text{Average Income} \times 0.40)$$

$$\text{Safe Disposable Income} = \max(0, \text{Average Income} - \text{Living Cost Floor})$$

$$\text{Emergency Buffer Requirement} = \text{Living Cost Floor} \times 1.0$$

$$\text{Safe Maximum EMI} = \min(\text{Safe Disposable Income} \times 0.85, \text{Average Income} \times 0.50)$$

$$\text{EMI Gap} = \text{Current Monthly Obligations} - \text{Safe EMI}$$

$$\text{Liquid Buffer Months} = \frac{\text{Current Savings}}{\max(1.0, \text{Living Cost Floor})}$$

$$\text{Debt-to-Income (DTI)} = \frac{\text{Current Obligations}}{\max(1.0, \text{Average Income})}$$

---

## 🚦 4. Multi-Factor Severity Classification
Severity is determined by combining objective financial health metrics:
- **DTI Ratios:** $> 45\%$ (Moderate), $> 60\%$ (High), $> 75\%$ (Critical)
- **Cash Deficit:** Affordability status in `DEFICIT` or `CRITICAL_DEFICIT`
- **Liquid Buffer:** $< 1.0\text{ month}$ (Moderate/High), $< 0.25\text{ months}$ (Critical)
- **Payment Behavior:** Consecutive overdrafts or multi-month payment delays
- **Root Cause:** Compounding `DEBT_OVERLOAD` or chronic `STRUCTURAL_DISTRESS`

---

## 🧱 5. The 7-Level Intervention Ladder
Interventions are ranked strictly by **least intrusiveness, high reversibility, and affordability**:
1. **Level 0 (MONITOR):** Zero-friction telemetry tracking.
2. **Level 1 (INFORM):** Diagnostic summaries, proactive budget alerts, resource links.
3. **Level 2 (TIMING FIX):** Shift EMI due date to post-salary date (eliminates overdrafts permanently).
4. **Level 3 (SPENDING GUIDANCE / CATCH-UP):** Discretionary budget optimization and credit line pause.
5. **Level 4 (TEMPORARY RELIEF):** 1–3 month EMI reduction or payment holiday to safe floor.
6. **Level 5 (FORMAL RESTRUCTURING):** Tenor extension or eligible consolidation.
7. **Level 6 (HUMAN ESCALATION):** Senior Hardship Officer assignment for complex/vulnerable cases.

---

## 🛡️ 6. Deterministic Safety Filter (Rules SC-001 to SC-008)
Every generated candidate MUST pass all 8 safety rules:
- **SC-001 (Safe EMI Constraint):** Post-intervention EMI must not exceed `safe_emi`.
- **SC-002 (Living Floor Protection):** Essential living floor cannot be compromised.
- **SC-003 (DTI Consolidation Ceiling):** Debt consolidation is **REJECTED** if DTI $> 65\%$ or liquid savings $< 0.5$ months.
- **SC-004 (Anti-Predatory Guard):** No net-new debt extensions for over-leveraged borrowers.
- **SC-005 (Emergency Buffer Preservation):** Customer savings cannot be drawn below 1.0 month buffer.
- **SC-006 (Human Approval Mandate):** Level 3+ restructuring requires human officer authorization.
- **SC-007 (Informed Consent):** Non-informational changes require affirmative customer consent.
- **SC-008 (Irreversibility Protection):** Irreversible actions cannot be auto-executed.

---

## 🎚️ 7. Automation Boundaries & Governance Tiers
- **Tier A (Automate Post-Consent):** Low-risk, 100% reversible actions (e.g. salary date sync, grace periods).
- **Tier B (AI Prepares, Human Approves):** Moderate financial modifications (e.g. 3-month EMI reduction, tenor extension).
- **Tier C (Human Specialist Only):** Adverse actions, loan write-offs, legal escalation (AI strictly forbidden).

---

## ⚠️ 8. Scientific Limitations & Synthetic Data Disclosure
- **Synthetic Data Disclosure:** Validated on high-fidelity synthetic time-series data modeling 10,000 retail accounts. Not validated on proprietary live bank production data.
- **Decision Support:** FinShield acts as a clinical decision-support system for bank credit and hardship officers, not an autonomous lending authority.
