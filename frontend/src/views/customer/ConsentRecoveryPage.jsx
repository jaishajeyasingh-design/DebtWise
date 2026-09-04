import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import RecoveryTracker from '../../components/customer/RecoveryTracker';
import ConsentModal from '../../components/customer/ConsentModal';
import LLMExplanationCard from '../../components/common/LLMExplanationCard';
import CustomerTradeoffsCard from '../../components/common/CustomerTradeoffsCard';
import FinancialResiliencePlanner from '../../components/resilience/FinancialResiliencePlanner';

export default function ConsentRecoveryPage({
  data,
  selectedIntervention,
  consentGranted,
  isConsentModalOpen,
  onOpenConsent,
  onCloseConsent,
  onConfirmConsent,
  onRequestHuman,
  onBack,
  onNext
}) {
  const governance = data?.governance || {};
  const consentGate = governance?.customer_consent_gate || {};
  const humanGate = governance?.human_approval_gate || {};
  const explanation = data?.llm_explanation;

  const humanApprovalRequired =
    governance?.human_approval_required ??
    humanGate?.required ??
    false;

  const consentStatus = consentGranted
    ? 'CONSENT_CONFIRMED'
    : consentGate?.status || 'PENDING_CUSTOMER_CONSENT';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950/20">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Step 06 · Consent & Recovery
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Customer Control Before Action
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              No intervention is executed merely because the AI recommends it.
              Consent and, where required, human approval remain explicit gates.
            </p>
          </div>

          <div className={`px-3 py-2 rounded-xl font-mono text-xs font-bold ${
            consentGranted
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
          }`}>
            {consentGranted ? 'CONSENT CONFIRMED' : 'CONSENT REQUIRED'}
          </div>
        </div>

        {selectedIntervention && (
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Selected Plan
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {selectedIntervention.name ||
                selectedIntervention.title ||
                selectedIntervention.label ||
                'Selected intervention'}
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              {selectedIntervention.description ||
                'Intervention selected for customer review.'}
            </p>
          </div>
        )}

        {selectedIntervention && (
          <div className="mb-6">
            <CustomerTradeoffsCard
              selectedIntervention={selectedIntervention}
            />
          </div>
        )}

        {explanation && (
          <div className="mb-6">
            <LLMExplanationCard
              explanation={explanation}
              mode="consent"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <UserCheck className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Customer Consent
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {consentStatus.replaceAll('_', ' ')}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Human Approval
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {humanApprovalRequired
                ? humanGate?.status?.replaceAll('_', ' ') || 'PENDING OFFICER REVIEW'
                : 'NOT REQUIRED'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <Clock3 className="w-5 h-5 text-violet-400 mb-2" />
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Execution State
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {consentGranted && !humanApprovalRequired
                ? 'READY / SIMULATED'
                : 'BLOCKED UNTIL GATES PASS'}
            </div>
          </div>
        </div>

        {!consentGranted && selectedIntervention && (
          <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
            <h3 className="text-sm font-bold text-white">
              Review before giving consent
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              You can accept the selected intervention, choose another option,
              or request human support. Consent is voluntary.
            </p>

            <button
              onClick={onOpenConsent}
              className="mt-4 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition"
            >
              Review & Give Consent
            </button>
          </div>
        )}

        {consentGranted && (
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Consent recorded for this demo session
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Any contractual or higher-risk action remains subject to its
                  required human approval gate.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <RecoveryTracker customer={data} />
      
      <FinancialResiliencePlanner
        customerData={data}
        selectedIntervention={selectedIntervention}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Simulator
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition"
        >
          Continue to Audit Trail
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <ConsentModal
        isOpen={isConsentModalOpen}
        intervention={selectedIntervention}
        onClose={onCloseConsent}
        onConfirmConsent={onConfirmConsent}
        onRequestHumanHelp={onRequestHuman}
        onChooseAnother={onCloseConsent}
      />
    </div>
  );
}
