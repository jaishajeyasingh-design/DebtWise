"""
DebtWise Closed-Loop Recovery Engine
Performs deterministic forward simulation, post-intervention time-series projection,
second-pass XGBoost re-scoring, before-vs-after delta comparison, and automated adaptation triggers.

RESPONSIBLE AI CONSTRAINTS:
- Deterministic forward projection based purely on verified intervention parameters and scenario inputs.
- Zero invented loan products; rejected candidates (e.g. consolidation for Arun) are NEVER applied.
- Second-pass XGBoost inference re-extracts features and recomputes probabilities and SHAP attributions.
- Adaptation pathways are generated through the authoritative DecisionEngine with full safety checks.
- All projections and trajectories are explicitly labelled as simulation estimates.
"""
import copy
from typing import Dict, Any, List, Optional

from app.schemas.customer import CustomerInput
from app.schemas.diagnosis import DiagnosisResult
from app.schemas.intervention import DecisionResponse, InterventionCandidate
from app.schemas.recovery import (
    RecoverySimulationRequest,
    RecoverySimulationResponse,
    TrajectoryPoint,
    BeforeAfterDelta,
    RecoveryStatus
)
from app.services.decision_engine import DecisionEngine
from app.services.capacity_engine import CapacityEngine
from app.services.severity_engine import SeverityEngine
from finshield_ml.inference import predict_distress


