import React, { useEffect, useState } from 'react';
import { Target, ArrowUpRight } from 'lucide-react';
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

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'explorer', label: 'Explorer' },
    { id: 'roadmaps', label: 'Roadmaps' },
    { id: 'how-to-use', label: 'How to use' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#f5f6f1]/95 backdrop-blur-sm border-b border-[#e1e6dd] px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-9 h-9 rounded-xl bg-[#1b3729] text-white flex items-center justify-center shadow-sm group-hover:bg-[#14281e] transition-colors">
            <Target className="w-5 h-5 text-[#88d49e]" />
          </div>
          <span className="font-editorial text-2xl font-bold tracking-tight text-[#1b2b20]">
            SkillGap
          </span>
        </div>

        {/* Navigation Tabs (Center) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#eaede6] p-1 rounded-full border border-[#d8ded4]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1b3729] text-white shadow-xs font-semibold'
                    : 'text-[#445548] hover:text-[#1b2b20] hover:bg-[#dce3d6]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status Pill & CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Status Indicator Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f1e6] border border-[#cde0ca] text-[11px] font-medium text-[#215332] tracking-wide uppercase">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'online'
                  ? 'bg-[#22c55e] animate-pulse'
                  : 'bg-amber-400'
              }`}
            ></span>
            <span className="hidden sm:inline">123K Real Job Data</span>
            <span className="sm:hidden">Real Data</span>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className="flex items-center gap-1 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
          >
            <span>Explore skills</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Row */}
      <div className="flex md:hidden items-center justify-around mt-3 pt-2 border-t border-[#e1e6dd]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs font-medium transition-all ${
                isActive
                  ? 'text-[#1b3729] border-b-2 border-[#1b3729] font-bold'
                  : 'text-[#586c5e]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
