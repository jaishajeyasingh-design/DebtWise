# FinShield — AI-Assisted Financial Distress Intervention Engine

> **Hackathon Presentation & Project Repository**  
> *"Moving banks from merely detecting high-risk customers to safely and sustainably resolving their distress."*

---

## 🎯 Executive Summary & One-Liner

**FinShield** is an AI-assisted financial distress intervention engine that helps banks bridge the critical gap between identifying high-risk customers and safely resolving their financial distress.

It diagnoses the root cause, estimates sustainable repayment capacity, generates and safety-filters intervention options, ranks suitable options, explains the reasoning with SHAP + LLM translation, obtains customer consent, automates only eligible low-risk actions, and continuously monitors recovery.

---

## 🚀 Key Deliverables in this Repository

| File | Description | How to Open / Run |
| :--- | :--- | :--- |
| **`FinShield_Hackathon_Pitch.pptx`** | **Native 16:9 Widescreen PowerPoint Deck** with fintech design, visual hierarchy ladders, cards, and embedded speaker notes on all 12 slides. | Open directly in Microsoft PowerPoint, Google Slides, or Apple Keynote. |
| **`index.html`** | **Ultra-Interactive Presentation Web App** with keyboard navigation, presenter notes drawer, slide grid overview, live SHAP explorer, and What-If simulator. | Open in any modern web browser (`Double-click` or run local dev server). |
| **`generate_deck.py`** | Python script powered by `python-pptx` to regenerate the `.pptx` deck programmatically. | `python generate_deck.py` |

---

## ⌨️ Interactive Web Deck Controls (`index.html`)

When presenting with `index.html`, use the following keyboard shortcuts:

* **`→` / `Space` / `PageDown`**: Next slide
* **`←` / `PageUp`**: Previous slide
* **`Home` / `End`**: Jump to First / Last slide
* **`P`**: Toggle **Speaker Notes Drawer**
* **`G`**: Toggle **Slide Overview Grid** (12-slide thumbnail selector)
* **`F`**: Toggle **Fullscreen Presentation Mode**
* **`T`**: Toggle **Dark / Light Fintech Theme**
* **`PDF Button` / `Ctrl + P`**: One-click **Export to 16:9 PDF** via print stylesheet

---

## 📑 12-Slide Pitch Deck Structure

### **Slide 1: Title — FinShield**
* **Category:** Hackathon Edition | Responsible AI in Fintech
* **Headline:** FinShield — AI-Assisted Financial Distress Intervention Engine
* **Core Mission:** Moving banks from passive risk detection to safe, personalized, and explainable distress resolution.
* **Trio Pillars:** Diagnose (XGBoost + SHAP) ➔ Calculate (Deterministic Capacity) ➔ Intervene (Safety-Filtered Ladder).

### **Slide 2: The Core Problem — Beyond Risk Detection**
* **The Industry Dilemma:** Risk scorecards predict probability of default (PD), but what happens *after* a borrower is flagged?
* **The Default Escalator:** Banks wait 60–90 days, charge punitive late fees (worsening cash shortages), and trigger aggressive debt collection.
* **The Missing Question:** *"How can a bank understand WHY a customer is struggling, determine what they can sustainably afford, choose the safest intervention, and act early enough to prevent default?"*

### **Slide 3: Strategic Positioning — "Diagnosis Before Treatment"**
* **What FinShield is NOT:** NOT a credit scorecard, NOT a generic chatbot, NOT a loan upseller, NOT a passive dashboard.
* **What FinShield IS:** A clinical diagnostic engine for financial health. It diagnoses specific distress mechanisms, calculates non-negotiable living cost floors, and applies self-rejecting safety filters.

### **Slide 4: The FinShield End-to-End Decision Flow**
* **6-Stage Closed Loop:**
  1. *Early Distress Trigger* (Transactional velocity & overdraft detection)
  2. *AI Root-Cause Diagnosis* (5 distress archetypes)
  3. *Sustainable Capacity Engine* (Deterministic living cost floors)
  4. *Eligibility & Safety Filter* (Prunes predatory options)
  5. *Explainability & Consent* (SHAP feature attribution + Claude LLM)
  6. *Safe Dual-Execution* (Tier A automation vs Tier B/C human approval)

### **Slide 5: Core AI & Decision Engine Stack**
* **XGBoost Distress Classifier:** Multi-class classification across 5 archetypes: *Income Shock*, *Debt Overload*, *Cash-Flow Mismatch*, *Expense Shock*, *Structural Distress*.
* **SHAP Explainability Layer:** Transparent local feature attributions (essential expense spikes, savings depletion rate, overdraft frequency).
* **Deterministic Capacity Engine:** $ \text{Capacity} = \text{Net Income} - \text{Essential Living Floor} - \text{Buffer} $. Zero black-box ML hallucinations.
* **Claude LLM Layer:** Translates technical SHAP vectors into empathetic, plain-English customer explanations (Zero financial approval power).

