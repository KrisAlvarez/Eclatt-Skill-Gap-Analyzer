import React from 'react';
import { Compass, Sparkles, ArrowUpRight } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'explorer', label: 'Explorer' },
    { id: 'tracks', label: 'Themes' },
    { id: 'how-to-use', label: 'How to use' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#f8faf6]/95 backdrop-blur-md border-b border-[#e5ebe2] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1d3b2a] flex items-center justify-center text-white shadow-sm group-hover:bg-[#14291d] transition-colors">
            <Compass className="w-5 h-5 text-[#86efac]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#163323]">
              SkillGap
            </span>
          </div>
        </div>

        {/* Center Tabs inspired by TactiChess */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 bg-transparent">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#e4ede1] text-[#163825] font-semibold'
                    : 'text-[#4e6a57] hover:text-[#163825] hover:bg-[#edf3ea]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action & Status Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf5ec] text-[#245e38] border border-[#d6e5d3] text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
            <span>REAL 2024 JOB DATA</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1b3827] hover:bg-[#132a1d] text-white text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            <span>Explore skills</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#86efac]" />
          </button>
        </div>
      </div>

      {/* Mobile Submenu Tabs */}
      <div className="flex md:hidden items-center justify-around pt-3 mt-2 border-t border-[#e5ebe2] overflow-x-auto gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-[#e4ede1] text-[#163825] font-semibold'
                  : 'text-[#4e6a57] hover:text-[#163825]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
