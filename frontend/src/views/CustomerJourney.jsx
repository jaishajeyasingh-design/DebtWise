import React, { useState } from 'react';
import {
  Shield,
  HeartHandshake,
  AlertCircle,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  PhoneCall,
  Sparkles,
  Lock,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';

import { PRIYA_DEMO_DATA, api } from '../api/mockApi';
import RiskBadge from '../components/common/RiskBadge';
import DistressDiagnosis from '../components/diagnosis/DistressDiagnosis';
import SHAPFactors from '../components/diagnosis/SHAPFactors';
import CapacityCard from '../components/capacity/CapacityCard';
import InterventionCard from '../components/interventions/InterventionCard';
import SafetyRejection from '../components/interventions/SafetyRejection';
import ConsentModal from '../components/customer/ConsentModal';
import RecoveryTracker from '../components/customer/RecoveryTracker';
import AuditTimeline from '../components/audit/AuditTimeline';

const STEPS = [
  { id: 1, label: "Distress Alert", sub: "Proactive Outreach" },
  { id: 2, label: "What Changed?", sub: "Expense Diagnostic" },
  { id: 3, label: "Affordability", sub: "Capacity Floor" },
  { id: 4, label: "Safety Filter", sub: "Unsafe Option Pruned" },
  { id: 5, label: "Compare Options", sub: "Safe Alternatives" },
  { id: 6, label: "Consent & Active", sub: "Recovery Tracker" }
];

export default function CustomerJourney({ onReturnToDashboard }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIntervention, setSelectedIntervention] = useState(PRIYA_DEMO_DATA.safe_interventions[0]);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [humanHelpRequested, setHumanHelpRequested] = useState(false);

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSelectIntervention = (intv) => {
    setSelectedIntervention(intv);
    setIsConsentModalOpen(true);
  };

  const handleConfirmConsent = (intv) => {
    setConsentGranted(true);
    setIsConsentModalOpen(false);
    setCurrentStep(6); // Jump to Confirmation & Recovery Monitoring
  };

  const handleRequestHuman = () => {
    setHumanHelpRequested(true);
    setIsConsentModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Mobile/Desktop Top Stepper Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-700/80 bg-slate-950/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold">
              PS
            </div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <span>Priya Sharma (Age 34)</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                  GOLDEN DEMO
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Monthly Net Income: ₹60,000 • Home Loan EMI: ₹25,000/mo
              </div>
            </div>
          </div>

          <button
            onClick={onReturnToDashboard}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition flex items-center gap-1 self-end sm:self-center"
          >
            <span>Switch to Bank Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-6 gap-1.5 pt-2 border-t border-slate-800">
          {STEPS.map((s) => {
            const isActive = currentStep === s.id;
            const isDone = currentStep > s.id;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`py-2 px-1 text-center rounded-lg transition text-xs font-mono flex flex-col items-center gap-0.5 ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : isDone
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-900/40 text-slate-500 border border-slate-800/60"
                }`}
              >
                <span className="text-[10px] font-bold">0{s.id}</span>
                <span className="truncate hidden sm:inline text-[11px]">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          STEP 1: PROACTIVE EMPATHETIC OUTREACH ALERT
          ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 shadow-[0_0_40px_rgba(0,240,255,0.12)] text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 mx-auto sm:mx-0">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
              Early Proactive Support Alert
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              “Hi Priya, we noticed an unexpected change in your finances this month.”
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mb-6">
              You have maintained a flawless payment track record with us. However, our early support system noticed a recent surge in hospital and medical bills that could strain your upcoming <strong>₹25,000 Home Loan EMI</strong> due on the 5th.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-mono text-slate-400 uppercase">OUR PROMISE TO YOU</div>
                <div className="text-sm font-semibold text-white mt-1">Zero Penalty Fees & No Credit Bureau Impact</div>
                <div className="text-xs text-slate-400 mt-1">This is a supportive health check to keep your budget stress-free.</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-mono text-slate-400 uppercase">YOUR RIGHTS</div>
                <div className="text-sm font-semibold text-white mt-1">100% Voluntary with Human Support</div>
                <div className="text-xs text-slate-400 mt-1">You choose what works for you, or talk directly with a human specialist.</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition"
              >
                <span>See What Changed & Review Options</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setHumanHelpRequested(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                <span>Talk to a Human Specialist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: WHAT CHANGED? (EXPENSE SHOCK DIAGNOSIS & SHAP EXPLANATION)
          ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 bg-slate-900/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase">Step 02 • Root-Cause Transparency</div>
                <h3 className="text-xl font-bold text-white mt-0.5">Why We Are Concerned</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
                AI Diagnosis: 99.4% Match
              </span>
            </div>

            <DistressDiagnosis diagnosis={PRIYA_DEMO_DATA.diagnosis} showProbabilities={false} />
            <div className="my-6">
              <SHAPFactors factors={PRIYA_DEMO_DATA.diagnosis.top_factors} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <span>Next: Calculate True Affordability</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: SUSTAINABLE REPAYMENT CAPACITY
          ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 bg-slate-900/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-mono text-emerald-400 uppercase">Step 03 • Affordability Floor</div>
                <h3 className="text-xl font-bold text-white mt-0.5">What Can You Realistically Afford?</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                Sustainable Floor: ₹15,000/mo
              </span>
            </div>

            <CapacityCard customer={PRIYA_DEMO_DATA} />

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mt-6 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">The Financial Protection Boundary:</strong>
                Because your calculated sustainable capacity is <strong>₹15,000/month</strong>, DebtWise will NOT recommend any solution requiring more than ₹15,000 during your 3-month recovery window.
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <span>Next: Safety Filter in Action</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: SAFETY FILTER IN ACTION (WOW DEMO)
          ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 bg-slate-900/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-mono text-rose-400 uppercase">Step 04 • The Safety Filter</div>
                <h3 className="text-xl font-bold text-white mt-0.5">Protecting You from Unsafe Debt Traps</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold">
                Self-Rejecting Guardrail
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Traditional banking systems often push high-interest debt consolidation loans to distressed borrowers. <strong>DebtWise's safety engine actively evaluates and rejects its own unsafe proposals.</strong>
            </p>

            <SafetyRejection rejectionData={PRIYA_DEMO_DATA.safety_rejection} />

            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <span>Next: Compare Safe Alternatives</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 5: COMPARE SAFE OPTIONS & RECOMMENDATION
          ========================================================================= */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase">Step 05 • Choice & Comparison</div>
                <h3 className="text-xl font-bold text-white mt-0.5">Select a Safe Relief Option</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                3 Safe Options Filtered
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Choose the option that best fits your recovery timeline. You can accept, modify, or consult directly with a hardship specialist.
            </p>

            <div className="space-y-4">
              {PRIYA_DEMO_DATA.safe_interventions.map((intv) => (
                <InterventionCard
                  key={intv.id}
                  intervention={intv}
                  isSelected={selectedIntervention?.id === intv.id}
                  onSelect={handleSelectIntervention}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setIsConsentModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              >
                <span>Proceed with Selected Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 6: CONFIRMATION, RECOVERY MONITORING & AUDIT TRAIL
          ========================================================================= */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Confirmation Success Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-slate-950 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
              Consent Confirmed & Protocol Activated
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Relief Plan Successfully Activated!
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
              Your <strong>Payment-Date Adjustment</strong> (1st ➔ 7th) is active immediately post-consent, and your <strong>Temporary Payment Reduction</strong> to <strong>₹15,000/month</strong> is approved under pre-approved policy band parameters.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left mb-6 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px]">Payment-Date Adjustment</span>
                <span className="text-emerald-400 font-bold text-sm">Due Date: 7th</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Tier A • Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px]">Temporary Payment Reduction</span>
                <span className="text-cyan-400 font-bold text-sm">₹15,000 / mo (3 Mo)</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Tier B • Policy Band</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px]">Reversibility & Rights</span>
                <span className="text-white font-bold text-sm">Cancel Anytime</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Zero Bureau Penalty</span>
              </div>
            </div>
          </div>

          {/* Recovery Trajectory Tracker */}
          <RecoveryTracker projectionData={PRIYA_DEMO_DATA.recovery_projection} />

          {/* Audit Timeline */}
          <AuditTimeline events={PRIYA_DEMO_DATA.audit_events} />

          {/* Reset / Return Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <button
              onClick={() => {
                setCurrentStep(1);
                setConsentGranted(false);
              }}
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restart Priya Demo from Step 1</span>
            </button>

            <button
              onClick={onReturnToDashboard}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 transition shadow-md"
            >
              <span>Return to Bank Operations Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Human Specialist Escalation Drawer / Modal */}
      {humanHelpRequested && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border border-cyan-500/40 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Connecting with Hardship Specialist</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your case dossier has been packaged with your SHAP diagnostic history and routed to our dedicated Vulnerability Care Team. A specialist will call you at <strong>+91 98765 43210</strong> within 30 minutes.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 text-xs font-mono text-cyan-300 border border-slate-800">
              Case Ref: HARDSHIP-PRIYA-8492
            </div>
            <button
              onClick={() => setHumanHelpRequested(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* Customer Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        intervention={selectedIntervention}
        onClose={() => setIsConsentModalOpen(false)}
        onConfirmConsent={handleConfirmConsent}
        onRequestHumanHelp={handleRequestHuman}
        onChooseAnother={() => setIsConsentModalOpen(false)}
      />
    </div>
  );
}
