"""
Explanation Request and Response Schemas
Defines structured data contracts for post-decision LLM natural language explanation and communication.
"""
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from app.schemas.intervention import DecisionResponse


class ExplanationRequest(BaseModel):
    """
    Request model for generating plain-English natural language explanations.
    Accepts the authoritative structured decision response from the FinShield decision engine.
    """
    decision: DecisionResponse = Field(
        ...,
        description="Authoritative structured decision output produced by the decision engine"
    )


class ExplanationMetadata(BaseModel):
    """Metadata tracking generation details without storing PII or sensitive keys."""
    provider: str = Field(default="deterministic_fallback", description="LLM provider name or deterministic fallback")
    model: str = Field(default="template_engine_v1", description="Configured model identifier")
    fallback_used: bool = Field(default=True, description="True if deterministic fallback was utilized")
    timestamp: str = Field(..., description="ISO 8601 generation timestamp")


class ExplanationResponse(BaseModel):
    """
    Structured customer-friendly explanation and communication response.
    All fields are derived purely to explain existing deterministic + ML decisions.
    """
    summary: str = Field(
        ...,
        description="High-level plain-English narrative of the diagnosis and path forward"
    )
    why_this_happened: str = Field(
        ...,
        description="Empathetic root-cause explanation highlighting top contributing factors"
    )
    what_we_can_do: str = Field(
        ...,
        description="Plain-English description of the selected safe intervention and estimated relief"
    )
    why_this_option_is_safer: str = Field(
        ...,
        description="Transparent rationale for why unsafe options (e.g. consolidation) were rejected by safety rules"
    )
    affordability_context: str = Field(
        ...,
        description="Clear explanation of the customer's sustainable repayment capacity boundary"
    )
    customer_message: str = Field(
        ...,
        description="Respectful, empowering message reinforcing voluntary consent and human support options"
    )
    disclaimer: str = Field(
        default="This is an estimate based on current financial information, not a guarantee of future outcomes. You retain full control to accept, decline, or request human officer assistance.",
        description="Responsible AI transparency disclaimer"
    )
    metadata: ExplanationMetadata = Field(
        ...,
        description="Audit metadata indicating provider, model, and fallback status"
    )
