import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import LoginPage from './views/LoginPage';
import CustomerIntelligence from './views/CustomerIntelligence';
import CustomerOnboarding from './views/CustomerOnboarding';
import CustomerJourney from './views/CustomerJourney';
import BankDashboard from './views/BankDashboard';
import { Shield } from 'lucide-react';
import { api } from './api/mockApi';
import { buildCustomerTimeSeriesPayload } from './utils/customerPayloadBuilder';

export default function App() {
  // Theme Management (Light & Dark Mode) with localStorage persistence
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debtwise_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      // Default to dark mode for bank operations console
      return 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('debtwise_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Primary Bank Operations workflow starts on 'login'
  const [activeView, setActiveView] = useState('login'); // 'login' | 'intelligence' | 'onboarding' | 'journey' | 'dashboard'
  const [activeCustomerData, setActiveCustomerData] = useState(null);
  const [onboardingInitialData, setOnboardingInitialData] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Navigate to optional Manual Exception Intake with prefill data
  const handleStartManualIntake = (initialData = {}) => {
    setOnboardingInitialData(initialData);
    setAnalysisError(null);
    setActiveView('onboarding');
  };

  // Perform live analysis against authoritative backend /api/v1/analyze
  const handleAnalyzeCustomer = async (presetOrData) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const payload = buildCustomerTimeSeriesPayload(presetOrData);
      const result = await api.analyzeCustomer(payload);

      setActiveCustomerData(result);
      setActiveView('journey');
    } catch (err) {
      console.error('Customer analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze customer on the live decision engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit 5-step manual exception form to real backend /api/v1/analyze
  const handleManualOnboardingSubmit = async (payload) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const result = await api.analyzeCustomer(payload);

      setActiveCustomerData(result);
      setActiveView('journey');
    } catch (err) {
      console.error('Manual exception submission error:', err);
      setAnalysisError(err.message || 'Failed to submit customer data to the live decision engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative transition-colors duration-200">
      {/* Subtle Ambient Background Glows (Using Canonical Tailwind Sizing) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-70">
        <div className="absolute top-0 left-1/4 w-150 h-150 bg-blue-600/10 rounded-full blur-[140px] animate-pulse-glow"></div>
        <div className="absolute bottom-10 right-1/4 w-125 h-125 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
      </div>

      {/* Top Navbar with Global Theme Switcher */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onStartNewAssessment={() => setActiveView('intelligence')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main App Container */}
      <main className="flex-1 z-10">
        {activeView === 'login' && (
          <LoginPage
            onContinueToIntelligence={() => setActiveView('intelligence')}
            onStartOnboarding={handleStartManualIntake}
            onQuickAnalyze={handleAnalyzeCustomer}
            onOpenDashboard={() => setActiveView('dashboard')}
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeView === 'intelligence' && (
          <CustomerIntelligence
            onAnalyzeCustomer={handleAnalyzeCustomer}
            onStartManualIntake={() => handleStartManualIntake({})}
            onOpenDashboard={() => setActiveView('dashboard')}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            onClearError={() => setAnalysisError(null)}
          />
        )}

        {activeView === 'onboarding' && (
          <CustomerOnboarding
            initialData={onboardingInitialData}
            onSubmitToBackend={handleManualOnboardingSubmit}
            onBackToLogin={() => setActiveView('intelligence')}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            onClearError={() => setAnalysisError(null)}
          />
        )}

        {(activeView === 'journey' || activeView === 'priya') && (
          <CustomerJourney
            customerData={activeCustomerData}
            onReturnToDashboard={() => setActiveView('dashboard')}
            onNewAssessment={() => setActiveView('intelligence')}
          />
        )}

        {activeView === 'dashboard' && (
          <BankDashboard
            onOpenPriyaDemo={() => {
              setActiveCustomerData(null);
              setActiveView('journey');
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="z-10 border-t border-slate-300/80 dark:border-slate-800/80 glass-panel bg-white/80 dark:bg-slate-950/80 py-6 text-xs text-slate-500 dark:text-slate-400 font-mono transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>DebtWise AI/ML Distress Intervention Engine • Bank Decision Support Platform</span>
          </div>
          <div>
            <span>Diagnosis Before Treatment • Strict Responsible AI Guardrails</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
