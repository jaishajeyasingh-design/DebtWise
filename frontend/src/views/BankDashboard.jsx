import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  XCircle,
} from 'lucide-react';

import { api } from '../api/mockApi';
import RiskBadge from '../components/common/RiskBadge';

const CAUSE_LABELS = {
  EXPENSE_SHOCK: 'Expense Shock',
  DEBT_OVERLOAD: 'Debt Overload',
  INCOME_SHOCK: 'Income Shock',
  CASH_FLOW_MISMATCH: 'Cash-Flow Mismatch',
  STRUCTURAL_DISTRESS: 'Structural Distress',
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

const pct = (value) => `${Math.round(Number(value || 0) * 100)}%`;

export default function BankDashboard({ onOpenPriyaDemo }) {
  const [queue, setQueue] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] =
    useState('CUST_PRIYA_34');
  const [customerDetail, setCustomerDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) loadCustomer(selectedCustomerId);
  }, [selectedCustomerId]);

  const loadDashboard = async () => {
    setLoadingQueue(true);

    try {
      const customers = await api.getDemoCustomers();

      const analyzed = await Promise.all(
        customers.map(async (customer) => {
          try {
            const detail = await api.analyzeCustomer(customer);
            const diagnosis = detail?.diagnosis || {};
            const capacity = detail?.capacity || {};
            const governance = detail?.governance || {};

            return {
              id: customer.customer_id || customer.id,
              name:
                customer.name ||
                customer.customer_name ||
                'Unknown Customer',
              account_number:
                customer.account_number || 'DEMO-ACCOUNT',
              risk_level:
                diagnosis.severity || customer.risk_level || 'HIGH',
              distress_cause:
                diagnosis.primary_cause ||
                customer.distress_cause ||
                'UNKNOWN',
              automation_tier:
                governance.tier ||
                detail?.decision_response?.tier ||
                'TIER_B',
              sustainable_capacity: Number(
                capacity.safe_emi ??
                  detail?.sustainable_repayment_capacity ??
                  0
              ),
              detail,
            };
          } catch (error) {
            console.error(`Failed to analyze ${customer?.name}:`, error);
            return {
              id: customer.customer_id || customer.id,
              name:
                customer.name ||
                customer.customer_name ||
                'Unknown Customer',
              account_number:
                customer.account_number || 'DEMO-ACCOUNT',
              risk_level: customer.risk_level || 'HIGH',
              distress_cause: customer.distress_cause || 'UNKNOWN',
              automation_tier: customer.automation_tier || 'TIER_B',
              sustainable_capacity: Number(
                customer.sustainable_capacity || 0
              ),
              detail: null,
            };
          }
        })
      );

      setQueue(analyzed);

      const priya = analyzed.find(
        (customer) =>
          customer.id === 'CUST_PRIYA_34' ||
          customer.name.toLowerCase().includes('priya')
      );

      setSelectedCustomerId(priya?.id || analyzed[0]?.id || null);
    } catch (error) {
      console.error('Failed to load DebtWise operations console:', error);
      setQueue([]);
    } finally {
      setLoadingQueue(false);
    }
  };

  const loadCustomer = async (id) => {
    setLoadingDetail(true);

    try {
      const queued = queue.find((customer) => customer.id === id);

      if (queued?.detail) {
        setCustomerDetail(queued.detail);
        return;
      }

      const data = await api.getCustomerDetails(id);
      setCustomerDetail(data);
    } catch (error) {
      console.error(`Failed to load customer ${id}:`, error);
      setCustomerDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredQueue = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return queue.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query);

      const matchesTier =
        selectedTier === 'ALL' ||
        customer.automation_tier === selectedTier;

      return matchesSearch && matchesTier;
    });
  }, [queue, searchQuery, selectedTier]);

  const selectedCustomer = queue.find(
    (customer) => customer.id === selectedCustomerId
  );

  const diagnosis = customerDetail?.diagnosis || {};
  const capacity = customerDetail?.capacity || {};
  const governance = customerDetail?.governance || {};
  const selectedIntervention =
    customerDetail?.selected_intervention ||
    customerDetail?.decision_response?.selected_intervention ||
    customerDetail?.safe_interventions?.[0];

  const rejectedCandidates =
    customerDetail?.candidates?.filter(
      (candidate) =>
        candidate.status === 'REJECTED' ||
        candidate.approved === false ||
        candidate.is_approved === false
    ) || [];

  const criticalCount = queue.filter(
    (customer) => customer.risk_level === 'CRITICAL'
  ).length;

  const tierACount = queue.filter(
    (customer) => customer.automation_tier === 'TIER_A'
  ).length;

  const reviewCount = queue.filter(
    (customer) => customer.automation_tier !== 'TIER_A'
  ).length;

  const causeCounts = queue.reduce((acc, customer) => {
    acc[customer.distress_cause] =
      (acc[customer.distress_cause] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* HEADER */}
      <section className="glass-panel rounded-2xl border border-slate-700/70 bg-slate-950/70 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              DebtWise Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Who needs attention right now?
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Triage distressed customers, understand the reason, and review
              the safest next action.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/70 text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              XGBoost + SHAP Live
            </div>

            <button
              onClick={onOpenPriyaDemo}
              className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
            >
              Open Priya Demo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric
          label="Active demo cases"
          value={queue.length}
          detail="Backend-analyzed customers"
          icon={<UserRound className="w-4 h-4" />}
        />
        <Metric
          label="Critical"
          value={criticalCount}
          detail="Immediate attention"
          tone="rose"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <Metric
          label="Tier A"
          value={tierACount}
          detail="Consent-based reversible actions"
          tone="emerald"
          icon={<ZapIcon />}
        />
        <Metric
          label="Officer review"
          value={reviewCount}
          detail="Human approval boundary"
          tone="amber"
          icon={<ShieldCheck className="w-4 h-4" />}
        />
      </section>

      {/* MAIN WORKSPACE */}
      <section className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-5 items-start">
        {/* TRIAGE */}
        <aside className="glass-panel rounded-2xl border border-slate-700/70 p-4 xl:sticky xl:top-24">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                Triage queue
              </div>
              <h2 className="text-lg font-bold text-white">
                High-risk customers
              </h2>
            </div>
            <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
              {filteredQueue.length} shown
            </span>
          </div>

          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or customer ID"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl theme-input text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>

          <div className="flex gap-1.5 mb-4">
            {['ALL', 'TIER_A', 'TIER_B', 'TIER_C'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono border transition ${
                  selectedTier === tier
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                }`}
              >
                {tier === 'ALL' ? 'All' : tier.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {loadingQueue ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                Running decision engine...
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No matching customers.
              </div>
            ) : (
              filteredQueue.map((customer) => {
                const selected = customer.id === selectedCustomerId;

                return (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition ${
                      selected
                        ? 'bg-cyan-500/10 border-cyan-400/70'
                        : 'bg-slate-950/45 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm truncate">
                            {customer.name}
                          </span>
                          {customer.id === 'CUST_PRIYA_34' && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[8px] font-mono font-bold">
                              DEMO
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {customer.id}
                        </div>
                      </div>
                      <RiskBadge type="risk" value={customer.risk_level} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
                      <div>
                        <div className="text-[9px] font-mono uppercase text-slate-600">
                          Root cause
                        </div>
                        <div className="text-xs font-semibold text-cyan-300 mt-1 truncate">
                          {CAUSE_LABELS[customer.distress_cause] ||
                            customer.distress_cause}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-mono uppercase text-slate-600">
                          Safe EMI
                        </div>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                          {money(customer.sustainable_capacity)}/mo
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <RiskBadge
                        type="tier"
                        value={customer.automation_tier}
                      />
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        Review
                        <ChevronRight className="w-3 h-3 text-cyan-400" />
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* DECISION SNAPSHOT */}
        <main className="space-y-5">
          {loadingDetail ? (
            <div className="glass-panel rounded-2xl border border-slate-700/70 p-12 text-center">
              <div className="text-cyan-400 font-mono text-xs">
                RUNNING DEBTWISE DECISION ENGINE
              </div>
              <div className="text-slate-500 text-xs mt-2">
                Diagnosis → Capacity → Safety → Recommendation
              </div>
            </div>
          ) : !customerDetail ? (
            <div className="glass-panel rounded-2xl border border-slate-700/70 p-12 text-center text-slate-500 text-sm">
              Select a customer to inspect the decision snapshot.
            </div>
          ) : (
            <>
              {/* CUSTOMER */}
              <div className="glass-panel rounded-2xl border border-slate-700/70 p-5 bg-slate-950/55">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cyan-400">
                        {customerDetail.customer_id}
                      </span>
                      <RiskBadge
                        type="risk"
                        value={
                          diagnosis.severity ||
                          selectedCustomer?.risk_level ||
                          'HIGH'
                        }
                      />
                    </div>
                    <h2 className="text-2xl font-black text-white mt-1">
                      {customerDetail.name || selectedCustomer?.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Decision snapshot — only the information needed for the
                      next action.
                    </p>
                  </div>

                  {customerDetail.customer_id === 'CUST_PRIYA_34' && (
                    <button
                      onClick={onOpenPriyaDemo}
                      className="px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs font-bold flex items-center gap-2"
                    >
                      Full customer journey
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* FOUR ANSWERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SnapshotCard
                  eyebrow="01 · WHY"
                  title="Root cause"
                  value={
                    CAUSE_LABELS[diagnosis.primary_cause] ||
                    diagnosis.primary_cause ||
                    'Unknown'
                  }
                  detail={
                    diagnosis.top_factors?.[0]?.feature
                      ? `Top driver: ${diagnosis.top_factors[0].feature}`
                      : 'Model diagnosis available'
                  }
                  icon={<Sparkles className="w-4 h-4" />}
                />

                <SnapshotCard
                  eyebrow="02 · CAPACITY"
                  title="Sustainable EMI"
                  value={`${money(capacity.safe_emi)}/mo`}
                  detail={`Current obligations ${money(
                    capacity.current_obligations
                  )}/mo`}
                  tone="emerald"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                />

                <SnapshotCard
                  eyebrow="03 · SAFETY"
                  title={
                    rejectedCandidates.length
                      ? `${rejectedCandidates.length} unsafe option${
                          rejectedCandidates.length > 1 ? 's' : ''
                        } blocked`
                      : 'Safety checks passed'
                  }
                  value={
                    rejectedCandidates.length
                      ? 'Filtered before recommendation'
                      : 'No unsafe candidate selected'
                  }
                  detail={
                    rejectedCandidates.length
                      ? 'See the rejected option below'
                      : 'Responsible-lending constraints enforced'
                  }
                  tone={rejectedCandidates.length ? 'rose' : 'cyan'}
                  icon={
                    rejectedCandidates.length ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )
                  }
                />

                <SnapshotCard
                  eyebrow="04 · NEXT ACTION"
                  title="Recommended intervention"
                  value={selectedIntervention?.name || 'Review case'}
                  detail={
                    selectedIntervention?.description ||
                    'Open the case for intervention details.'
                  }
                  tone="amber"
                  icon={<ArrowRight className="w-4 h-4" />}
                />
              </div>

              {/* ACTION PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_.65fr] gap-4">
                <section className="glass-panel rounded-2xl border border-slate-700/70 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                        Recommended path
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        Safest effective next step
                      </h3>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
                      {governance.tier || selectedCustomer?.automation_tier}
                    </span>
                  </div>

                  {selectedIntervention ? (
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                      <div className="text-sm font-bold text-white">
                        {selectedIntervention.name}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {selectedIntervention.description ||
                          'Selected after affordability and safety checks.'}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                        <MiniStat
                          label="After EMI"
                          value={
                            selectedIntervention.estimated_emi_after != null
                              ? `${money(
                                  selectedIntervention.estimated_emi_after
                                )}/mo`
                              : '—'
                          }
                        />
                        <MiniStat
                          label="Consent"
                          value={
                            governance.customer_consent_required
                              ? 'Required'
                              : 'Not required'
                          }
                        />
                        <MiniStat
                          label="Human"
                          value={
                            governance.human_approval_required
                              ? 'Required'
                              : 'Not required'
                          }
                        />
                        <MiniStat
                          label="Execution"
                          value={
                            governance.is_executable ? 'Ready' : 'Blocked'
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-500">
                      No intervention selected yet.
                    </div>
                  )}

                  {customerDetail.customer_id === 'CUST_PRIYA_34' && (
                    <button
                      onClick={onOpenPriyaDemo}
                      className="mt-4 w-full px-4 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                    >
                      Review complete Priya decision
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </section>

                <section className="glass-panel rounded-2xl border border-slate-700/70 p-5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                    Governance
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Execution boundary
                  </h3>

                  <div className="space-y-2 mt-4">
                    <Gate
                      icon={<UserRound className="w-3.5 h-3.5" />}
                      label="Customer consent"
                      value={
                        governance.customer_consent_required
                          ? governance.customer_consent_status ||
                            'PENDING'
                          : 'Not required'
                      }
                    />
                    <Gate
                      icon={<ShieldCheck className="w-3.5 h-3.5" />}
                      label="Human approval"
                      value={
                        governance.human_approval_required
                          ? governance.human_approval_status ||
                            'PENDING'
                          : 'Not required'
                      }
                    />
                    <Gate
                      icon={<Clock3 className="w-3.5 h-3.5" />}
                      label="Execution"
                      value={
                        governance.is_executable ? 'READY' : 'BLOCKED'
                      }
                    />
                  </div>

                  <p className="text-[10px] text-slate-600 mt-4 leading-relaxed">
                    Contractual changes and higher-risk actions remain behind
                    explicit governance gates.
                  </p>
                </section>
              </div>

              {/* SAFETY CALLOUT */}
              {rejectedCandidates.length > 0 && (
                <section className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-5">
                  <div className="flex items-center gap-2 text-rose-300 text-[10px] font-mono uppercase tracking-widest">
                    <XCircle className="w-4 h-4" />
                    Safety engine intervention
                  </div>

                  <div className="mt-3 space-y-2">
                    {rejectedCandidates.slice(0, 2).map((candidate) => (
                      <div
                        key={candidate.id}
                        className="rounded-xl bg-slate-950/50 border border-rose-500/20 p-3"
                      >
                        <div className="text-sm font-bold text-slate-200 line-through">
                          {candidate.name || candidate.intervention_name}
                        </div>
                        <div className="text-xs text-rose-200/80 mt-1">
                          Rejected before recommendation by the DebtWise
                          safety layer.
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PORTFOLIO CONTEXT — SMALL, NOT A SECOND DASHBOARD */}
              <section className="glass-panel rounded-2xl border border-slate-700/70 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                      Queue context
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Distress causes in this demo queue
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">
                    {queue.length} customers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(causeCounts).map(([cause, count]) => (
                    <div
                      key={cause}
                      className="rounded-xl bg-slate-950/45 border border-slate-800 p-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">
                          {CAUSE_LABELS[cause] || cause}
                        </span>
                        <span className="font-mono text-cyan-300">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{
                            width: `${(count / Math.max(queue.length, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </section>
    </div>
  );
}

function Metric({ label, value, detail, icon, tone = 'cyan' }) {
  const tones = {
    cyan: 'text-cyan-300 border-cyan-500/20',
    rose: 'text-rose-300 border-rose-500/20',
    emerald: 'text-emerald-300 border-emerald-500/20',
    amber: 'text-amber-300 border-amber-500/20',
  };

  return (
    <div className={`glass-card rounded-2xl p-4 border ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <span className="text-slate-500">{icon}</span>
      </div>
      <div className="text-2xl font-black font-mono text-white mt-1">
        {value}
      </div>
      <div className="text-[10px] text-slate-500 mt-1">{detail}</div>
    </div>
  );
}

function SnapshotCard({ eyebrow, title, value, detail, icon, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-cyan-500/25',
    emerald: 'border-emerald-500/25',
    rose: 'border-rose-500/30',
    amber: 'border-amber-500/25',
  };

  return (
    <section
      className={`glass-panel rounded-2xl border ${tones[tone]} p-5 min-h-[150px]`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          {eyebrow}
        </div>
        <span className="text-slate-500">{icon}</span>
      </div>
      <div className="text-sm font-semibold text-slate-300 mt-3">{title}</div>
      <div className="text-xl font-black text-white mt-1 leading-tight">
        {value}
      </div>
      <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">
        {detail}
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2.5">
      <div className="text-[9px] font-mono uppercase text-slate-600">
        {label}
      </div>
      <div className="text-[11px] font-mono font-bold text-slate-200 mt-1">
        {value}
      </div>
    </div>
  );
}

function Gate({ icon, label, value }) {
  const blocked =
    String(value).toUpperCase().includes('PENDING') ||
    String(value).toUpperCase() === 'BLOCKED';

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-950/50 border border-slate-800 p-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="text-slate-500">{icon}</span>
        {label}
      </div>
      <span
        className={`text-[9px] font-mono font-bold ${
          blocked ? 'text-amber-300' : 'text-emerald-300'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ZapIcon() {
  return <Sparkles className="w-4 h-4" />;
}