### **Slide 6: The 7-Level Intervention Ladder**
* **Ordered Strictly by Intrusiveness & Reversibility:**
  * **Level 0 — MONITOR:** Zero-friction telemetry tracking.
  * **Level 1 — INFORM:** Spending alerts, obligation calendar sync.
  * **Level 2 — TIMING FIX:** Shift EMI date to payroll deposit, autopay re-timing, overdraft fee relief (*100% Reversible*).
  * **Level 3 — REPAYMENT PLAN:** Structured 3–6 month catch-up schedule.
  * **Level 4 — TEMPORARY RELIEF:** 1–3 month EMI reduction or moratorium.
  * **Level 5 — FORMAL SUPPORT:** Loan tenor extension, contractual restructuring.
  * **Level 6 — HUMAN ESCALATION:** Hardship Officer review for complex/vulnerable borrowers.

### **Slide 7: Responsible AI & Strict Automation Boundaries**
* **Tier A (Automate Post-Consent):** Low-risk, reversible actions (due date sync, fee waivers within policy, spending insights).
* **Tier B (AI Prepares, Human Approves):** Moderate financial changes (temporary EMI reductions, moratorium packaging, hardship dossiers).
* **Tier C (Human Only — AI Strictly Forbidden):** Adverse credit bureau reporting, loan denials, legal enforcement, involuntary restructuring.

### **Slide 8: The WOW Demo — Self-Rejecting Safety Filter**
* **Scenario:** Debt-overloaded borrower evaluated by the generation engine.
* **Candidate Proposed:** Debt Consolidation Loan.
* **❌ Safety Rejection:** Violated Rule `SC-402` (DTI > 65%, Savings < 1 mo). Consolidation would increase lifetime interest by ₹84,000 without fixing the structural deficit.
* **✔ Safe Alternative Delivered:** Level 2 Timing Sync (1st ➔ 7th) + Level 4 Temporary EMI reduction (₹25k ➔ ₹15k floor) for 3 months. Zero additional debt taken.

### **Slide 9: Customer Experience Journey (Priya, Age 34)**
* **Persona:** ₹60,000/mo income, ₹25,000 EMI, recent medical expense shock.
* **10-Step Empathetic Journey:** Proactive non-threatening alert ➔ Transparent diagnostic breakdown ➔ Clear sustainable capacity (₹15,000) ➔ 3 tailored choices with trade-offs ➔ 1-click informed consent ➔ Continuous recovery tracking.

### **Slide 10: Bank Operations Console & What-If Simulator**
* **Portfolio Telemetry:** Distress queue grouping by root-cause archetype and automated vs officer review queues.
* **Interactive What-If Simulator:** Dynamic projection of sustainable capacity, monthly cash-flow buffer, and stress reduction.
* **Transparency Disclaimer:** *Simulated Estimate — Rule-based projection, not a guaranteed causal outcome.*

### **Slide 11: Technical Architecture & Dataset Transparency**
* **Tech Stack:** React 19 + TailwindCSS + Recharts (Frontend), FastAPI + Python 3.13 + Pydantic v2 (Backend), XGBoost + SHAP (ML/XAI), Claude 3.5 Sonnet (LLM), PostgreSQL (Audit Event Store).
* **Dataset Transparency:** Validated on an engineered synthetic dataset of 10,000 accounts across 5 distress archetypes. *We explicitly do not claim validation on live proprietary bank data.*

### **Slide 12: Qualitative Impact & The Paradigm Shift**
* **The Shift:**
  * *Traditional:* **Detect (Late) ➔ Collect (Aggressive) ➔ Escalate (Loss)**
  * *FinShield:* **Diagnose (Early) ➔ Intervene (Safely) ➔ Recover (Sustainable)**
* **Closing Vision:** *"AI doesn't replace human judgment. It makes responsible intervention faster, safer, and more personalized."*

---

## 🛠️ How to Regenerate the PowerPoint Presentation

If you modify the slide contents in `generate_deck.py`, run:

```bash
# Ensure python-pptx is installed
pip install python-pptx

# Run generator script
python generate_deck.py FinShield_Hackathon_Pitch.pptx
```

---

## 🛡️ Hackathon Pitching Tips

1. **Start with the Core Contrast (Slide 2 & 3):** Emphasize that banks already know who is risky. The real breakthrough is *responsible intervention*.
2. **Highlight the WOW Moment (Slide 8):** Walk judges through how the system actively rejects its own unsafe debt consolidation proposal.
3. **Emphasize Responsible AI (Slide 7):** Point out the Tier A / B / C automation boundaries hardcoded into the architecture.
4. **Use the Interactive Demos in `index.html`:** Toggle the SHAP scenario dropdown on Slide 5 and tweak the What-If sliders on Slide 10 during the live pitch!
