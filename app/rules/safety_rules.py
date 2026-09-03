"""
FinShield Deterministic Safety Rules Definition
Provides canonical rule definitions, error codes, severity levels, and validation logic.
These rules are non-negotiable and strictly guard against predatory or unaffordable financial actions.
"""
from typing import Dict, Any, List

SAFETY_RULE_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "SC-001": {
        "rule_id": "SC-001",
        "name": "Safe EMI Capacity Constraint",
        "description": "Post-intervention monthly EMI commitment must never exceed the calculated safe repayment capacity (safe_emi).",
        "severity": "CRITICAL"
    },
    "SC-002": {
        "rule_id": "SC-002",
        "name": "Protected Living Cost Floor",
        "description": "Interventions must not assume living expenses below the institutional living-cost floor (40% of income baseline).",
        "severity": "CRITICAL"
    },
    "SC-003": {
        "rule_id": "SC-003",
        "name": "DTI Debt Consolidation Ceiling",
        "description": "Debt consolidation facilities are strictly rejected if customer Debt-to-Income (DTI) ratio exceeds 65% or liquid buffer is under 0.5 months.",
        "severity": "HIGH"
    },
    "SC-004": {
        "rule_id": "SC-004",
        "name": "Anti-Predatory Borrowing Guard",
        "description": "Reject any proposal that involves issuing additional debt when customer is in active DEBT_OVERLOAD or severe distress.",
        "severity": "CRITICAL"
    },
    "SC-005": {
        "rule_id": "SC-005",
        "name": "Emergency Buffer Preservation",
        "description": "Interventions must not require draining customer liquid emergency savings below 1.0 month of living expenses.",
        "severity": "HIGH"
    },
    "SC-006": {
        "rule_id": "SC-006",
        "name": "High-Impact Restructuring Approval",
        "description": "Level 3+ (Tier B/C) financial restructurings require mandatory Human Officer authorization before binding commitment.",
        "severity": "HIGH"
    },
    "SC-007": {
        "rule_id": "SC-007",
        "name": "Customer Informed Consent Mandate",
        "description": "All non-informational interventions (Level 2+) legally require verified, affirmative customer consent.",
        "severity": "CRITICAL"
    },
    "SC-008": {
        "rule_id": "SC-008",
        "name": "Irreversibility Protection",
        "description": "Irreversible financial changes or adverse legal/bureau filings are strictly prohibited from algorithmic auto-execution.",
        "severity": "CRITICAL"
    }
}
