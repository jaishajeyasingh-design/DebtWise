import React from 'react';
import { Shield, LayoutDashboard, UserCheck, HeartHandshake, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar({
  activeView,
  setActiveView,
  onStartNewAssessment,
  theme = 'dark',
  onToggleTheme,
  authenticatedEmployee = null,
  onLogout
}) {
  const isCustomerPortal = activeView === 'intelligence' || activeView === 'login' || activeView === 'onboarding';
  const isJourney = activeView === 'journey' || activeView === 'priya';
  const isDashboard = activeView === 'dashboard';

  const handleBrandClick = () => {
    if (authenticatedEmployee) {
      setActiveView('intelligence');
    } else {
      setActiveView('login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b theme-border backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={handleBrandClick}
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Shield className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-display text-xl font-black text-white tracking-tight">
              <span>Debt</span><span className="text-cyan-400">Wise</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider uppercase -mt-1">
              FinShield Engine
            </div>
          </div>
        </div>

        {/* View Switcher Pills (Only accessible when authenticated) */}
        {authenticatedEmployee ? (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/70 border border-slate-800">
            <button
              onClick={() => setActiveView('intelligence')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isCustomerPortal
                  ? "bg-linear-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customer Intelligence</span>
              <span className="sm:hidden">Triage</span>
            </button>

            <button
              onClick={() => setActiveView('journey')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isJourney
                  ? "bg-linear-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customer Journey</span>
              <span className="sm:hidden">Journey</span>
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDashboard
                  ? "bg-linear-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bank Operations</span>
              <span className="sm:hidden">Console</span>
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-mono theme-text-muted">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bank Hardship Decision Portal · Employee Authentication</span>
          </div>
        )}

        {/* Right Action Cluster: Theme Switcher, Account Control & API Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer shadow-sm"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="hidden md:inline">Dark</span>
              </>
            )}
          </button>

          {/* Authenticated Employee Header Control */}
          {authenticatedEmployee && (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l theme-border">
              <div className="hidden sm:flex flex-col text-right font-mono">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider leading-none">
                  Employee
                </span>
                <span className="text-xs theme-text font-bold leading-tight">
                  {authenticatedEmployee.id || 'EMP-74029'}
                </span>
              </div>

              <button
                onClick={onLogout}
                type="button"
                title="Logout of Bank Session"
                className="px-2.5 py-1.5 rounded-xl theme-surface-muted theme-border theme-text hover:text-rose-400 hover:border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

          {/* Live System Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Decision Engine API Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}

