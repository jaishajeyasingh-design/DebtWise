"""
Intervention, Safety Evaluation, Severity, Governance Gates & Audit Schemas
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from app.schemas.capacity import RepaymentCapacityResult
from app.schemas.diagnosis import DiagnosisResult, ShapFactor


class InterventionCandidate(BaseModel):
    id: str = Field(..., description="Unique intervention template identifier")
    level: int = Field(..., ge=0, le=6, description="Intervention ladder level (0 to 6)")
    name: str = Field(..., description="Human readable intervention name")
    intervention_type: str = Field(..., description="Machine readable intervention category code")
    title: str = Field(..., description="Display title for customer and banker")
    description: str = Field(..., description="Detailed description of what the intervention entails")
    reason: str = Field(..., description="Why this candidate addresses the diagnosed root cause")
    estimated_monthly_relief: float = Field(default=0.0, description="Estimated monthly cash-flow relief (₹)")
    estimated_emi_after: float = Field(default=0.0, description="Projected monthly EMI obligation post-intervention (₹)")
    reversibility: str = Field(..., description="Reversibility rating: HIGH | MEDIUM | LOW | IRREVERSIBLE")
    intrusiveness: str = Field(..., description="Intrusiveness level: MINIMAL | LOW | MODERATE | SIGNIFICANT | SEVERE")
    friction: str = Field(..., description="Customer friction level: ZERO | LOW | MEDIUM | HIGH")
    requires_human_approval: bool = Field(..., description="True if Tier B/C requires officer authorization")
    requires_customer_consent: bool = Field(..., description="True if customer affirmative consent is mandatory")
    priority: int = Field(default=1, description="Ranking priority order (lower = more preferred)")


class SafetyRuleCheck(BaseModel):
    rule_id: str = Field(..., description="Safety rule identifier (e.g. SC-001)")
    rule_name: str = Field(..., description="Name of the safety rule")
    status: str = Field(..., description="Rule validation outcome: PASSED | FAILED")
    severity: str = Field(..., description="Rule criticality: CRITICAL | HIGH | MEDIUM")
    reason: str = Field(..., description="Detailed deterministic rationale for pass or failure")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Quantified metrics evaluated by the rule")


class SafetyEvaluationResult(BaseModel):
    intervention_id: str = Field(..., description="Evaluated intervention candidate ID")
    intervention_title: str = Field(..., description="Title of candidate")
    status: str = Field(..., description="Overall safety status: APPROVED | REJECTED")
    rules_checked: List[SafetyRuleCheck] = Field(..., description="Audit of all individual safety rules evaluated")
    rejection_reasons: List[str] = Field(default_factory=list, description="List of reasons if candidate was rejected")
    safer_alternative: Optional[str] = Field(default=None, description="Recommended safer alternative if rejected")


class SeverityResult(BaseModel):
    severity: str = Field(..., description="Severity level: LOW | MODERATE | HIGH | CRITICAL")
    reasons: List[str] = Field(default_factory=list, description="Deterministic factors determining severity")
    indicators: Dict[str, Any] = Field(default_factory=dict, description="Quantified thresholds and metrics")


class RiskProfile(BaseModel):
    primary_cause: str = Field(..., description="Predicted primary distress cause")
    confidence: float = Field(..., description="ML classification confidence")
    severity: str = Field(..., description="Deterministic severity classification")
    severity_reasons: List[str] = Field(default_factory=list, description="Reasons for severity rating")
    top_factors: List[ShapFactor] = Field(default_factory=list, description="Top SHAP feature attributions")
    probabilities: Dict[str, float] = Field(default_factory=dict, description="Class probabilities")


class ConsentGate(BaseModel):
    consent_required: bool = Field(..., description="Whether customer consent is legally/contractually mandatory")
    consent_status: str = Field(
        default="PENDING_CUSTOMER_CONSENT",
        description="Consent state: NOT_REQUIRED | PENDING_CUSTOMER_CONSENT | CONSENT_GRANTED | CONSENT_REVOKED"
    )
    consent_channel: str = Field(default="DIGITAL_MOBILE_APP", description="Target capture channel")
    terms_summary: str = Field(..., description="Explicit plain-English terms presented to the customer")


class HumanApprovalGate(BaseModel):
    approval_required: bool = Field(..., description="Whether bank officer authorization is mandatory")
    approval_status: str = Field(
        default="PENDING_OFFICER_REVIEW",
        description="Officer approval state: NOT_REQUIRED | PENDING_OFFICER_REVIEW | OFFICER_APPROVED | OFFICER_REJECTED"
    )
    officer_role_required: str = Field(default="NOT_APPLICABLE", description="Role required for authorization")
    action_items: List[str] = Field(default_factory=list, description="Action items for reviewing officer")


class AuditRecord(BaseModel):
    audit_id: str = Field(..., description="Deterministic unique audit transaction ID")
    timestamp: str = Field(..., description="ISO 8601 audit timestamp")
    customer_id: str = Field(..., description="Customer ID")
    diagnosis_cause: str = Field(..., description="Diagnosed root cause")
    ml_confidence: float = Field(..., description="ML model confidence score")
    severity: str = Field(..., description="Calculated severity rating")
    capacity_summary: Dict[str, Any] = Field(..., description="Key capacity metrics snapshot")
    candidates_evaluated_count: int = Field(..., description="Total candidates generated")
    safety_rules_evaluated_count: int = Field(..., description="Total rule checks executed")
    rejected_candidates: List[Dict[str, Any]] = Field(default_factory=list, description="Candidates rejected by safety filter")
    selected_intervention_id: Optional[str] = Field(default=None, description="Selected intervention ID")
    tier: str = Field(..., description="Assigned governance tier")
    is_executable: bool = Field(..., description="Whether intervention is immediately executable without outstanding gates")
    execution_barrier: Optional[str] = Field(default=None, description="Reason why action cannot be auto-executed if blocked")


class DecisionResponse(BaseModel):
    customer_id: str = Field(..., description="Customer identifier")
    timestamp: str = Field(..., description="ISO 8601 evaluation timestamp")
    risk: RiskProfile = Field(..., description="Diagnosed risk and explainable severity profile")
    capacity: RepaymentCapacityResult = Field(..., description="Deterministic capacity calculations")
    candidate_interventions: List[InterventionCandidate] = Field(
        default_factory=list,
        description="All generated candidate interventions"
    )
    safety_evaluation: List[SafetyEvaluationResult] = Field(
        default_factory=list,
        description="Deterministic safety audit for each generated candidate"
    )
    selected_intervention: Optional[InterventionCandidate] = Field(
        default=None,
        description="Optimal approved safe intervention (lowest appropriate ladder level)"
    )
    tier: str = Field(..., description="Governance tier: TIER_A (Auto-Execute) | TIER_B (Officer Approval) | TIER_C (Human Only)")
    customer_consent_required: bool = Field(..., description="Whether affirmative customer consent is required")
    human_approval_required: bool = Field(..., description="Whether banker officer approval is required")
    consent_gate: ConsentGate = Field(..., description="Explicit customer consent gate and state")
    human_approval_gate: HumanApprovalGate = Field(..., description="Explicit human officer approval gate and state")
    is_executable: bool = Field(..., description="True only if all required consent and approval gates are cleared")
    explanation: str = Field(..., description="Clear, empathetic, plain-English summary of diagnosis and recommendation")
    next_steps: List[str] = Field(default_factory=list, description="Actionable checklist for customer and bank operations")
    audit_record: AuditRecord = Field(..., description="Immutable structured audit log record")
