import React, { useEffect, useState } from 'react';
import { Sparkles, Compass, Map, Binary, Server } from 'lucide-react';
import { api } from '../api/client';

export default function Navbar({ activeTab, setActiveTab }) {
  const [serverStatus, setServerStatus] = useState('checking');

  const checkServer = async () => {
    try {
      const res = await api.checkHealth();
      if (res.status === 'healthy') {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (_) {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setActiveTab('analyzer')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-xl text-white tracking-tight">SkillGap</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                Career Insights
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Find out what skills you need for your target job</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('analyzer')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analyzer'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Career Analyzer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Learning Roadmap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('technical')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'technical'
                ? 'bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40 border border-indigo-500/30'
            }`}
          >
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>Algorithm & Research</span>
          </button>

          {/* Cloud API Health Pill */}
          <div className="hidden lg:flex items-center gap-2 pl-3 ml-2 border-l border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Cloud API:</span>
              {serverStatus === 'online' && (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                </span>
              )}
              {serverStatus === 'checking' && (
                <span className="text-slate-400">Connecting...</span>
              )}
              {serverStatus === 'offline' && (
                <span className="flex items-center gap-1 text-amber-400" title="Render free tier takes ~30s to wake up on first ping">
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
