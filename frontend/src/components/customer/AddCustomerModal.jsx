import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Shield,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Calendar,
  CreditCard,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { createCustomerFromForm } from '../../utils/customerPayloadBuilder';

export default function AddCustomerModal({
  isOpen,
  onClose,
  onCustomerAdded,
  existingCustomers = []
}) {
  const initialFormState = {
    customerId: '',
    name: '',
    age: '36',
    monthlyIncome: '70000',
    essentialExpenses: '32000',
    discretionaryExpenses: '10000',
    monthlyObligations: '22000',
    totalDebt: '400000',
    savings: '30000',
    creditLimit: '120000',
    creditBalance: '35000',
    salaryDay: '1',
    emiDueDay: '5',
    paymentDelays: '0',
    overdraftCount: '0',
    minPaymentFlag: false
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePrefillSample = () => {
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setForm({
      customerId: `CUST_VIKRAM_${randomSuffix}`,
      name: `Vikram Malhotra`,
      age: '38',
      monthlyIncome: '75000',
      essentialExpenses: '34000',
      discretionaryExpenses: '11000',
      monthlyObligations: '24000',
      totalDebt: '450000',
      savings: '28000',
      creditLimit: '150000',
      creditBalance: '42000',
      salaryDay: '1',
      emiDueDay: '5',
      paymentDelays: '1',
      overdraftCount: '0',
      minPaymentFlag: false
    });
    setErrors({});
  };

  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name = 'Customer name is required';
    }

    const custId = form.customerId.trim().toUpperCase();
    if (!custId) {
      errs.customerId = 'Customer ID is required';
    } else {
      const isDuplicate = existingCustomers.some(
        (c) => (c.customer_id || '').toUpperCase() === custId
      );
      if (isDuplicate) {
        errs.customerId = 'A customer with this ID already exists';
      }
    }

    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      errs.age = 'Age must be between 18 and 100';
    }

    const incomeNum = Number(form.monthlyIncome);
    if (!form.monthlyIncome || isNaN(incomeNum) || incomeNum <= 0) {
      errs.monthlyIncome = 'Monthly income must be greater than 0';
    }

    const essentialsNum = Number(form.essentialExpenses);
    if (form.essentialExpenses === '' || isNaN(essentialsNum) || essentialsNum < 0) {
      errs.essentialExpenses = 'Essential expenses must be 0 or greater';
    }

    const discretionaryNum = Number(form.discretionaryExpenses);
    if (form.discretionaryExpenses !== '' && (isNaN(discretionaryNum) || discretionaryNum < 0)) {
      errs.discretionaryExpenses = 'Must be 0 or greater';
    }

    const obligationsNum = Number(form.monthlyObligations);
    if (form.monthlyObligations === '' || isNaN(obligationsNum) || obligationsNum < 0) {
      errs.monthlyObligations = 'Monthly obligations must be 0 or greater';
    }

    const debtNum = Number(form.totalDebt);
    if (form.totalDebt === '' || isNaN(debtNum) || debtNum < 0) {
      errs.totalDebt = 'Total debt must be 0 or greater';
    }

    const savingsNum = Number(form.savings);
    if (form.savings === '' || isNaN(savingsNum) || savingsNum < 0) {
      errs.savings = 'Savings must be 0 or greater';
    }

    const limitNum = Number(form.creditLimit);
    if (form.creditLimit === '' || isNaN(limitNum) || limitNum < 0) {
      errs.creditLimit = 'Credit limit must be 0 or greater';
    }

    const balanceNum = Number(form.creditBalance);
    if (form.creditBalance === '' || isNaN(balanceNum) || balanceNum < 0) {
      errs.creditBalance = 'Credit balance must be 0 or greater';
    } else if (limitNum > 0 && balanceNum > limitNum * 1.5) {
      errs.creditBalance = 'Credit balance exceeds credit limit by more than 150%';
    }

    const salaryDayNum = Number(form.salaryDay);
    if (!form.salaryDay || isNaN(salaryDayNum) || salaryDayNum < 1 || salaryDayNum > 31) {
      errs.salaryDay = 'Day must be between 1 and 31';
    }

    const emiDayNum = Number(form.emiDueDay);
    if (!form.emiDueDay || isNaN(emiDayNum) || emiDayNum < 1 || emiDayNum > 31) {
      errs.emiDueDay = 'Day must be between 1 and 31';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 300)); // Smooth UX transition

    const newCustomer = createCustomerFromForm(form);
    setIsSubmitting(false);

    if (onCustomerAdded) {
      onCustomerAdded(newCustomer);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-3xl w-full border theme-border shadow-2xl max-h-[92vh] overflow-y-auto relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                  Bank Hardship Intake
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                  SIMULATED RECORD
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black theme-text mt-0.5">
                Add Customer for Distress Analysis
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrefillSample}
            className="px-3 py-1.5 rounded-xl theme-surface-muted theme-border text-xs font-mono text-cyan-400 hover:theme-text transition flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prefill Sample</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Customer Profile */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>01. Customer Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Customer ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  placeholder="e.g. CUST_VIKRAM_38"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.customerId ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.customerId && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.customerId}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.name ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.name && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Age <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="38"
                  min="18"
                  max="100"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.age ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.age && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.age}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Monthly Cash Flow */}
          <div className="space-y-3 pt-2 border-t theme-border-subtle">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>02. Monthly Cash Flow</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Monthly Income (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="70000"
                  min="1"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.monthlyIncome ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.monthlyIncome && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.monthlyIncome}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Essential Expenses (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.essentialExpenses}
                  onChange={(e) => handleInputChange('essentialExpenses', e.target.value)}
                  placeholder="30000"
                  min="0"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.essentialExpenses ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.essentialExpenses && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.essentialExpenses}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Discretionary Spend (₹)
                </label>
                <input
                  type="number"
                  value={form.discretionaryExpenses}
                  onChange={(e) => handleInputChange('discretionaryExpenses', e.target.value)}
                  placeholder="10000"
                  min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Active EMIs / Mo (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.monthlyObligations}
                  onChange={(e) => handleInputChange('monthlyObligations', e.target.value)}
                  placeholder="22000"
                  min="0"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.monthlyObligations ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.monthlyObligations && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.monthlyObligations}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Debt & Liquidity */}
          <div className="space-y-3 pt-2 border-t theme-border-subtle">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>03. Debt & Liquidity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Total Outstanding Debt (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.totalDebt}
                  onChange={(e) => handleInputChange('totalDebt', e.target.value)}
                  placeholder="400000"
                  min="0"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.totalDebt ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.totalDebt && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.totalDebt}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Liquid Savings (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.savings}
                  onChange={(e) => handleInputChange('savings', e.target.value)}
                  placeholder="30000"
                  min="0"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.savings ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.savings && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.savings}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Credit Card Limit (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.creditLimit}
                  onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                  placeholder="120000"
                  min="0"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.creditLimit ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.creditLimit && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.creditLimit}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Credit Card Balance (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.creditBalance}
                  onChange={(e) => handleInputChange('creditBalance', e.target.value)}
                  placeholder="35000"
                  min="0"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.creditBalance ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.creditBalance && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.creditBalance}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Payment Behaviour & Timing */}
          <div className="space-y-3 pt-2 border-t theme-border-subtle">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>04. Payment Behaviour & Timing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Salary Credit Day (1–31) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.salaryDay}
                  onChange={(e) => handleInputChange('salaryDay', e.target.value)}
                  min="1"
                  max="31"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.salaryDay ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.salaryDay && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.salaryDay}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  EMI Due Day (1–31) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.emiDueDay}
                  onChange={(e) => handleInputChange('emiDueDay', e.target.value)}
                  min="1"
                  max="31"
                  className={`w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 ${
                    errors.emiDueDay ? 'border-rose-500 ring-1 ring-rose-500/50' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.emiDueDay && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    {errors.emiDueDay}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Payment Delays (Months)
                </label>
                <input
                  type="number"
                  value={form.paymentDelays}
                  onChange={(e) => handleInputChange('paymentDelays', e.target.value)}
                  min="0"
                  max="12"
                  className="w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1">
                  Overdraft Count (Months)
                </label>
                <input
                  type="number"
                  value={form.overdraftCount}
                  onChange={(e) => handleInputChange('overdraftCount', e.target.value)}
                  min="0"
                  max="12"
                  className="w-full px-3.5 py-2.5 rounded-xl theme-input text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Minimum Payment Flag Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl theme-surface-muted theme-border cursor-pointer hover:border-cyan-500/40 transition">
                <input
                  type="checkbox"
                  checked={form.minPaymentFlag}
                  onChange={(e) => handleInputChange('minPaymentFlag', e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-800 border-slate-700 cursor-pointer"
                />
                <div className="text-xs font-mono">
                  <span className="theme-text font-bold block">
                    Minimum Payment Warning Flag
                  </span>
                  <span className="theme-text-muted text-[11px]">
                    Customer is currently making only minimum due payments on credit cards
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Responsible Data Minimization Banner */}
          <div className="p-3.5 rounded-xl theme-surface-muted theme-border text-xs text-slate-400 flex items-start gap-2.5 font-sans">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="theme-text">Responsible Data Minimization:</strong> No invasive PII (Aadhaar, PAN, bank account numbers, phone, or home address) is collected. The record is processed securely in session for AI early distress triage.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl theme-surface-muted theme-border theme-text hover:theme-border-strong text-xs font-mono font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl theme-primary-button text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? "Saving Customer..." : "Save Customer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
