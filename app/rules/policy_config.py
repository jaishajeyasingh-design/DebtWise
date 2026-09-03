"""
FinShield Centralized Bank Policy Configuration
Defines immutable institutional thresholds, living cost baselines, DTI limits, and autonomy tiers.
All decision engines and safety filters MUST reference this module — zero hardcoding elsewhere.
"""
from typing import List

# --- Living Cost & Emergency Buffer Policies ---
# Minimum fraction of income legally and ethically protected for essential living expenses
MIN_LIVING_COST_FLOOR_RATIO: float = 0.40

# Number of months of essential living costs to maintain as protected liquid emergency reserve
TARGET_EMERGENCY_BUFFER_MONTHS: float = 1.0

# Critical threshold below which liquid savings trigger severe vulnerability warnings
CRITICAL_EMERGENCY_BUFFER_MONTHS: float = 0.25

# Maximum assumed cut that can realistically be applied to discretionary spending
MAX_DISCRETIONARY_CUT_RATIO: float = 0.75


# --- Debt & Repayment Capacity Limits ---
# Safe maximum Debt-to-Income (DTI) ratio for routine loan commitments
MAX_SAFE_DTI_RATIO: float = 0.50

# Hard institutional ceiling for Debt Consolidation: strictly rejected if DTI > 65%
HARD_CONSOLIDATION_DTI_CEILING: float = 0.65

# Minimum liquid buffer (in months of essential costs) required before debt consolidation is permitted
MIN_SAVINGS_FOR_CONSOLIDATION_MONTHS: float = 0.50

# Fraction of safe disposable income that can be allocated to debt repayment (protecting remaining 15% for volatility)
SAFE_DISPOSABLE_CAPACITY_FACTOR: float = 0.85


# --- Severity Classification Thresholds ---
SEVERITY_DTI_MODERATE: float = 0.45
SEVERITY_DTI_HIGH: float = 0.60
SEVERITY_DTI_CRITICAL: float = 0.75

SEVERITY_BUFFER_LOW_MONTHS: float = 1.0
SEVERITY_BUFFER_CRITICAL_MONTHS: float = 0.20


# --- Governance & Automation Boundaries (Tiers A, B, C) ---
# Tier A: Low-risk, reversible actions that can be executed automatically upon explicit customer consent
TIER_A_AUTO_EXECUTE_LEVELS: List[int] = [0, 1, 2]

# Tier B: Moderate financial interventions prepared by AI that require Human Officer authorization + Customer consent
TIER_B_HUMAN_APPROVAL_LEVELS: List[int] = [3, 4, 5]

# Tier C: High-impact / vulnerable cases strictly reserved for Human Specialist intervention (AI forbidden from executing)
TIER_C_HUMAN_ONLY_LEVELS: List[int] = [6]
