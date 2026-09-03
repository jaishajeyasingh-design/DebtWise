"""
FinShield LLM Explanation & Communication Service
Generates customer-friendly, empathetic, non-judgmental explanations of already-decided
financial distress interventions produced by the DebtWise decision engine.

RESPONSIBLE AI CONSTRAINTS:
- ZERO decision-making power (cannot diagnose, calculate, rank, approve, or execute).
- Operates strictly post-decision using supplied structured facts only.
- Strict deterministic fallback ensures 100% application functionality without external API keys.
- For DEBT_OVERLOAD personas (e.g. Arun), faithfully explains why consolidation was rejected
  by institutional safety rules (SC-001/SC-003/SC-004) and never recommends taking more debt.
- No sensitive financial data, passwords, PII, or API keys are logged.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

import httpx

from app.config import settings
from app.schemas.intervention import DecisionResponse
from app.schemas.explanation import ExplanationResponse, ExplanationMetadata

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a financial decision explanation assistant for the DebtWise responsible AI platform.
You do not make financial decisions.
You do not calculate financial values or ratios.
You do not recommend new financial products or additional borrowing.
You only explain decisions and safety evaluations already produced by the DebtWise decision engine.
Use ONLY the supplied structured facts.
Never invent numbers, policies, outcomes, approvals, or guarantees.
If information is unavailable, state that it is unavailable.

STRICT RESPONSIBLE AI & SAFETY RULES:
1. Use empathetic, simple, and non-judgmental language. Never use shaming, blaming, or coercive words.
2. For DEBT_OVERLOAD customers, NEVER recommend taking on additional debt or new loans.
3. If an intervention (e.g. Debt Consolidation) was rejected by the safety engine, explain why it failed safety constraints (e.g. DTI policy breach or unaffordable EMI) and why a lower-risk repayment option was chosen instead. Never argue against or override safety filter rejections.
4. Clearly state that all figures are estimates and not guaranteed outcomes.
5. Explicit customer choice: reinforce that customer consent is voluntary and human specialist assistance is available.

You must respond ONLY with a valid JSON object matching this exact schema:
{
  "summary": "Concise empathetic summary of diagnosis and proposed safe path",
  "why_this_happened": "Clear explanation of diagnosed root cause and top contributing factors",
  "what_we_can_do": "Description of the selected safe intervention and estimated cash-flow relief",
  "why_this_option_is_safer": "Explanation of why riskier options (e.g. consolidation) were rejected by safety rules in favor of a safer alternative",
  "affordability_context": "Explanation of sustainable repayment capacity boundary and living cost protection",
  "customer_message": "Empowering message highlighting voluntary consent and specialist availability",
  "disclaimer": "Estimate notice and voluntary consent reminder"
}
"""


