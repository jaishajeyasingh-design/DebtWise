import React, { useState } from 'react';
import { ShieldCheck, Check, X, AlertCircle, PhoneCall, ArrowLeft, Lock } from 'lucide-react';
import RiskBadge from '../common/RiskBadge';

export default function ConsentModal({
  isOpen,
  onClose,
  intervention,
  onConfirmConsent,
  onRequestHumanHelp,
  onChooseAnother
}) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !intervention) return null;

  const handleConfirm = async () => {
    if (!agreedToTerms) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600)); // Smooth UI transition
    setIsSubmitting(false);
    onConfirmConsent && onConfirmConsent(intervention);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.15)] max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider">
              <span>Step 08 • Customer Informed Consent</span>
            </div>
            <h3 className="text-2xl font-bold text-white mt-0.5">Review & Confirm Your Choice</h3>
          </div>
        </div>

        {/* Selected Plan Summary Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-cyan-400">
              {intervention.level} • {intervention.level_name}
            </span>
            <RiskBadge type="tier" value={intervention.tier} />
          </div>
          <h4 className="text-lg font-bold text-white">{intervention.title}</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{intervention.summary}</p>

          {/* Separate Intervention Components */}
          {intervention.components && intervention.components.length > 0 && (
            <div className="mt-3.5 space-y-2 pt-3 border-t border-slate-800">
              <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                Included Action Components:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {intervention.components.map((comp, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      {comp.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{comp.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policy Approval Condition Note */}
          <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Subject to: <strong>Pre-approved policy band / human approval where required.</strong></span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs">
            <span className="text-slate-400">New Monthly Obligation:</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              ₹{intervention.monthly_payment_after.toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>

        {/* Responsible AI & Rights Disclosure */}
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Zero Adverse Bureau Reporting:</strong>
              This is a proactive, reversible relief concession. It does not negatively report to credit bureaus or permanently alter your loan contract.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed font-mono">
            ⚠ <strong>TRANSPARENCY NOTICE:</strong> Simulated estimate — not a guaranteed outcome. You have the right to cancel or modify this plan at any time.
          </div>
        </div>

        {/* Checkbox Consent */}
        <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 cursor-pointer hover:border-slate-700 transition mb-6">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-800 border-slate-700 cursor-pointer"
          />
          <span className="text-xs text-slate-300 leading-relaxed">
            I understand and consent to the terms of this financial relief intervention. I understand that date adjustments will execute immediately, and temporary payment reduction will be routed to my dedicated loan officer for validation.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onRequestHumanHelp}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
            <span>Talk to a Human Specialist</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onChooseAnother}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Choose Another Option
            </button>
            <button
              disabled={!agreedToTerms || isSubmitting}
              onClick={handleConfirm}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
                agreedToTerms && !isSubmitting
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Activating..." : "Confirm & Activate Relief"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
