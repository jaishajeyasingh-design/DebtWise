import React from 'react';
import { Shield, LayoutDashboard, UserCheck, Sparkles, Activity } from 'lucide-react';

export default function Navbar({ activeView, setActiveView }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Shield className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-display text-xl font-black text-white tracking-tight">
              <span>Debt</span><span className="text-cyan-400">Wise</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider uppercase -mt-1">
              Distress Intervention Engine
            </div>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'dashboard'
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Bank Operations Console</span>
          </button>

          <button
            onClick={() => setActiveView('priya')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all relative ${
              activeView === 'priya'
                ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <UserCheck className="w-3.5 h-3.5" />
            <span>Customer Journey (Priya Demo)</span>
          </button>
        </div>

        {/* Live System Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>XGBoost + SHAP Live</span>
        </div>
      </div>
    </header>
  );
}
