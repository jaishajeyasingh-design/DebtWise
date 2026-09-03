import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import LoginPage from './views/LoginPage';
import CustomerOnboarding from './views/CustomerOnboarding';
import CustomerJourney from './views/CustomerJourney';
import BankDashboard from './views/BankDashboard';
import { Shield } from 'lucide-react';
import { api } from './api/mockApi';
import { buildCustomerTimeSeriesPayload } from './utils/customerPayloadBuilder';

export default function App() {
  const [activeView, setActiveView] = useState('login'); // 'login' | 'onboarding' | 'journey' | 'dashboard'
  const [activeCustomerData, setActiveCustomerData] = useState(null);
  const [onboardingInitialData, setOnboardingInitialData] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Navigate to Onboarding with optional prefill data
  const handleStartOnboarding = (initialData = {}) => {
    setOnboardingInitialData(initialData);
    setAnalysisError(null);
    setActiveView('onboarding');
  };

  // Perform instant live analysis on backend from Login demo shortcuts
  const handleQuickAnalyze = async (presetOrData) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const payload = buildCustomerTimeSeriesPayload(presetOrData);
      const result = await api.analyzeCustomer(payload);

      setActiveCustomerData(result);
      setActiveView('journey');
    } catch (err) {
      console.error('Quick analyze error:', err);
      setAnalysisError(err.message || 'Failed to analyze customer on the live decision engine.');
      setActiveView('onboarding');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit 5-step onboarding form to real backend /api/v1/analyze
  const handleOnboardingSubmit = async (payload) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const result = await api.analyzeCustomer(payload);

      setActiveCustomerData(result);
      setActiveView('journey');
    } catch (err) {
      console.error('Onboarding submission error:', err);
      setAnalysisError(err.message || 'Failed to submit customer data to the live decision engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080D1E] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* Subtle Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-glow"></div>
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
      </div>

      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onStartNewAssessment={() => handleStartOnboarding({})}
      />

      {/* Main App Container */}
      <main className="flex-1 z-10">
        {activeView === 'login' && (
          <LoginPage
            onStartOnboarding={handleStartOnboarding}
            onQuickAnalyze={handleQuickAnalyze}
            onOpenDashboard={() => setActiveView('dashboard')}
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeView === 'onboarding' && (
          <CustomerOnboarding
            initialData={onboardingInitialData}
            onSubmitToBackend={handleOnboardingSubmit}
            onBackToLogin={() => setActiveView('login')}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            onClearError={() => setAnalysisError(null)}
          />
        )}

        {(activeView === 'journey' || activeView === 'priya') && (
          <CustomerJourney
            customerData={activeCustomerData}
            onReturnToDashboard={() => setActiveView('dashboard')}
            onNewAssessment={() => setActiveView('login')}
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
      <footer className="z-10 border-t border-slate-800/80 glass-panel bg-slate-950/80 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>DebtWise AI/ML Distress Intervention Engine • Hackathon Prototype</span>
          </div>
          <div>
            <span>Diagnosis Before Treatment • Strict Responsible AI Guardrails</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
