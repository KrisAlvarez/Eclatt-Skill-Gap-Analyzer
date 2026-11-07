import React, { useEffect, useState } from 'react';
import { Sparkles, Activity, ShieldCheck, HelpCircle, Server } from 'lucide-react';
import { api } from '../api/client';

export default function Navbar({ activeTab, setActiveTab, onOpenDefenseModal }) {
  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'cold-start' | 'offline'

  const checkServer = async () => {
    try {
      const res = await api.checkHealth();
      if (res.status === 'healthy') {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (e) {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('analyzer')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-xl text-white tracking-tight">SkillGap</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                ECLAT ML
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">IT Career Skill Gap & Association Rule Mining</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analyzer'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Skill Analyzer
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'evaluation'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Model Evaluation</span>
            <span className="sm:hidden">Benchmark</span>
          </button>

          <button
            onClick={onOpenDefenseModal}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 transition-all"
            title="Defense Presentation Guide"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden md:inline">Defense Q&A</span>
          </button>

          {/* API Health Pill */}
          <div className="hidden lg:flex items-center gap-2 pl-3 ml-2 border-l border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>API:</span>
              {serverStatus === 'online' && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live
                </span>
              )}
              {serverStatus === 'checking' && (
                <span className="text-slate-400">Checking...</span>
              )}
              {serverStatus === 'offline' && (
                <span className="flex items-center gap-1 text-amber-400" title="Render free tier may take ~30s to wake up on first ping">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Waking up...
                </span>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
