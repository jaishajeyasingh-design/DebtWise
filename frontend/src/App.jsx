import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import BankDashboard from './views/BankDashboard';
import CustomerJourney from './views/CustomerJourney';
import { Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'priya'

  return (
    <div className="min-h-screen flex flex-col bg-[#080D1E] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* Subtle Background Glow Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-glow"></div>
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
      </div>

      {/* Main Navbar */}
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      {/* Main App Container */}
      <main className="flex-1 z-10">
        {activeView === 'dashboard' ? (
          <BankDashboard onOpenPriyaDemo={() => setActiveView('priya')} />
        ) : (
          <CustomerJourney onReturnToDashboard={() => setActiveView('dashboard')} />
        )}
      </main>

      {/* Footer */}
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