class RecoveryEngine:
    """Engine orchestrating closed-loop recovery trajectory simulation and second-pass re-scoring."""

    @classmethod
    def simulate_recovery(cls, request: RecoverySimulationRequest) -> RecoverySimulationResponse:
        """
        Executes end-to-end closed-loop recovery simulation:
        1. Baseline analysis
        2. Intervention parameter extraction & safety validation
        3. Deterministic forward time-series projection
        4. Second-pass XGBoost re-scoring & SHAP attribution
        5. Before-vs-after delta calculation
        6. Recovery status evaluation
        7. Automated adaptation trigger if recovery is stalled/distressed
        """
        customer_input = request.customer_input
        horizon = request.horizon_months
        scenario = request.scenario

        # 1. Baseline Decision Engine Analysis (Authoritative baseline)
        baseline_decision: DecisionResponse = DecisionEngine.analyze_customer(customer_input)
        baseline_cap = baseline_decision.capacity
        baseline_risk = baseline_decision.risk

        # 2. Identify and Validate Selected Intervention
        selected_intervention: Optional[InterventionCandidate] = None
        if request.selected_intervention_id:
            # Look up candidate in evaluated candidates
            candidate = next(
                (c for c in baseline_decision.candidate_interventions if c.id == request.selected_intervention_id),
                None
            )
            if candidate is None:
                raise ValueError(
                    f"Intervention ID '{request.selected_intervention_id}' is not a valid candidate for customer '{customer_input.customer_id}'."
                )

            # Enforce Safety: Verify candidate was not rejected by safety filter
            safety_eval = next(
                (se for se in baseline_decision.safety_evaluation if se.intervention_id == candidate.id),
                None
            )
            if safety_eval and safety_eval.status == "REJECTED":
                raise ValueError(
                    f"Cannot simulate rejected intervention '{candidate.title}' (ID: {candidate.id}). "
                    f"The safety filter deterministically rejected it: {'; '.join(safety_eval.rejection_reasons)}"
                )
            selected_intervention = candidate

        if selected_intervention is None:
            selected_intervention = baseline_decision.selected_intervention

        if selected_intervention is None:
            raise ValueError(f"No valid safe intervention available to simulate for customer '{customer_input.customer_id}'.")

        # 3. Baseline Metrics Calculation
        curr_income = customer_input.income[-1]
        curr_essential = customer_input.essential_expenses[-1]
        curr_discretionary = customer_input.discretionary_expenses[-1] if customer_input.discretionary_expenses else 0.0
        curr_obligations = customer_input.obligations[-1]
        curr_debt = customer_input.total_debt[-1] if customer_input.total_debt else (curr_obligations * 12.0)
        curr_savings = customer_input.savings[-1] if customer_input.savings else (curr_income * 0.5)

        init_dti_pct = (curr_obligations / max(100.0, curr_income)) * 100.0
        init_buffer_ratio = curr_savings / max(100.0, curr_essential)
        has_initial_delays = any(d > 0 for d in (customer_input.payment_delays or []))
        initial_delay_penalty = 15.0 if has_initial_delays else 0.0

        # Deterministic Stress Index Formula (0-100%):
        # Weighted combination of DTI (55%), living buffer deficit (35%), and payment friction penalty
        init_stress = min(99.0, max(5.0, round(
            (init_dti_pct * 0.55) + (max(0.0, 1.0 - min(1.0, init_buffer_ratio)) * 35.0) + initial_delay_penalty,
            1
        )))

        # Trajectory Milestone 0 (Current Baseline)
        trajectory: List[TrajectoryPoint] = [
            TrajectoryPoint(
                month="Current (M0)",
                month_index=0,
                stress_index=init_stress,
                savings_balance=round(curr_savings, 2),
                scheduled_emi=round(curr_obligations, 2),
                dti_percent=round(init_dti_pct, 1),
                status_label="Baseline Assessment"
            )
        ]

        # 4. Deterministic Forward Month-by-Month Projection
        proj_income_list: List[float] = []
        proj_essential_list: List[float] = []
        proj_discretionary_list: List[float] = []
        proj_obligations_list: List[float] = []
        proj_debt_list: List[float] = []
        proj_savings_list: List[float] = []
        proj_credit_list: List[float] = []
        proj_delays_list: List[int] = []
        proj_overdraft_list: List[int] = []
        proj_min_pay_list: List[int] = []

        running_savings = curr_savings
        running_debt = curr_debt
        running_credit = customer_input.credit_balance[-1] if customer_input.credit_balance else 0.0
        running_salary_day = customer_input.salary_day
        running_emi_due_day = customer_input.emi_due_day

        relief_amount = selected_intervention.estimated_monthly_relief
        emi_after_target = selected_intervention.estimated_emi_after

        # Timing sync resolution (Level 2)
        if "SYNC" in selected_intervention.intervention_type.upper() or "DATE" in selected_intervention.intervention_type.upper() or selected_intervention.level == 2:
            running_emi_due_day = min(30, running_salary_day + 3)

        shock_month = max(2, (horizon // 2) + 1)

        for m in range(1, horizon + 1):
            if scenario == "ADHERENT_RECOVERY":
                m_income = curr_income
                # For acute expense shock: medical/emergency expenses gradually subside back to normal
                if baseline_risk.primary_cause == "EXPENSE_SHOCK" and len(customer_input.essential_expenses) >= 6:
                    normal_essential = sum(customer_input.essential_expenses[:6]) / 6.0
                    m_essential = normal_essential + (curr_essential - normal_essential) * max(0.0, 1.0 - (m * 0.25))
                else:
                    m_essential = curr_essential

                m_discretionary = max(0.0, curr_discretionary * 0.80)

                # For temporary 3-month relief (Level 4):
                if selected_intervention.level == 4 and m > 3:
                    # Transition back smoothly toward baseline or sustainable capacity
                    m_obligation = min(curr_obligations, baseline_cap.safe_emi * 1.05)
                else:
                    m_obligation = emi_after_target

                m_delay = 0
                m_overdraft = 0
                m_min_pay = 0

                # Monthly surplus accumulation
                net_cash_flow = m_income - (m_essential + m_discretionary + m_obligation)
                if net_cash_flow > 0:
                    running_savings += net_cash_flow
                    running_credit = max(0.0, running_credit - (net_cash_flow * 0.20))
                running_debt = max(0.0, running_debt - (m_obligation * 0.50))

                status_label = "Relief Active" if m <= 3 else ("Buffer Rebuilding" if m <= 5 else "Stabilized")

            elif scenario == "STAGNANT_DEFICIT":
                # Stagnant scenario: persistent elevated essential expenses and partial payment friction
                m_income = curr_income
                m_essential = curr_essential * 1.12
                m_discretionary = curr_discretionary
                m_obligation = max(emi_after_target, curr_obligations * 0.85)

                m_delay = 1 if (m % 2 == 0) else 0
                m_overdraft = 1 if (m % 2 == 1) else 0
                m_min_pay = 1

                net_cash_flow = m_income - (m_essential + m_discretionary + m_obligation)
                if net_cash_flow > 0:
                    running_savings += net_cash_flow * 0.3
                else:
                    running_savings = max(1000.0, running_savings + net_cash_flow)

                status_label = "Deficit Stagnant" if m <= 3 else "Persistent Pressure"

            else:  # SECONDARY_SHOCK
                if m < shock_month:
                    m_income = curr_income
                    m_essential = curr_essential
                    m_discretionary = curr_discretionary * 0.80
                    m_obligation = emi_after_target
                    m_delay = 0
                    m_overdraft = 0
                    m_min_pay = 0
                    net_cash_flow = m_income - (m_essential + m_discretionary + m_obligation)
                    if net_cash_flow > 0:
                        running_savings += net_cash_flow
                    status_label = "Initial Stabilization"
                else:
                    # Deterministic secondary medical/income shock
                    m_income = curr_income * 0.70  # 30% sudden income drop
                    m_essential = curr_essential * 1.35  # 35% unexpected emergency expenses
                    m_discretionary = curr_discretionary * 0.30
                    m_obligation = emi_after_target
                    m_delay = 1
                    m_overdraft = 2
                    m_min_pay = 1

                    running_savings = max(500.0, running_savings * 0.30)
                    running_credit += 25000.0
                    status_label = "Secondary Shock Triggered" if m == shock_month else "Acute Secondary Distress"

            # Month milestone metrics
            m_dti_pct = (m_obligation / max(100.0, m_income)) * 100.0
            m_buffer_ratio = running_savings / max(100.0, m_essential)
            m_delay_penalty = 20.0 if m_delay > 0 else 0.0
            m_stress = min(99.0, max(5.0, round(
                (m_dti_pct * 0.55) + (max(0.0, 1.0 - min(1.0, m_buffer_ratio)) * 35.0) + m_delay_penalty,
                1
            )))

            proj_income_list.append(round(m_income, 2))
            proj_essential_list.append(round(m_essential, 2))
            proj_discretionary_list.append(round(m_discretionary, 2))
            proj_obligations_list.append(round(m_obligation, 2))
            proj_debt_list.append(round(running_debt, 2))
            proj_savings_list.append(round(running_savings, 2))
            proj_credit_list.append(round(running_credit, 2))
            proj_delays_list.append(m_delay)
            proj_overdraft_list.append(m_overdraft)
            proj_min_pay_list.append(m_min_pay)

            trajectory.append(
                TrajectoryPoint(
                    month=f"Month {m}",
                    month_index=m,
                    stress_index=m_stress,
                    savings_balance=round(running_savings, 2),
                    scheduled_emi=round(m_obligation, 2),
                    dti_percent=round(m_dti_pct, 1),
                    status_label=status_label
                )
            )

        # 5. Build Projected 12-Month CustomerInput Rolling Series
        projected_customer_input = CustomerInput(
            customer_id=customer_input.customer_id,
            name=customer_input.name,
            age=customer_input.age,
            salary_day=running_salary_day,
            emi_due_day=running_emi_due_day,
            credit_limit=customer_input.credit_limit,
            income=(customer_input.income + proj_income_list)[-12:],
            essential_expenses=(customer_input.essential_expenses + proj_essential_list)[-12:],
            discretionary_expenses=((customer_input.discretionary_expenses or [0.0] * 12) + proj_discretionary_list)[-12:],
            obligations=(customer_input.obligations + proj_obligations_list)[-12:],
            total_debt=((customer_input.total_debt or [curr_debt] * 12) + proj_debt_list)[-12:],
            savings=((customer_input.savings or [curr_savings] * 12) + proj_savings_list)[-12:],
            credit_balance=((customer_input.credit_balance or [running_credit] * 12) + proj_credit_list)[-12:],
            payment_delays=((customer_input.payment_delays or [0] * 12) + proj_delays_list)[-12:],
            overdraft_count=((customer_input.overdraft_count or [0] * 12) + proj_overdraft_list)[-12:],
            min_payment_flag=((customer_input.min_payment_flag or [0] * 12) + proj_min_pay_list)[-12:]
        )

        # 6. Second-Pass XGBoost Re-Scoring & SHAP
        post_pred = predict_distress(projected_customer_input.to_dict())
        post_diag_cause = post_pred["primary_cause"]
        post_confidence = post_pred["confidence"]

        # Recalculate deterministic capacity & severity on projected state
        post_cap = CapacityEngine.calculate_capacity(projected_customer_input)
        post_diag_obj = DiagnosisResult(
            customer_id=projected_customer_input.customer_id,
            primary_cause=post_diag_cause,
            confidence=post_confidence,
            probabilities=post_pred["probabilities"],
            top_shap_factors=post_pred["top_shap_factors"],
            engineered_features=post_pred["engineered_features"]
        )
        post_sev = SeverityEngine.evaluate_severity(projected_customer_input, post_cap, post_diag_obj)

        # 7. Before-vs-After Delta Comparison
        final_point = trajectory[-1]
        stress_reduction = round(((init_stress - final_point.stress_index) / max(1.0, init_stress)) * 100.0, 1)
        savings_growth = round(running_savings - curr_savings, 2)

        delta = BeforeAfterDelta(
            baseline_diagnosis=baseline_risk.primary_cause,
            baseline_confidence=round(baseline_risk.confidence, 4),
            baseline_severity=baseline_risk.severity,
            baseline_stress_index=init_stress,
            baseline_dti_percent=round(init_dti_pct, 1),
            baseline_savings=round(curr_savings, 2),
            baseline_obligations=round(curr_obligations, 2),
            post_intervention_diagnosis=post_diag_cause,
            post_intervention_confidence=round(post_confidence, 4),
            post_intervention_severity=post_sev.severity,
            post_intervention_stress_index=final_point.stress_index,
            post_intervention_dti_percent=round(post_cap.dti * 100.0, 1),
            post_intervention_savings=round(running_savings, 2),
            post_intervention_obligations=round(projected_customer_input.obligations[-1], 2),
            stress_reduction_percent=stress_reduction,
            savings_growth_amount=savings_growth,
            monthly_relief_amount=round(relief_amount, 2)
        )

        # 8. Recovery Status Determination (Transparent Threshold Rules)
        recovery_status: RecoveryStatus
        if scenario == "SECONDARY_SHOCK" or post_cap.affordability_status in ("DEFICIT", "CRITICAL_DEFICIT") or final_point.stress_index >= 65.0:
            recovery_status = "PERSISTENT_DISTRESS"
        elif stress_reduction >= 40.0 and final_point.stress_index <= 35.0 and post_cap.liquid_buffer_months >= 0.7:
            recovery_status = "RECOVERED"
        elif stress_reduction >= 25.0:
            recovery_status = "SIGNIFICANT_IMPROVEMENT"
        elif stress_reduction >= 10.0:
            recovery_status = "MODERATE_IMPROVEMENT"
        else:
            recovery_status = "STAGNANT"

        # 9. Automated Adaptation Trigger
        is_adaptation_required = (
            recovery_status in ("STAGNANT", "PERSISTENT_DISTRESS") or
            scenario == "SECONDARY_SHOCK"
        )

        adapted_decision: Optional[DecisionResponse] = None
        if is_adaptation_required:
            # Re-evaluate the entire decision engine pipeline on the projected state
            adapted_decision = DecisionEngine.analyze_customer(projected_customer_input)

        # 10. Generate Transparent Narrative Summary
        narrative_summary = cls._generate_narrative(
            customer_name=customer_input.name or "Customer",
            intervention=selected_intervention,
            scenario=scenario,
            delta=delta,
            status=recovery_status,
            adapted=adapted_decision
        )

        return RecoverySimulationResponse(
            customer_id=customer_input.customer_id,
            scenario=scenario,
            horizon_months=horizon,
            selected_intervention_id=selected_intervention.id,
            selected_intervention_title=selected_intervention.title,
            delta=delta,
            recovery_status=recovery_status,
            trajectory=trajectory,
            is_adaptation_required=is_adaptation_required,
            adapted_decision=adapted_decision,
            narrative_summary=narrative_summary,
            disclaimer="SIMULATED ESTIMATE — NOT A GUARANTEED OUTCOME. Projections are rule-based feasibility estimates, not causal guarantees."
        )

    @staticmethod
    def _generate_narrative(
        customer_name: str,
        intervention: InterventionCandidate,
        scenario: str,
        delta: BeforeAfterDelta,
        status: str,
        adapted: Optional[DecisionResponse]
    ) -> str:
        """Constructs a deterministic plain-English narrative of the simulation outcome."""
        if status == "RECOVERED":
            return (
                f"Under the {scenario.replace('_', ' ').title()} scenario, implementing '{intervention.title}' "
                f"projects a significant recovery trajectory over the simulated horizon. "
                f"Projected financial stress decreased from {delta.baseline_stress_index:.0f}% to {delta.post_intervention_stress_index:.0f}% "
                f"({delta.stress_reduction_percent:+.0f}% reduction), while liquid savings rebuilt by +₹{delta.savings_growth_amount:,.0f}. "
                f"Second-pass XGBoost re-scoring indicates substantial stabilization of monthly cash flow."
            )
        elif status in ("SIGNIFICANT_IMPROVEMENT", "MODERATE_IMPROVEMENT"):
            return (
                f"Implementing '{intervention.title}' projects steady financial stabilization. "
                f"Monthly obligations drop to ₹{delta.post_intervention_obligations:,.0f} (DTI: {delta.post_intervention_dti_percent:.0f}%), "
                f"releasing ₹{delta.monthly_relief_amount:,.0f}/month in cash-flow relief. Stress reduced by {delta.stress_reduction_percent:+.0f}%."
            )
        else:  # STAGNANT or PERSISTENT_DISTRESS
            adapted_title = adapted.selected_intervention.title if (adapted and adapted.selected_intervention) else "Senior Hardship Specialist Review"
            return (
                f"Under the {scenario.replace('_', ' ').title()} scenario, simulation indicates that financial recovery has stalled "
                f"or encountered a secondary shock (Projected Stress: {delta.post_intervention_stress_index:.0f}%). "
                f"Because distress persists, DebtWise automatically triggered an adapted recovery pathway: proposing '{adapted_title}' under Governance Tier {adapted.tier if adapted else 'TIER_C'}."
            )
