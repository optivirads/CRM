'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Receipt,
  Layers,
  BarChart2,
  Briefcase,
  CheckSquare,
  Clock,
  DollarSign,
  ShieldAlert,
  Laptop,
  X
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, concurrentNotice, clearConcurrentNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password.trim(), rememberMe);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans select-none bg-[#050911] text-[#F8FAFC]">
      {/* ========================================================================= */}
      {/* 1. LAYER 1: VIBRANT SIMULATED AGENCY DASHBOARD (Frosted Under Glass)      */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 flex pointer-events-none opacity-40 dark:opacity-30 filter blur-[9px] scale-[1.03] transition-all duration-700"
        aria-hidden="true"
      >
        {/* Mock Sidebar */}
        <aside className="w-64 bg-[#0A1628] border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/60 p-1 flex items-center justify-center">
                <img src="/icon.png" alt="OptiVir CRM" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">OptiVir CRM</div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="px-3 py-2 rounded-xl bg-rose-950/40 text-rose-300 font-bold flex items-center space-x-2 border border-rose-900/30">
                <BarChart2 className="w-4 h-4" />
                <span>Executive Dashboard</span>
              </div>
              <div className="px-3 py-2 rounded-xl text-slate-400 flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>Client 360° Profile</span>
              </div>
              <div className="px-3 py-2 rounded-xl text-slate-400 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Deal Pipeline Kanban</span>
              </div>
              <div className="px-3 py-2 rounded-xl text-slate-400 flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Service Delivery</span>
              </div>
              <div className="px-3 py-2 rounded-xl text-slate-400 flex items-center space-x-2">
                <Receipt className="w-4 h-4" />
                <span>GST Invoicing Ledger</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 text-[11px]">
            <div className="font-bold text-slate-300">Live Billable Timer</div>
            <div className="text-emerald-400 font-mono font-bold flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>02h 14m 39s Active</span>
            </div>
          </div>
        </aside>

        {/* Mock Main Dashboard Canvas */}
        <main className="flex-1 p-8 space-y-6 overflow-hidden">
          {/* Top Bar */}
          <div className="h-14 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <div className="w-48 h-7 bg-slate-800 rounded-lg" />
              <div className="w-24 h-7 bg-slate-800 rounded-lg" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-800" />
              <div className="w-8 h-8 rounded-full bg-rose-600" />
            </div>
          </div>

          {/* 4 Metric KPI Strip */}
          <div className="grid grid-cols-4 gap-4">
            <div className="h-28 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="text-xs text-slate-400">Total Attributed Revenue</div>
              <div className="text-2xl font-black text-white">₹48,25,000</div>
              <div className="text-xs text-emerald-400 font-semibold">+18.4% vs last month</div>
            </div>
            <div className="h-28 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="text-xs text-slate-400">Active Retainer Clients</div>
              <div className="text-2xl font-black text-white">142 Accounts</div>
              <div className="text-xs text-blue-400 font-semibold">94/100 Avg Health Factor</div>
            </div>
            <div className="h-28 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="text-xs text-slate-400">Blended ROAS Multiple</div>
              <div className="text-2xl font-black text-rose-400">4.82x Blended</div>
              <div className="text-xs text-slate-400 font-semibold">Across Meta &amp; Google</div>
            </div>
            <div className="h-28 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="text-xs text-slate-400">GST Invoice Collections</div>
              <div className="text-2xl font-black text-emerald-400">₹14,80,000</div>
              <div className="text-xs text-slate-400 font-semibold">SAC 998361 Compliant</div>
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-4 gap-4 h-96">
            {['Discovery (20%)', 'Technical Audit (40%)', 'Proposal (60%)', 'Closed Won (100%)'].map((col, idx) => (
              <div key={idx} className="bg-slate-900/40 rounded-2xl border border-slate-800 p-3 space-y-3">
                <div className="text-xs font-bold text-slate-300">{col}</div>
                <div className="h-20 bg-slate-800/60 rounded-xl border border-slate-700/40 p-2" />
                <div className="h-20 bg-slate-800/60 rounded-xl border border-slate-700/40 p-2" />
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 2. LAYER 2: SEMI-TRANSPARENT FROSTED OVERLAY & GLOWING ACCENTS            */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060B13]/75 via-[#070D18]/80 to-[#040810]/85 backdrop-blur-md pointer-events-none" />

      {/* Ambient Radial Colored Glows that Bleed Through the Glass */}
      <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-[#DC2626]/14 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-900/18 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-purple-900/12 rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 3. LAYER 3: FLOATING SEMI-TRANSPARENT TOP & FOOTER SHELL                  */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3 bg-slate-950/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-slate-900/80 p-1 flex items-center justify-center shadow-md border border-rose-500/30">
            <img src="/icon.png" alt="OptiVir CRM" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-white">OptiVir CRM</div>
            <p className="text-[10px] text-slate-400">Indian Performance Marketing Agency Operations</p>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. LAYER 4: THE SEMI-TRANSPARENT GLASS SHIELD CARD                        */}
      {/* ========================================================================= */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          {/* Glass Card Container */}
          <div className="bg-[#0B1528]/55 dark:bg-[#071120]/50 backdrop-blur-2xl border border-white/15 dark:border-white/12 rounded-3xl p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] space-y-6 relative overflow-hidden transition-all duration-300">
            {/* Top Red Glass Reflection Highlight */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/80 to-transparent" />

            {/* Header Badge & Title */}
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-b from-rose-950/60 to-slate-950/80 border border-rose-500/30 text-rose-400 mb-1 shadow-lg shadow-rose-950/40">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Agency Command Sign-In</h1>
              <p className="text-xs text-slate-300/90 max-w-sm mx-auto leading-relaxed">
                Restricted access. Gated with session encryption, role policies, and audit logging.
              </p>
            </div>

            {/* Concurrent Session Termination Alert */}
            {concurrentNotice && (
              <div className="p-3.5 bg-amber-950/70 border border-amber-500/60 rounded-xl flex items-start space-x-2.5 text-xs text-amber-200 backdrop-blur-md animate-fadeIn">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-amber-100 flex items-center justify-between">
                    <span>Single Active System Policy</span>
                    <button 
                      type="button"
                      onClick={clearConcurrentNotice} 
                      className="text-amber-400 hover:text-white cursor-pointer p-0.5 rounded"
                      title="Dismiss notice"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-200/95 leading-relaxed">
                    {concurrentNotice}
                  </p>
                  <p className="mt-1 text-[10px] text-amber-400/90 font-mono">
                    Logging in below will register this device as your sole active system.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-700/60 rounded-xl flex items-start space-x-2.5 text-xs text-rose-200 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">Work Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@agency.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/50 hover:bg-slate-950/65 focus:bg-slate-950/80 border border-white/12 hover:border-white/20 focus:border-rose-500 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500 backdrop-blur-md transition shadow-inner"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">Access Key / Password</label>
                  <span className="text-[11px] text-slate-400 hover:text-rose-300 cursor-pointer transition">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/50 hover:bg-slate-950/65 focus:bg-slate-950/80 border border-white/12 hover:border-white/20 focus:border-rose-500 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500 backdrop-blur-md transition font-mono shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-[#DC2626] focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Persist session (7 days)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#DC2626]/95 to-[#991B1B]/95 hover:from-[#EF4444] hover:to-[#DC2626] text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950/70 border border-rose-500/40 flex items-center justify-center space-x-2 transition transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </div>
                ) : (
                  <>
                    <span>Enter Agency Command</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 select-none">
                <Laptop className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Single Active System Enforced • Automatically signs out older logins</span>
              </div>
            </form>
          </div>

          {/* Trust & Security Footnote */}
          <div className="flex items-center justify-center space-x-6 text-[11px] text-slate-400/90 pt-4">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Tenant Isolated DB</span>
            </span>
            <span>Indian GST Rule 46 Compliant</span>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. LAYER 5: SEMI-TRANSPARENT FLOATING FOOTER                              */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-white/10 gap-2 bg-slate-950/30 backdrop-blur-xl rounded-t-2xl">
        <div>© {new Date().getFullYear()} OptiVir Technologies Pvt. Ltd. • All Rights Reserved</div>
        <div className="flex items-center space-x-4">
          <span className="hover:text-white cursor-pointer transition">Security Whitepaper</span>
          <span className="hover:text-white cursor-pointer transition">GST Compliance Policy</span>
          <span className="hover:text-white cursor-pointer transition">API Status</span>
        </div>
      </footer>
    </div>
  );
};
