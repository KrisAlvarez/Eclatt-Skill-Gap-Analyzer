import React from 'react';
import { ArrowRight, Compass, CheckCircle2, TrendingUp, Layers, ShieldCheck } from 'lucide-react';

export default function HomeView({ onGoToExplorer }) {
  return (
    <div className="space-y-12 max-w-5xl mx-auto py-6">
      {/* Editorial Hero Section */}
      <div className="text-center space-y-4 pt-6">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#476b53] px-3.5 py-1.5 rounded-full bg-[#eaf2e8] border border-[#d2e4cf] inline-block">
          CAREER SKILL EXPLORER
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#132d1e] tracking-tight max-w-3xl mx-auto leading-tight">
          Discover which tech skills actually go together.
        </h1>
        <p className="text-base sm:text-lg text-[#4f6c58] max-w-2xl mx-auto leading-relaxed">
          Stop guessing what to learn next. SkillGap analyzes real 2024 job postings to show you the exact companion tools employers look for in your stack.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onGoToExplorer}
            className="px-6 py-3 rounded-full bg-[#1b3827] hover:bg-[#12281c] text-white text-sm font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Launch Explorer</span>
            <ArrowRight className="w-4 h-4 text-[#86efac]" />
          </button>
        </div>
      </div>

      {/* 3 Core Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="tacti-card p-6 rounded-3xl border border-[#e2e8df] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#edf5ec] text-[#245e38] flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#163825]">
            123K+ Real Postings
          </h3>
          <p className="text-xs sm:text-sm text-[#506c59] leading-relaxed">
            Mined from 2024 LinkedIn job postings across Backend, Frontend, and Data Analytics roles with strict anti-bias filtering.
          </p>
        </div>

        <div className="tacti-card p-6 rounded-3xl border border-[#e2e8df] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#edf5ec] text-[#245e38] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#163825]">
            Pattern Co-Occurrence
          </h3>
          <p className="text-xs sm:text-sm text-[#506c59] leading-relaxed">
            Rather than generic popularity lists, we identify conditional pairings: tools that directly pair with the skills you already know.
          </p>
        </div>

        <div className="tacti-card p-6 rounded-3xl border border-[#e2e8df] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#edf5ec] text-[#245e38] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#163825]">
            Actionable Roadmap
          </h3>
          <p className="text-xs sm:text-sm text-[#506c59] leading-relaxed">
            Save missing companion skills to your study checklist and build cohesive portfolio projects that hiring managers respect.
          </p>
        </div>
      </div>

      {/* Seniority Callout */}
      <div className="tacti-card-subtle p-6 sm:p-8 rounded-3xl border border-[#dbe4d8] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#265e3a]">
            Student &amp; Fresh Graduate Friendly
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#153422]">
            Entry-Level &amp; Junior Filtering
          </h3>
          <p className="text-xs sm:text-sm text-[#4f6e59] max-w-xl">
            We isolate entry-level postings so you aren't overwhelmed by 10-year senior architecture expectations.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToExplorer}
          className="px-5 py-2.5 rounded-full bg-[#1b3827] hover:bg-[#12281c] text-white text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer"
        >
          Explore Entry-Level Roles →
        </button>
      </div>
    </div>
  );
}
