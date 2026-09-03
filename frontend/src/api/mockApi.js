const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const DEMO_NAMES = ["priya", "arun", "rahul", "meena"];

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let detail = `API request failed: ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // Keep default error.
    }
    throw new Error(detail);
  }

  return response.json();
}

function money(value) {
  return Number(value || 0);
}

function formatINR(value) {
  return `₹${Math.round(money(value)).toLocaleString("en-IN")}`;
}

function mapCandidate(candidate) {
  if (!candidate) return null;

  return {
    id: candidate.id,
    level: candidate.level,
    name: candidate.name,
    intervention_type: candidate.intervention_type,
    title: candidate.title,
    description: candidate.description,
    reason: candidate.reason,
    estimated_monthly_relief: money(candidate.estimated_monthly_relief),
    estimated_emi_after: money(candidate.estimated_emi_after),
    reversibility: candidate.reversibility,
    intrusiveness: candidate.intrusiveness,
    friction: candidate.friction,
    requires_human_approval: candidate.requires_human_approval,
    requires_customer_consent: candidate.requires_customer_consent,
    priority: candidate.priority,

    // UI-friendly aliases
    monthly_relief: money(candidate.estimated_monthly_relief),
    emi_after: money(candidate.estimated_emi_after),
    tier: candidate.requires_human_approval ? "TIER_B" : "TIER_A",
  };
}

function mapSafetyEvaluation(evaluation) {
  if (!evaluation) return null;

  return {
    intervention_id: evaluation.intervention_id,
    intervention_title: evaluation.intervention_title,
    status: evaluation.status,
    rules_checked: evaluation.rules_checked || [],
    rejection_reasons: evaluation.rejection_reasons || [],
    safer_alternative: evaluation.safer_alternative || null,
  };
}

function buildSafetyRejection(result) {
  const rejected = (result.safety_evaluation || []).filter(
    (item) => item.status === "REJECTED"
  );

  if (!rejected.length) {
    return null;
  }

  const first = rejected[0];

  return {
    intervention_id: first.intervention_id,
    intervention_title: first.intervention_title,
    status: first.status,
    rejection_reasons: first.rejection_reasons || [],
    safer_alternative: first.safer_alternative || null,

    // Existing UI expects a single readable message.
    message:
      first.rejection_reasons?.length > 0
        ? `Rejected by safety check — ${first.rejection_reasons.join(" ")}`
        : "Rejected by safety check because it did not satisfy DebtWise safety constraints.",

    rules_checked: first.rules_checked || [],
  };
}

function buildSafeInterventions(result) {
  return (result.candidate_interventions || [])
    .map(mapCandidate)
    .filter((candidate) => {
      const evaluation = (result.safety_evaluation || []).find(
        (item) => item.intervention_id === candidate.id
      );

      return evaluation?.status === "APPROVED";
    })
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.level - b.level;
    });
}

function buildAuditEvents(result) {
  const audit = result.audit_record;

  if (!audit) return [];

  return [
    {
      id: `${audit.audit_id}-diagnosis`,
      timestamp: audit.timestamp,
      type: "DIAGNOSIS",
      title: "Distress diagnosis completed",
      description: `${audit.diagnosis_cause.replaceAll(
        "_",
        " "
      )} identified with ${Math.round(audit.ml_confidence * 1000) / 10}% confidence.`,
      status: "completed",
    },
    {
      id: `${audit.audit_id}-capacity`,
      timestamp: audit.timestamp,
      type: "CAPACITY",
      title: "Repayment capacity calculated",
      description: `Safe EMI capacity: ${formatINR(
        audit.capacity_summary?.safe_emi
      )}/month.`,
      status: "completed",
    },
    {
      id: `${audit.audit_id}-safety`,
      timestamp: audit.timestamp,
      type: "SAFETY",
      title: "Safety checks completed",
      description: `${audit.safety_rules_evaluated_count} deterministic safety checks evaluated.`,
      status: "completed",
    },
    {
      id: `${audit.audit_id}-recommendation`,
      timestamp: audit.timestamp,
      type: "RECOMMENDATION",
      title: result.selected_intervention
        ? "Safe intervention selected"
        : "No intervention selected",
      description: result.selected_intervention
        ? result.selected_intervention.title
        : "No intervention passed the required safety and policy constraints.",
      status: "completed",
    },
    {
      id: `${audit.audit_id}-governance`,
      timestamp: audit.timestamp,
      type: "GOVERNANCE",
      title: "Governance gates applied",
      description:
        result.tier === "TIER_A"
          ? "Customer consent required before execution."
          : "Officer approval and/or customer consent required before execution.",
      status: result.is_executable ? "ready" : "pending",
    },
  ];
}

function buildRecoveryProjection(result) {
  const capacity = result.capacity;
  const selected = result.selected_intervention;

  const currentObligation = money(capacity?.current_obligations);
  const safeEmi = money(capacity?.safe_emi);
  const postIntervention = selected
    ? money(selected.estimated_emi_after)
    : safeEmi;

  return {
    current_monthly_obligation: currentObligation,
    sustainable_capacity: safeEmi,
    projected_monthly_obligation: postIntervention,
    monthly_relief: Math.max(0, currentObligation - postIntervention),

    disclaimer: "Simulated estimate — not a guaranteed outcome.",
  };
}

function mapAnalysisToCustomerDetail(rawCustomer, result, explanation = null) {
  const capacity = result.capacity;
  const risk = result.risk;
  const selected = mapCandidate(result.selected_intervention);

  const safeInterventions = buildSafeInterventions(result);
  const safetyRejection = buildSafetyRejection(result);

  return {
    ...rawCustomer,

    customer_id: result.customer_id || rawCustomer.customer_id,
    name: rawCustomer.name || rawCustomer.customer_name,

    current_monthly_income: money(capacity.average_income),
    current_obligations: money(capacity.current_obligations),

    diagnosis: {
      primary_cause: risk.primary_cause,
      confidence: risk.confidence,
      severity: risk.severity,
      severity_reasons: risk.severity_reasons || [],
      probabilities: risk.probabilities || {},
      top_factors: risk.top_factors || [],
      explanation: result.explanation,
    },

    capacity: {
      ...capacity,
      sustainable_repayment_capacity: money(capacity.safe_emi),
      monthly_deficit: Math.max(0, money(capacity.emi_gap)),
    },

    sustainable_repayment_capacity: money(capacity.safe_emi),

    safety_rejection: safetyRejection,

    safe_interventions: safeInterventions,

    selected_intervention: selected,

    recommendation: selected
      ? {
        title: selected.title,
        description: selected.description,
        reason: selected.reason,
        tier: result.tier,
        requires_customer_consent: result.customer_consent_required,
        requires_human_approval: result.human_approval_required,
      }
      : null,

    governance: {
      tier: result.tier,
      customer_consent_required: result.customer_consent_required,
      human_approval_required: result.human_approval_required,
      is_executable: result.is_executable,
      consent_gate: result.consent_gate,
      human_approval_gate: result.human_approval_gate,
    },

    audit_record: result.audit_record,
    audit_events: buildAuditEvents(result),

    recovery_projection: buildRecoveryProjection(result),

    next_steps: result.next_steps || [],

    // Natural Language Explanation & Communication Layer (Presentation Only)
    llm_explanation: explanation || null,

    // Keep the complete authoritative backend response unchanged.
    decision_response: result,
  };
}

async function explainDecision(decisionResponse) {
  try {
    return await request("/explain", {
      method: "POST",
      body: JSON.stringify(decisionResponse),
    });
  } catch (err) {
    console.warn("Could not fetch LLM explanation from backend, using presentation fallback:", err);
    return {
      summary: decisionResponse?.explanation || "DebtWise evaluated your financial profile and generated a safe recovery plan.",
      why_this_happened: `Identified ${(decisionResponse?.risk?.primary_cause || "financial distress").replaceAll("_", " ")} based on recent financial patterns.`,
      what_we_can_do: decisionResponse?.selected_intervention
        ? `DebtWise proposes '${decisionResponse.selected_intervention.title}' providing estimated monthly cash-flow relief.`
        : "A specialist review is recommended.",
      why_this_option_is_safer: "All options were evaluated against strict institutional safety rules (SC-001 through SC-008).",
      affordability_context: `Calculated sustainable capacity is ₹${Number(decisionResponse?.capacity?.safe_emi || 0).toLocaleString("en-IN")}/month.`,
      customer_message: "You remain in complete control. Your affirmative consent is required before any plan is activated.",
      disclaimer: "This is an estimate based on current financial information, not a guarantee of future outcomes.",
      metadata: {
        provider: "client_fallback",
        model: "client_fallback_v1",
        fallback_used: true,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

async function analyzeDemoCustomer(name) {
  const customer = await request(`/demo-customer/${name}`);
  const analysis = await request("/analyze", {
    method: "POST",
    body: JSON.stringify(customer),
  });

  const explanation = await explainDecision(analysis);
  return mapAnalysisToCustomerDetail(customer, analysis, explanation);
}

export const api = {
  async getHealth() {
    return request("/health");
  },

  async getDemoCustomers() {
    return request("/demo-customers");
  },

  async getPortfolioStats() {
    /*
     * Portfolio aggregation is not currently exposed by the backend.
     * Keep dashboard-level demo statistics separate from decision data.
     */
    return {
      total_customers: 6000,
      distressed_customers: 6000,
      high_risk_customers: 2400,
      interventions_prevented: 0,
      source: "synthetic_demo",
    };
  },

  async getDistressedQueue() {
    const customers = await request("/demo-customers");

    return customers.map((customer) => ({
      ...customer,
      customer_id: customer.customer_id,
      name: customer.name,
      first_name: customer.name?.split(" ")[0] || customer.name,
    }));
  },

  async getCustomerDetails(customerId = "CUST_PRIYA_34") {
    const customers = await request("/demo-customers");

    const customer = customers.find(
      (item) =>
        item.customer_id === customerId ||
        item.id === customerId ||
        item.name?.toLowerCase() === customerId?.toLowerCase()
    );

    if (!customer) {
      throw new Error(`Customer '${customerId}' not found.`);
    }

    const firstName = customer.name?.split(" ")[0]?.toLowerCase();

    if (!DEMO_NAMES.includes(firstName)) {
      throw new Error(`No canonical demo persona available for '${customer.name}'.`);
    }

    return analyzeDemoCustomer(firstName);
  },

  async analyzeCustomer(customer) {
    const analysis = await request("/analyze", {
      method: "POST",
      body: JSON.stringify(customer),
    });

    const explanation = await explainDecision(analysis);
    return mapAnalysisToCustomerDetail(customer, analysis, explanation);
  },

  async explainDecision(decision) {
    return explainDecision(decision);
  },

  async diagnoseDistress(customer) {
    return request("/diagnose-distress", {
      method: "POST",
      body: JSON.stringify(customer),
    });
  },

  async submitCustomerConsent(customerId, interventionId, consent = true) {
    /*
     * Backend currently exposes a consent gate in /analyze but does not
     * expose a persistence/execution endpoint. Therefore this is explicitly
     * a simulated consent capture for the demo.
     */
    return {
      success: true,
      simulated: true,
      customer_id: customerId,
      intervention_id: interventionId,
      consent_granted: consent,
      status: consent ? "CONSENT_GRANTED" : "CONSENT_REVOKED",
      message: consent
        ? "Customer consent captured in the demo flow."
        : "Customer consent declined in the demo flow.",
    };
  },
};

/*
 * Compatibility exports.
 *
 * Existing UI components still import these names. They are populated
 * asynchronously from the real backend when possible.
 */
export const PORTFOLIO_STATS = {
  total_customers: 6000,
  distressed_customers: 6000,
  high_risk_customers: 2400,
  interventions_prevented: 0,
  source: "synthetic_demo",
};

export const MOCK_CUSTOMERS_QUEUE = [];

export const PRIYA_DEMO_DATA = {
  customer_id: "CUST_PRIYA_34",
  name: "Priya Sharma",
  first_name: "Priya",
  source: "backend",
};

export async function loadPriyaDemoData() {
  return analyzeDemoCustomer("priya");
}

export default api;