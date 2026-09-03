import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  PhoneCall,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

import { api } from '../api/mockApi';

import DiagnosisPage from './customer/DiagnosisPage';
import AffordabilityPage from './customer/AffordabilityPage';
import SafetyEnginePage from './customer/SafetyEnginePage';
import InterventionPage from './customer/InterventionPage';
import WhatIfPage from './customer/WhatIfPage';
import ConsentRecoveryPage from './customer/ConsentRecoveryPage';
import AuditPage from './customer/AuditPage';

const STEPS = [
  { id: 1, label: 'Diagnosis', sub: 'Root Cause' },
  { id: 2, label: 'Affordability', sub: 'Capacity Floor' },
  { id: 3, label: 'Safety Engine', sub: 'Guardrails' },
  { id: 4, label: 'Interventions', sub: 'Safe Options' },
  { id: 5, label: 'Simulator', sub: 'What-If' },
  { id: 6, label: 'Consent', sub: 'Recovery' },
  { id: 7, label: 'Audit', sub: 'Governance' }
];

export default function CustomerJourney({
  customerData: initialCustomerData = null,
  onReturnToDashboard,
  onNewAssessment
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerData, setCustomerData] = useState(initialCustomerData);
  const [selectedIntervention, setSelectedIntervention] = useState(
    initialCustomerData?.selected_intervention ||
    initialCustomerData?.safe_interventions?.[0] ||
    null
  );
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [humanHelpRequested, setHumanHelpRequested] = useState(false);
  const [loading, setLoading] = useState(!initialCustomerData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialCustomerData) {
      setCustomerData(initialCustomerData);
      const recommended =
        initialCustomerData?.selected_intervention ||
        initialCustomerData?.safe_interventions?.[0] ||
        null;
      setSelectedIntervention(recommended);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadCustomer() {
      try {
        setLoading(true);
        setError(null);

        const result = await api.getCustomerDetails('CUST_PRIYA_34');

        if (!mounted) return;

        setCustomerData(result);

        const recommended =
          result?.selected_intervention ||
          result?.safe_interventions?.[0] ||
          null;

        setSelectedIntervention(recommended);
      } catch (err) {
        console.error('Failed to load customer details:', err);

        if (mounted) {
          setError('Unable to load the live customer analysis.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCustomer();

    return () => {
      mounted = false;
    };
  }, [initialCustomerData]);

  const goNext = () => {
    setCurrentStep((step) => Math.min(7, step + 1));
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(1, step - 1));
  };

  const handleSelectIntervention = (intervention) => {
    setSelectedIntervention(intervention);
  };

  const handleOpenConsent = () => {
    if (selectedIntervention) {
      setIsConsentModalOpen(true);
    }
  };

  const handleConfirmConsent = () => {
    setConsentGranted(true);
    setIsConsentModalOpen(false);
  };

  const handleRequestHuman = () => {
    setHumanHelpRequested(true);
    setIsConsentModalOpen(false);
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setConsentGranted(false);
    setIsConsentModalOpen(false);
    setHumanHelpRequested(false);

    const recommended =
      customerData?.selected_intervention ||
      customerData?.safe_interventions?.[0] ||
      null;

    setSelectedIntervention(recommended);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="glass-panel rounded-3xl p-10 border border-cyan-500/20 bg-slate-950/70 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Loading Customer DebtWise Analysis
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-2">
            Running diagnosis, affordability, safety and intervention engines...
          </p>
        </div>
      </div>
    );
  }

  if (error || !customerData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="glass-panel rounded-3xl p-8 border border-rose-500/30 bg-slate-950/80 text-center">
          <h2 className="text-xl font-bold text-white">
            Unable to load customer analysis
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {error || 'No customer data was returned by the backend.'}
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            {onNewAssessment && (
              <button
                onClick={onNewAssessment}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono"
              >
                New Assessment
              </button>
            )}
            <button
              onClick={onReturnToDashboard}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
            >
              Return to Bank Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const customer = customerData.customer || customerData || {};
  const customerName = customerData.name || customer.name || 'Customer';
  const customerId = customerData.customer_id || customer.customer_id || 'CUST_DEMO';
  const diagnosisCause = customerData.diagnosis?.primary_cause || 'DISTRESS';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 animate-fadeIn">

      {/* Customer Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-700/80 bg-slate-950/70">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold">
              <User className="w-5 h-5" />
            </div>

            <div>
              <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span>{customerName}</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                  {diagnosisCause.replace(/_/g, ' ')}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                  REAL ML RESPONSE
                </span>
              </div>

              <div className="text-xs font-mono text-slate-400 mt-0.5">
                {customerId} · Personalized Recovery Journey
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
            {onNewAssessment && (
              <button
                onClick={onNewAssessment}
                className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Assessment</span>
              </button>
            )}

            <button
              onClick={onReturnToDashboard}
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Bank Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-700/80 bg-slate-950/70">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((step) => {
            const active = currentStep === step.id;
            const complete = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`shrink-0 min-w-[115px] px-3 py-2.5 rounded-xl border transition text-left ${
                  active
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : complete
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="text-[10px] font-mono font-bold">
                  0{step.id}
                </div>
                <div className="text-xs font-bold mt-0.5">
                  {step.label}
                </div>
                <div className="text-[9px] font-mono opacity-70 mt-0.5">
                  {step.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Page */}
      {currentStep === 1 && (
        <DiagnosisPage
          data={customerData}
          onBack={onNewAssessment || onReturnToDashboard}
          onNext={goNext}
        />
      )}

      {currentStep === 2 && (
        <AffordabilityPage
          data={customerData}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {currentStep === 3 && (
        <SafetyEnginePage
          data={customerData}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {currentStep === 4 && (
        <InterventionPage
          data={customerData}
          selectedIntervention={selectedIntervention}
          onSelect={handleSelectIntervention}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {currentStep === 5 && (
        <WhatIfPage
          data={customerData}
          selectedIntervention={selectedIntervention}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {currentStep === 6 && (
        <ConsentRecoveryPage
          data={customerData}
          selectedIntervention={selectedIntervention}
          consentGranted={consentGranted}
          isConsentModalOpen={isConsentModalOpen}
          onOpenConsent={handleOpenConsent}
          onCloseConsent={() => setIsConsentModalOpen(false)}
          onConfirmConsent={handleConfirmConsent}
          onRequestHuman={handleRequestHuman}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {currentStep === 7 && (
        <AuditPage
          data={customerData}
          onBack={goBack}
        />
      )}

      {/* Previous / Next Controls */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={currentStep === 1}
          className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-[10px] font-mono text-slate-500">
          PAGE {currentStep} / {STEPS.length}
        </div>

        {currentStep < 7 ? (
          <button
            onClick={goNext}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={resetDemo}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono flex items-center gap-2 transition"
          >
            Restart
          </button>
        )}
      </div>

      {/* Human Help Modal */}
      {humanHelpRequested && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border border-cyan-500/40 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white">
              Human Specialist Requested
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mt-3">
              This hackathon prototype records the request locally for the demo.
              A real bank deployment would route the case to an authorized hardship specialist.
            </p>

            <button
              onClick={() => setHumanHelpRequested(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