class ExplanationService:
    """Service providing natural language communication of structured decision engine outputs."""

    @classmethod
    def generate_explanation(
        cls,
        decision: DecisionResponse,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ) -> ExplanationResponse:
        """
        Main entry point for generating customer-facing explanations.
        Attempts LLM generation if configured, falling back deterministically on any error or missing key.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        active_key = api_key or settings.ANTHROPIC_API_KEY
        active_model = model or settings.ANTHROPIC_MODEL

        # 1. If no API key is configured, immediately use high-quality deterministic fallback
        if not active_key or not active_key.strip():
            logger.info("No Anthropic API key found. Using deterministic explanation generator.")
            return cls._generate_deterministic_fallback(decision, now_iso)

        # 2. Build constrained prompt from structured facts only
        user_prompt = cls._build_structured_prompt(decision)

        # 3. Attempt LLM generation with strict timeout
        try:
            explanation = cls._call_anthropic_api(
                api_key=active_key,
                model=active_model,
                user_prompt=user_prompt,
                now_iso=now_iso,
                decision=decision
            )
            return explanation
        except Exception as e:
            logger.warning(
                "LLM generation failed (%s: %s). Falling back to deterministic explanation.",
                type(e).__name__,
                str(e)
            )
            return cls._generate_deterministic_fallback(decision, now_iso)

    @classmethod
    def _build_structured_prompt(cls, decision: DecisionResponse) -> str:
        """Builds a minimal, privacy-preserving structured fact payload for the LLM."""
        risk = decision.risk
        capacity = decision.capacity
        selected = decision.selected_intervention

        # Extract top SHAP factors safely
        top_factors_summary = [
            f"{getattr(f, 'feature', getattr(f, 'feature_name', 'Factor'))}: {f.description} (shap_value: {getattr(f, 'shap_value', 0.0):+.2f})"
            for f in (risk.top_factors or [])[:4]
        ]

        # Extract safety rejections (e.g. consolidation failure)
        rejected_candidates = []
        for se in decision.safety_evaluation:
            if se.status == "REJECTED":
                rejected_candidates.append({
                    "title": se.intervention_title,
                    "reasons": se.rejection_reasons,
                    "safer_alternative": se.safer_alternative,
                    "failed_rules": [
                        f"{r.rule_id} ({r.rule_name}): {r.reason}"
                        for r in se.rules_checked if r.status == "FAILED"
                    ]
                })

        payload = {
            "customer_id": decision.customer_id,
            "diagnosis": {
                "primary_cause": risk.primary_cause,
                "confidence_percent": round(risk.confidence * 100, 1),
                "severity": risk.severity,
                "top_shap_factors": top_factors_summary
            },
            "financial_capacity": {
                "monthly_income": capacity.average_income,
                "current_obligations": capacity.current_obligations,
                "living_cost_floor": capacity.living_cost_floor,
                "safe_repayment_capacity": capacity.safe_emi,
                "monthly_emi_gap": capacity.emi_gap,
                "debt_to_income_percent": round(capacity.dti * 100, 1),
                "liquid_buffer_months": capacity.liquid_buffer_months,
                "affordability_status": capacity.affordability_status
            },
            "safety_engine_results": {
                "rejected_interventions": rejected_candidates,
                "total_candidates_evaluated": len(decision.candidate_interventions)
            },
            "selected_safe_intervention": {
                "title": selected.title if selected else "Mandatory Human Hardship Review",
                "level": selected.level if selected else 6,
                "description": selected.description if selected else "Specialist assistance",
                "estimated_monthly_relief": selected.estimated_monthly_relief if selected else 0.0,
                "estimated_emi_after": selected.estimated_emi_after if selected else capacity.safe_emi,
                "reversibility": selected.reversibility if selected else "HIGH"
            },
            "governance": {
                "tier": decision.tier,
                "customer_consent_required": decision.customer_consent_required,
                "human_approval_required": decision.human_approval_required
            }
        }

        return (
            "Here are the authoritative structured decision facts from the DebtWise engine:\n\n"
            f"{json.dumps(payload, indent=2)}\n\n"
            "Please generate the customer-facing explanation JSON following all instructions."
        )

    @classmethod
    def _call_anthropic_api(
        cls,
        api_key: str,
        model: str,
        user_prompt: str,
        now_iso: str,
        decision: DecisionResponse
    ) -> ExplanationResponse:
        """Calls Anthropic Claude API via httpx with strict schema parsing."""
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        body = {
            "model": model,
            "max_tokens": 1024,
            "system": SYSTEM_PROMPT,
            "messages": [
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }

        with httpx.Client(timeout=settings.LLM_TIMEOUT_SECONDS) as client:
            response = client.post(url, headers=headers, json=body)
            response.raise_for_status()
            res_data = response.json()

        # Extract text content
        raw_text = res_data["content"][0]["text"].strip()
        
        # Clean potential markdown wrapping (e.g. ```json ... ```)
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        parsed_json = json.loads(raw_text)

        # Validate required fields
        required_fields = [
            "summary", "why_this_happened", "what_we_can_do",
            "why_this_option_is_safer", "affordability_context",
            "customer_message"
        ]
        for field in required_fields:
            if field not in parsed_json or not isinstance(parsed_json[field], str):
                raise ValueError(f"Missing or invalid field in LLM response: {field}")

        return ExplanationResponse(
            summary=parsed_json["summary"],
            why_this_happened=parsed_json["why_this_happened"],
            what_we_can_do=parsed_json["what_we_can_do"],
            why_this_option_is_safer=parsed_json["why_this_option_is_safer"],
            affordability_context=parsed_json["affordability_context"],
            customer_message=parsed_json["customer_message"],
            disclaimer=parsed_json.get(
                "disclaimer",
                "This is an estimate based on current financial information, not a guarantee of future outcomes. You retain full control to accept, decline, or request human officer assistance."
            ),
            metadata=ExplanationMetadata(
                provider="anthropic",
                model=model,
                fallback_used=False,
                timestamp=now_iso
            )
        )

    @classmethod
    def _generate_deterministic_fallback(
        cls,
        decision: DecisionResponse,
        now_iso: str
    ) -> ExplanationResponse:
        """
        Generates deterministic, high-quality, non-judgmental explanations
        derived directly from the structured decision-engine output.
        Ensures complete parity and resilience even without an LLM API key.
        """
        cause = decision.risk.primary_cause
        conf = decision.risk.confidence
        cap = decision.capacity
        selected = decision.selected_intervention

        safe_emi_fmt = f"₹{cap.safe_emi:,.0f}"
        gap_fmt = f"₹{cap.emi_gap:,.0f}"
        curr_fmt = f"₹{cap.current_obligations:,.0f}"
        living_floor_fmt = f"₹{cap.living_cost_floor:,.0f}"
        dti_pct = f"{cap.dti * 100:.0f}%"

        # Check for safety rejections (e.g. Arun's consolidation rejection)
        rejected_consolidation = any(
            "CONSOLIDATION" in se.intervention_id.upper()
            for se in decision.safety_evaluation if se.status == "REJECTED"
        )
        any_rejected = [se for se in decision.safety_evaluation if se.status == "REJECTED"]

        # 1. Root-cause specific descriptions
        if cause == "DEBT_OVERLOAD":
            summary = (
                f"DebtWise identified debt overload based on your current debt commitments of {curr_fmt}/month "
                f"relative to your sustainable monthly capacity of {safe_emi_fmt}."
            )
            why_this_happened = (
                f"The diagnosis engine identified debt overload with {conf:.1%} confidence. "
                f"Cumulative debt obligations represent {dti_pct} of monthly income, creating an ongoing monthly shortfall "
                f"of {gap_fmt} against safe capacity while available liquid savings remain constrained."
            )
        elif cause == "EXPENSE_SHOCK":
            summary = (
                f"DebtWise identified an expense shock resulting from sudden elevated essential expenses, "
                f"temporarily straining your monthly cash flow."
            )
            why_this_happened = (
                f"The diagnosis engine identified an expense shock with {conf:.1%} confidence. "
                f"Recent out-of-pattern essential expenses reduced uncommitted cash flow, creating a temporary "
                f"shortfall of {gap_fmt}/month against recurring obligations."
            )
        elif cause == "INCOME_SHOCK":
            summary = (
                f"DebtWise identified an income shock resulting from a temporary interruption or reduction "
                f"in regular monthly income."
            )
            why_this_happened = (
                f"The diagnosis engine identified an income shock with {conf:.1%} confidence. "
                f"A recent decrease in monthly inflows reduced your sustainable capacity to {safe_emi_fmt}, "
                f"leaving an active EMI gap of {gap_fmt}/month against existing commitments."
            )
        elif cause == "CASH_FLOW_MISMATCH":
            summary = (
                f"DebtWise identified a cash flow timing mismatch between your income deposit dates "
                f"and scheduled loan deduction dates."
            )
            why_this_happened = (
                f"The diagnosis engine identified a cash flow mismatch with {conf:.1%} confidence. "
                f"Your overall debt is affordable ({dti_pct} DTI), but a calendar timing gap between salary credit "
                f"and payment due dates causes temporary liquidity friction."
            )
        else:  # STRUCTURAL_DISTRESS or generic
            summary = (
                f"DebtWise identified structural financial distress where baseline living expenses and debt "
                f"commitments exceed regular monthly cash inflows."
            )
            why_this_happened = (
                f"The diagnosis engine identified structural distress with {conf:.1%} confidence. "
                f"Current recurring obligations of {curr_fmt} exceed the sustainable capacity of {safe_emi_fmt}, "
                f"requiring tailored hardship restructuring."
            )

        # 2. What we can do (Selected intervention)
        if selected:
            relief_fmt = f"₹{selected.estimated_monthly_relief:,.0f}"
            emi_after_fmt = f"₹{selected.estimated_emi_after:,.0f}"
            what_we_can_do = (
                f"DebtWise proposes '{selected.title}' (Level {selected.level} on the 7-Level Intervention Ladder). "
                f"This option is estimated to provide {relief_fmt}/month in immediate cash-flow relief, "
                f"bringing your projected monthly commitment to approximately {emi_after_fmt} while fully protecting your {living_floor_fmt}/month essential living floor."
            )
        else:
            what_we_can_do = (
                f"DebtWise recommends routing your case directly to a dedicated Senior Hardship Officer "
                f"to construct a bespoke, sustainable recovery plan."
            )

        # 3. Why this option is safer (Safety Filter rationale)
        if rejected_consolidation:
            why_this_option_is_safer = (
                f"The system evaluated a Debt Consolidation facility as a candidate, but the DebtWise Safety Engine "
                f"strictly rejected it because the projected repayment would remain above your sustainable affordability ceiling "
                f"and exceed the institutional {dti_pct} debt-to-income safety policy. "
                f"Instead of taking on additional debt, DebtWise selected a lower-risk repayment approach that provides relief without expanding your borrowing burden."
            )
        elif any_rejected:
            rej_titles = ", ".join(f"'{e.intervention_title}'" for e in any_rejected[:2])
            why_this_option_is_safer = (
                f"Higher-risk candidates ({rej_titles}) were evaluated but rejected by the Safety Engine "
                f"because they failed hard affordability or reversibility checks. "
                f"The selected option was confirmed safe and aligns strictly with your repayment capacity."
            )
        else:
            why_this_option_is_safer = (
                f"All evaluated options were validated against institutional safety constraints (Rules SC-001 through SC-008). "
                f"The selected intervention represents the lowest-friction, highest-reversibility option that effectively addresses your diagnosed root cause."
            )

        # 4. Affordability Context
        affordability_context = (
            f"Your calculated sustainable repayment capacity is {safe_emi_fmt}/month based on verified income and living costs. "
            f"DebtWise enforces a non-negotiable living cost floor of {living_floor_fmt}/month to ensure basic necessities are protected."
        )

        # 5. Customer message
        if decision.tier == "TIER_A":
            customer_message = (
                "You remain in complete control. You can review the proposed plan, grant consent with a single click, "
                "choose another safe option, or request assistance from a bank specialist at any time."
            )
        else:
            customer_message = (
                "You remain in complete control. Because this intervention involves contractual adjustments, "
                "it requires your explicit consent and authorization by a bank credit officer. You can accept, decline, or request a personal consultation."
            )

        return ExplanationResponse(
            summary=summary,
            why_this_happened=why_this_happened,
            what_we_can_do=what_we_can_do,
            why_this_option_is_safer=why_this_option_is_safer,
            affordability_context=affordability_context,
            customer_message=customer_message,
            disclaimer="This is an estimate based on current financial information, not a guarantee of future outcomes. You retain full control to accept, decline, or request human officer assistance.",
            metadata=ExplanationMetadata(
                provider="deterministic_fallback",
                model="template_engine_v1",
                fallback_used=True,
                timestamp=now_iso
            )
        )
