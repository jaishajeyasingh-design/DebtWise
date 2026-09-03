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
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

import { api, PORTFOLIO_STATS, MOCK_CUSTOMERS_QUEUE } from '../api/mockApi';
import RiskBadge from '../components/common/RiskBadge';
import DistressDiagnosis from '../components/diagnosis/DistressDiagnosis';
import SHAPFactors from '../components/diagnosis/SHAPFactors';
import CapacityCard from '../components/capacity/CapacityCard';
import InterventionCard from '../components/interventions/InterventionCard';
import SafetyRejection from '../components/interventions/SafetyRejection';
import AuditTimeline from '../components/audit/AuditTimeline';
import WhatIfSimulator from '../components/simulator/WhatIfSimulator';

export default function BankDashboard({ onOpenPriyaDemo }) {
  const [stats, setStats] = useState(PORTFOLIO_STATS);
  const [queue, setQueue] = useState(MOCK_CUSTOMERS_QUEUE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL');
  const [selectedCauseFilter, setSelectedCauseFilter] = useState('ALL');
  
  // Selected Customer Inspection
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUST_PRIYA_34');
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('diagnosis'); // 'diagnosis', 'interventions', 'simulator', 'audit'

  useEffect(() => {
    loadCustomer(selectedCustomerId);
  }, [selectedCustomerId]);

  const loadCustomer = async (id) => {
    setLoadingDetail(true);
    const data = await api.getCustomerDetails(id);
    setCustomerDetail(data);
    setLoadingDetail(false);
  };

  // Filter queue
  const filteredQueue = queue.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cust.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTierFilter === 'ALL' || cust.automation_tier.includes(selectedTierFilter);
    const matchesCause = selectedCauseFilter === 'ALL' || cust.distress_cause === selectedCauseFilter;
    return matchesSearch && matchesTier && matchesCause;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
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
            Proactive triage queue separating low-risk automated interventions from officer-reviewed relief concessions.
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Monitored Accounts</div>
          <div className="text-2xl font-mono font-bold text-white mt-1">14,850</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Zero-delay telemetry</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border-rose-500/30">
          <div className="text-[11px] font-mono text-rose-300 uppercase">Active Distress Cases</div>
          <div className="text-2xl font-mono font-bold text-rose-400 mt-1">342</div>
          <div className="text-[11px] text-rose-300/80 mt-0.5">Early detected cases</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border-emerald-500/30">
          <div className="text-[11px] font-mono text-emerald-300 uppercase">Tier A Auto Rate</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">58.4%</div>
          <div className="text-[11px] text-emerald-300/80 mt-0.5">Self-resolved post-consent</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border-blue-500/30">
          <div className="text-[11px] font-mono text-blue-300 uppercase">Cure Rate Lift</div>
          <div className="text-2xl font-mono font-bold text-blue-400 mt-1">+41.2%</div>
          <div className="text-[11px] text-blue-300/80 mt-0.5">vs traditional collections</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border-cyan-500/30 col-span-2 lg:col-span-1">
          <div className="text-[11px] font-mono text-cyan-300 uppercase">Defaults Prevented</div>
          <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">₹4.82 Cr</div>
          <div className="text-[11px] text-cyan-300/80 mt-0.5">Preserved balance volume</div>
        </div>
      </div>

      {/* Portfolio Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cause Distribution Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase">AI Diagnosis Telemetry</div>
              <h4 className="text-lg font-bold text-white">Portfolio Distress Cause Breakdown</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">342 Flagged Accounts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.cause_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {stats.cause_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono">
                            <div className="text-white font-bold">{payload[0].name}</div>
                            <div className="text-cyan-400">{payload[0].value} customers ({payload[0].payload.percentage}%)</div>
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
              {stats.cause_distribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-200 font-semibold">{item.name}</span>
                  </div>
                  <div className="font-mono text-slate-400">
                    <strong className="text-white">{item.count}</strong> ({item.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Automation Tiers Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase">Responsible AI Framework</div>
            <h4 className="text-lg font-bold text-white mb-3">Automation Boundary Tiers</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Hardcoded architectural boundaries dictating automated execution vs officer sign-off.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <strong className="text-emerald-400 block font-mono">Tier A (58.4%)</strong>
                <span className="text-slate-300 text-[11px]">Reversible actions after consent</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-base">200</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <strong className="text-amber-400 block font-mono">Tier B (32.1%)</strong>
                <span className="text-slate-300 text-[11px]">AI prepares, Officer approves</span>
              </div>
              <span className="font-mono text-amber-400 font-bold text-base">110</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
              <div>
                <strong className="text-rose-400 block font-mono">Tier C (9.5%)</strong>
                <span className="text-slate-300 text-[11px]">Human Hardship Specialist only</span>
              </div>
              <span className="font-mono text-rose-400 font-bold text-base">32</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Work Area: High-Risk Queue & Customer Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: High-Risk Customer Queue (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase">Triage Queue</div>
              <h3 className="text-xl font-bold text-white">High-Risk Customer Queue</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
              {filteredQueue.length} Active
            </span>
          </div>

          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Tier Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {["ALL", "Tier A", "Tier B", "Tier C"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTierFilter(tier)}
                  className={`px-3 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition ${
                    selectedTierFilter === tier
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Queue List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredQueue.map((cust) => {
              const isSelected = cust.id === selectedCustomerId;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.12)]"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{cust.name}</span>
                        {cust.id === "CUST_PRIYA_34" && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                            HERO DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {cust.id} • {cust.account_number}
                      </div>
                    </div>
                    <RiskBadge type="risk" value={cust.risk_level} />
                  </div>

                  {/* Diagnosis & Capacity summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 my-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">Diagnosed Cause</span>
                      <span className="font-semibold text-cyan-300 truncate block">
                        {cust.distress_cause.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">Sustainable Cap</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ₹{cust.sustainable_capacity.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
                    <RiskBadge type="tier" value={cust.automation_tier} />
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      {cust.status} <ChevronRight className="w-3 h-3 text-cyan-400" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer Deep-Dive Case Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {customerDetail ? (
            <div className="space-y-6">
              {/* Profile Card Banner */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-700/80 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-bold">{customerDetail.customer_id}</span>
                    <RiskBadge type="risk" value={customerDetail.risk_level} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">{customerDetail.name}</h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Age: {customerDetail.age} • Salary Day: {customerDetail.salary_day}st • EMI Due: {customerDetail.emi_due_day}th
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {customerDetail.customer_id === "CUST_PRIYA_34" && (
                    <button
                      onClick={onOpenPriyaDemo}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition"
                    >
                      <span>Simulate Customer View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inspector Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
                {[
                  { id: 'diagnosis', label: '1. AI Diagnosis & SHAP' },
                  { id: 'interventions', label: '2. Interventions & Safety' },
                  { id: 'simulator', label: '3. What-If Simulator' },
                  { id: 'audit', label: '4. Compliance Audit Trail' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-lg transition ${
                      activeTab === tab.id
                        ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Diagnosis & SHAP Factors */}
              {activeTab === 'diagnosis' && (
                <div className="space-y-6">
                  <DistressDiagnosis diagnosis={customerDetail.diagnosis} />
                  <SHAPFactors factors={customerDetail.diagnosis?.top_factors} />
                  <CapacityCard customer={customerDetail} />
                </div>
              )}

              {/* Tab 2: Interventions & Safety Filter */}
              {activeTab === 'interventions' && (
                <div className="space-y-6">
                  {/* Safety Rejection Callout */}
                  <SafetyRejection rejectionData={customerDetail.safety_rejection} />

                  {/* Candidate Interventions */}
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">Safe Candidate Interventions</h4>
                    <div className="space-y-4">
                      {customerDetail.safe_interventions.map((intv) => (
                        <InterventionCard
                          key={intv.id}
                          intervention={intv}
                          showAction={false}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: What-If Simulator */}
              {activeTab === 'simulator' && (
                <div className="space-y-6">
                  <WhatIfSimulator
                    initialIncome={customerDetail.current_monthly_income}
                    initialObligations={customerDetail.current_obligations}
                  />
                </div>
              )}

              {/* Tab 4: Compliance Audit Trail */}
              {activeTab === 'audit' && (
                <div className="space-y-6">
                  <AuditTimeline events={customerDetail.audit_events} />
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
              Select a customer from the triage queue to inspect case details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
