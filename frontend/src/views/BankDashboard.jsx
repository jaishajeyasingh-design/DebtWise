import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  Zap,
  TrendingUp,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Sliders,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  ChevronRight
} from 'lucide-react';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

import { api, PORTFOLIO_STATS } from '../api/mockApi';

import RiskBadge from '../components/common/RiskBadge';
import DistressDiagnosis from '../components/diagnosis/DistressDiagnosis';
import SHAPFactors from '../components/diagnosis/SHAPFactors';
import CapacityCard from '../components/capacity/CapacityCard';
import InterventionCard from '../components/interventions/InterventionCard';
import SafetyRejection from '../components/interventions/SafetyRejection';
import AuditTimeline from '../components/audit/AuditTimeline';
import WhatIfSimulator from '../components/simulator/WhatIfSimulator';

export default function BankDashboard({ onOpenPriyaDemo }) {
  const [stats, setStats] = useState({
    ...PORTFOLIO_STATS,
    cause_distribution: PORTFOLIO_STATS?.cause_distribution || [
      {
        name: 'Expense Shock',
        count: 1200,
        percentage: 20,
        color: '#f59e0b'
      },
      {
        name: 'Debt Overload',
        count: 1200,
        percentage: 20,
        color: '#ef4444'
      },
      {
        name: 'Income Shock',
        count: 1200,
        percentage: 20,
        color: '#8b5cf6'
      },
      {
        name: 'Cash-Flow Mismatch',
        count: 1200,
        percentage: 20,
        color: '#06b6d4'
      },
      {
        name: 'Structural Distress',
        count: 1200,
        percentage: 20,
        color: '#64748b'
      }
    ]
  });

  const [queue, setQueue] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL');
  const [selectedCauseFilter, setSelectedCauseFilter] = useState('ALL');

  const [selectedCustomerId, setSelectedCustomerId] =
    useState('CUST_PRIYA_34');

  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(true);

  const [activeTab, setActiveTab] = useState('diagnosis');

  /*
   * Load portfolio statistics + real backend demo customers.
   */
  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * Load selected customer whenever the selection changes.
   */
  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomer(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const loadDashboard = async () => {
    setLoadingQueue(true);

    try {
      /*
       * Portfolio stats are currently synthetic/demo-level.
       */
      try {
        const portfolioStats = await api.getPortfolioStats();

        if (portfolioStats) {
          setStats({
            ...portfolioStats,
            cause_distribution:
              portfolioStats.cause_distribution || []
          });
        }
      } catch (error) {
        console.warn(
          'Portfolio stats unavailable, using demo statistics.',
          error
        );
      }

      /*
       * Backend exposes four canonical demo customers.
       * Analyze each one so the queue uses the same decision engine
       * as the customer inspector.
       */
      const customers = await api.getDemoCustomers();

      const analyzedCustomers = await Promise.all(
        customers.map(async (customer) => {
          try {
            const detail = await api.analyzeCustomer(customer);

            const riskLevel =
              detail?.diagnosis?.severity ||
              customer?.risk_level ||
              'HIGH';

            const distressCause =
              detail?.diagnosis?.primary_cause ||
              'UNKNOWN';

            const tier =
              detail?.governance?.tier ||
              detail?.decision_response?.tier ||
              'TIER_B';

            const sustainableCapacity =
              detail?.capacity?.safe_emi ??
              detail?.sustainable_repayment_capacity ??
              0;

            return {
              id:
                customer.customer_id ||
                customer.id,

              name:
                customer.name ||
                customer.customer_name ||
                'Unknown Customer',

              account_number:
                customer.account_number ||
                'DEMO-ACCOUNT',

              age: customer.age,

              salary_day:
                customer.salary_day ||
                customer.income_day ||
                1,

              emi_due_day:
                customer.emi_due_day ||
                customer.payment_due_day ||
                1,

              risk_level: riskLevel,

              distress_cause: distressCause,

              automation_tier: tier,

              sustainable_capacity: Number(
                sustainableCapacity || 0
              ),

              status:
                detail?.governance?.is_executable
                  ? 'READY'
                  : 'REVIEW',

              detail
            };
          } catch (error) {
            console.error(
              `Failed to analyze ${customer?.name}:`,
              error
            );

            return {
              id:
                customer.customer_id ||
                customer.id,

              name:
                customer.name ||
                customer.customer_name ||
                'Unknown Customer',

              account_number:
                customer.account_number ||
                'DEMO-ACCOUNT',

              age: customer.age,

              salary_day:
                customer.salary_day ||
                customer.income_day ||
                1,

              emi_due_day:
                customer.emi_due_day ||
                customer.payment_due_day ||
                1,

              risk_level:
                customer.risk_level ||
                'HIGH',

              distress_cause:
                customer.distress_cause ||
                'UNKNOWN',

              automation_tier:
                customer.automation_tier ||
                'TIER_B',

              sustainable_capacity: Number(
                customer.sustainable_capacity || 0
              ),

              status: 'REVIEW'
            };
          }
        })
      );

      setQueue(analyzedCustomers);

      /*
       * Always default to Priya if available.
       */
      const priya = analyzedCustomers.find(
        (customer) =>
          customer.id === 'CUST_PRIYA_34' ||
          customer.name?.toLowerCase().includes('priya')
      );

      if (priya) {
        setSelectedCustomerId(priya.id);
      } else if (analyzedCustomers.length > 0) {
        setSelectedCustomerId(analyzedCustomers[0].id);
      }
    } catch (error) {
      console.error('Failed to load DebtWise dashboard:', error);
      setQueue([]);
    } finally {
      setLoadingQueue(false);
    }
  };

  const loadCustomer = async (id) => {
    setLoadingDetail(true);

    try {
      /*
       * If queue already contains the fully analyzed customer,
       * use it immediately.
       */
      const queueCustomer = queue.find(
        (customer) => customer.id === id
      );

      if (queueCustomer?.detail) {
        setCustomerDetail(queueCustomer.detail);
        setLoadingDetail(false);
        return;
      }

      const data = await api.getCustomerDetails(id);
      setCustomerDetail(data);
    } catch (error) {
      console.error(
        `Failed to load customer ${id}:`,
        error
      );

      setCustomerDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  /*
   * Filter queue.
   */
  const filteredQueue = queue.filter((cust) => {
    const name =
      cust.name?.toLowerCase() || '';

    const id =
      cust.id?.toLowerCase() || '';

    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      id.includes(searchQuery.toLowerCase());

    const tier =
      cust.automation_tier || '';

    const cause =
      cust.distress_cause || '';

    const matchesTier =
      selectedTierFilter === 'ALL' ||
      tier.includes(
        selectedTierFilter.replace('Tier ', 'TIER_')
      );

    const matchesCause =
      selectedCauseFilter === 'ALL' ||
      cause === selectedCauseFilter;

    return (
      matchesSearch &&
      matchesTier &&
      matchesCause
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ========================================================= */}
      {/* TOP BANNER */}
      {/* ========================================================= */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-slate-700/80 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40">

        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>

            DebtWise Operations Console • Real-Time Triage
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Financial Distress Intervention Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Proactive triage queue separating low-risk automated
            interventions from officer-reviewed relief concessions.
          </p>
        </div>

        <button
          onClick={onOpenPriyaDemo}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.25)] transition shrink-0"
        >
          <span>Launch Priya Golden Demo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>


      {/* ========================================================= */}
      {/* KPI STATS */}
      {/* ========================================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        <div className="glass-card rounded-2xl p-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            Monitored Accounts
          </div>

          <div className="text-2xl font-mono font-bold text-white mt-1">
            14,850
          </div>

          <div className="text-[11px] text-emerald-400 mt-0.5">
            Synthetic demo telemetry
          </div>
        </div>


        <div className="glass-card rounded-2xl p-4 border-rose-500/30">
          <div className="text-[11px] font-mono text-rose-300 uppercase">
            Active Distress Cases
          </div>

          <div className="text-2xl font-mono font-bold text-rose-400 mt-1">
            342
          </div>

          <div className="text-[11px] text-rose-300/80 mt-0.5">
            Early detected cases
          </div>
        </div>


        <div className="glass-card rounded-2xl p-4 border-emerald-500/30">
          <div className="text-[11px] font-mono text-emerald-300 uppercase">
            Tier A Auto Rate
          </div>

          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            58.4%
          </div>

          <div className="text-[11px] text-emerald-300/80 mt-0.5">
            Self-resolved post-consent
          </div>
        </div>


        <div className="glass-card rounded-2xl p-4 border-blue-500/30">
          <div className="text-[11px] font-mono text-blue-300 uppercase">
            Cure Rate Lift
          </div>

          <div className="text-2xl font-mono font-bold text-blue-400 mt-1">
            +41.2%
          </div>

          <div className="text-[11px] text-blue-300/80 mt-0.5">
            vs traditional collections
          </div>
        </div>


        <div className="glass-card rounded-2xl p-4 border-cyan-500/30 col-span-2 lg:col-span-1">
          <div className="text-[11px] font-mono text-cyan-300 uppercase">
            Defaults Prevented
          </div>

          <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
            ₹4.82 Cr
          </div>

          <div className="text-[11px] text-cyan-300/80 mt-0.5">
            Preserved balance volume
          </div>
        </div>

      </div>


      {/* ========================================================= */}
      {/* PORTFOLIO BREAKDOWN */}
      {/* ========================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CAUSE DISTRIBUTION */}

        <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 lg:col-span-2 flex flex-col justify-between">

          <div className="flex justify-between items-center mb-4">

            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase">
                AI Diagnosis Telemetry
              </div>

              <h4 className="text-lg font-bold text-white">
                Portfolio Distress Cause Breakdown
              </h4>
            </div>

            <span className="text-xs font-mono text-slate-400">
              342 Flagged Accounts
            </span>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">

            <div className="h-44 w-full">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={stats?.cause_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >

                    {(stats?.cause_distribution || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    content={({ active, payload }) => {

                      if (
                        active &&
                        payload &&
                        payload.length
                      ) {
                        return (
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono">

                            <div className="text-white font-bold">
                              {payload[0].name}
                            </div>

                            <div className="text-cyan-400">
                              {payload[0].value} customers
                              {' '}
                              (
                              {payload[0].payload?.percentage || 0}
                              %)
                            </div>

                          </div>
                        );
                      }

                      return null;
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>


            <div className="space-y-2 text-xs">

              {(stats?.cause_distribution || []).map(
                (item) => (

                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800"
                  >

                    <div className="flex items-center gap-2">

                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: item.color
                        }}
                      />

                      <span className="text-slate-200 font-semibold">
                        {item.name}
                      </span>

                    </div>

                    <div className="font-mono text-slate-400">

                      <strong className="text-white">
                        {item.count}
                      </strong>

                      {' '}
                      ({item.percentage}%)

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>


        {/* AUTOMATION TIERS */}

        <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 flex flex-col justify-between">

          <div>

            <div className="text-xs font-mono text-emerald-400 uppercase">
              Responsible AI Framework
            </div>

            <h4 className="text-lg font-bold text-white mb-3">
              Automation Boundary Tiers
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Hardcoded architectural boundaries dictating
              automated execution vs officer sign-off.
            </p>

          </div>


          <div className="space-y-3 text-xs">

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">

              <div>
                <strong className="text-emerald-400 block font-mono">
                  Tier A (58.4%)
                </strong>

                <span className="text-slate-300 text-[11px]">
                  Reversible actions after consent
                </span>
              </div>

              <span className="font-mono text-emerald-400 font-bold text-base">
                200
              </span>

            </div>


            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">

              <div>
                <strong className="text-amber-400 block font-mono">
                  Tier B (32.1%)
                </strong>

                <span className="text-slate-300 text-[11px]">
                  AI prepares, Officer approves
                </span>
              </div>

              <span className="font-mono text-amber-400 font-bold text-base">
                110
              </span>

            </div>


            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">

              <div>
                <strong className="text-rose-400 block font-mono">
                  Tier C (9.5%)
                </strong>

                <span className="text-slate-300 text-[11px]">
                  Human Hardship Specialist only
                </span>
              </div>

              <span className="font-mono text-rose-400 font-bold text-base">
                32
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ========================================================= */}
      {/* MAIN WORK AREA */}
      {/* ========================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">


        {/* ======================================================= */}
        {/* CUSTOMER QUEUE */}
        {/* ======================================================= */}

        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-700/60 space-y-4">

          <div className="flex items-center justify-between">

            <div>

              <div className="text-xs font-mono text-cyan-400 uppercase">
                Triage Queue
              </div>

              <h3 className="text-xl font-bold text-white">
                High-Risk Customer Queue
              </h3>

            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
              {filteredQueue.length} Active
            </span>

          </div>


          {/* SEARCH */}

          <div className="space-y-2">

            <div className="relative">

              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

              <input
                type="text"
                placeholder="Search by customer name or ID..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />

            </div>


            {/* TIER FILTER */}

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">

              {['ALL', 'Tier A', 'Tier B', 'Tier C'].map(
                (tier) => (

                  <button
                    key={tier}
                    onClick={() =>
                      setSelectedTierFilter(tier)
                    }
                    className={`px-3 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition ${selectedTierFilter === tier
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                  >
                    {tier}
                  </button>

                )
              )}

            </div>

          </div>


          {/* QUEUE */}

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">

            {loadingQueue ? (

              <div className="p-8 text-center text-slate-400 text-sm font-mono">
                Loading AI triage queue...
              </div>

            ) : filteredQueue.length === 0 ? (

              <div className="p-8 text-center text-slate-400 text-sm">
                No customers match the current filters.
              </div>

            ) : (

              filteredQueue.map((cust) => {

                const isSelected =
                  cust.id === selectedCustomerId;

                return (

                  <div
                    key={cust.id}
                    onClick={() =>
                      setSelectedCustomerId(cust.id)
                    }
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.12)]'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                  >

                    <div className="flex items-start justify-between gap-2 mb-2">

                      <div>

                        <div className="font-bold text-white text-sm flex items-center gap-2">

                          <span>
                            {cust.name}
                          </span>

                          {cust.id === 'CUST_PRIYA_34' && (

                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                              HERO DEMO
                            </span>

                          )}

                        </div>

                        <div className="text-[11px] font-mono text-slate-400">

                          {cust.id}

                          {' • '}

                          {cust.account_number}

                        </div>

                      </div>

                      <RiskBadge
                        type="risk"
                        value={cust.risk_level}
                      />

                    </div>


                    {/* DIAGNOSIS + CAPACITY */}

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 my-1 border-t border-slate-800/80">

                      <div>

                        <span className="text-[10px] font-mono text-slate-500 block uppercase">
                          Diagnosed Cause
                        </span>

                        <span className="font-semibold text-cyan-300 truncate block">

                          {(cust.distress_cause || 'UNKNOWN')
                            .replace(/_/g, ' ')}

                        </span>

                      </div>


                      <div className="text-right">

                        <span className="text-[10px] font-mono text-slate-500 block uppercase">
                          Sustainable Cap
                        </span>

                        <span className="font-mono font-bold text-emerald-400">

                          ₹
                          {Number(
                            cust.sustainable_capacity || 0
                          ).toLocaleString('en-IN')}

                          /mo

                        </span>

                      </div>

                    </div>


                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400">

                      <RiskBadge
                        type="tier"
                        value={cust.automation_tier}
                      />

                      <span className="text-slate-400 flex items-center gap-1 text-[10px]">

                        {cust.status}

                        <ChevronRight className="w-3 h-3 text-cyan-400" />

                      </span>

                    </div>

                  </div>

                );

              })

            )}

          </div>

        </div>


        {/* ======================================================= */}
        {/* CUSTOMER INSPECTOR */}
        {/* ======================================================= */}

        <div className="lg:col-span-7 space-y-6">

          {loadingDetail ? (

            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">

              <div className="text-cyan-400 font-mono text-sm mb-2">
                RUNNING DEBTWISE DECISION ENGINE
              </div>

              <div className="text-xs">
                Diagnosis → Capacity → Safety → Recommendation
              </div>

            </div>

          ) : customerDetail ? (

            <div className="space-y-6">


              {/* PROFILE */}

              <div className="glass-panel rounded-2xl p-6 border border-slate-700/80 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      {customerDetail.customer_id}
                    </span>

                    <RiskBadge
                      type="risk"
                      value={
                        customerDetail.diagnosis?.severity ||
                        customerDetail.risk_level
                      }
                    />

                  </div>

                  <h2 className="text-2xl font-bold text-white mt-1">
                    {customerDetail.name}
                  </h2>

                  <div className="text-xs text-slate-400 font-mono mt-0.5">

                    Age: {customerDetail.age ?? '—'}

                    {' • '}

                    Salary Day:{' '}
                    {customerDetail.salary_day ?? '—'}

                    {' • '}

                    EMI Due:{' '}
                    {customerDetail.emi_due_day ?? '—'}

                  </div>

                </div>


                <div className="flex items-center gap-2">

                  {customerDetail.customer_id ===
                    'CUST_PRIYA_34' && (

                      <button
                        onClick={onOpenPriyaDemo}
                        className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition"
                      >
                        <span>
                          Simulate Customer View
                        </span>

                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                    )}

                </div>

              </div>


              {/* TABS */}

              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono overflow-x-auto">

                {[
                  {
                    id: 'diagnosis',
                    label: '1. AI Diagnosis & SHAP'
                  },
                  {
                    id: 'interventions',
                    label: '2. Interventions & Safety'
                  },
                  {
                    id: 'simulator',
                    label: '3. What-If Simulator'
                  },
                  {
                    id: 'audit',
                    label: '4. Compliance Audit Trail'
                  }
                ].map((tab) => (

                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    {tab.label}
                  </button>

                ))}

              </div>


              {/* ================================================= */}
              {/* TAB 1 — DIAGNOSIS */}
              {/* ================================================= */}

              {activeTab === 'diagnosis' && (

                <div className="space-y-6">

                  <DistressDiagnosis
                    diagnosis={
                      customerDetail.diagnosis
                    }
                  />

                  <SHAPFactors
                    factors={
                      customerDetail.diagnosis
                        ?.top_factors || []
                    }
                  />

                  <CapacityCard
                    customer={customerDetail}
                  />

                </div>

              )}


              {/* ================================================= */}
              {/* TAB 2 — INTERVENTIONS */}
              {/* ================================================= */}

              {activeTab === 'interventions' && (

                <div className="space-y-6">

                  <SafetyRejection
                    rejectionData={
                      customerDetail.safety_rejection
                    }
                  />


                  <div>

                    <h4 className="text-lg font-bold text-white mb-3">
                      Safe Candidate Interventions
                    </h4>

                    <div className="space-y-4">

                      {(
                        customerDetail.safe_interventions ||
                        []
                      ).length === 0 ? (

                        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-400">
                          No intervention candidates are
                          currently available.
                        </div>

                      ) : (

                        (
                          customerDetail.safe_interventions ||
                          []
                        ).map((intv) => (

                          <InterventionCard
                            key={intv.id}
                            intervention={intv}
                            showAction={false}
                          />

                        ))

                      )}

                    </div>

                  </div>

                </div>

              )}


              {/* ================================================= */}
              {/* TAB 3 — WHAT IF */}
              {/* ================================================= */}

              {activeTab === 'simulator' && (

                <div className="space-y-6">

                  <WhatIfSimulator
                    initialIncome={
                      customerDetail.current_monthly_income
                    }
                    initialObligations={
                      customerDetail.current_obligations
                    }
                  />

                </div>

              )}


              {/* ================================================= */}
              {/* TAB 4 — AUDIT */}
              {/* ================================================= */}

              {activeTab === 'audit' && (

                <div className="space-y-6">

                  <AuditTimeline
                    events={
                      customerDetail.audit_events ||
                      []
                    }
                  />

                </div>

              )}

            </div>

          ) : (

            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">

              Select a customer from the triage queue
              to inspect case details.

            </div>

          )}

        </div>

      </div>

    </div>
  );
}