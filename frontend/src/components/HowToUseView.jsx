import React from 'react';
import { Compass, CheckSquare, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Select Your Career Path',
    desc: 'Choose between Backend Development, Frontend Development, or Data Analytics. Use the seniority switch to filter specifically for entry-level roles or explore all industry levels.',
    icon: Compass,
  },
  {
    step: '02',
    title: 'Indicate What You Already Know',
    desc: 'Click on the programming languages, databases, or frameworks you have experience with, or select a starter preset (like "Python & SQL Starter").',
    icon: CheckSquare,
  },
  {
    step: '03',
    title: 'Discover True Co-Occurrence Pairings',
    desc: 'SkillGap analyzes real job listings to identify companion tools that specifically co-occur with your skills—ensuring you build cohesive, practical toolkits employers actually look for.',
    icon: Sparkles,
  },
  {
    step: '04',
    title: 'Save Missing Skills & Build Projects',
    desc: 'Save missing companion skills directly to your study plan. Focus your learning on bridging the highest-confidence gaps first to maximize your interview readiness.',
    icon: BookOpen,
  },
];

export default function HowToUseView({ onGoToExplorer }) {
  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#476b53] block mb-1">
          USER GUIDE
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#142e20] tracking-tight">
          How to use SkillGap
        </h1>
        <p className="text-sm sm:text-base text-[#4f6b58] mt-2 max-w-2xl leading-relaxed">
          A straightforward 4-step framework to audit your current tech stack against real-world
          job postings and build a focused study plan.
        </p>
      </div>

      {/* Step Grid */}
      <div className="space-y-4">
        {STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="tacti-card p-6 sm:p-7 rounded-3xl border border-[#e2e8df] flex flex-col sm:flex-row sm:items-start gap-5 hover:border-[#b8cfb4] transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#edf5ec] text-[#245e38] flex items-center justify-center font-serif font-bold text-lg shrink-0">
                {item.step}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-serif font-bold text-[#153422]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-[#4d6a56] leading-relaxed pt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="tacti-card-subtle p-6 rounded-3xl border border-[#dce6d8] flex items-center justify-between">
        <div>
          <h4 className="font-serif font-bold text-lg text-[#163825]">Ready to test your skills?</h4>
          <p className="text-xs text-[#52705d]">Launch the interactive explorer to view your personalized recommendations.</p>
        </div>

        <button
          type="button"
          onClick={onGoToExplorer}
          className="px-5 py-2.5 rounded-full bg-[#1b3827] hover:bg-[#12281c] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Launch Explorer</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#86efac]" />
        </button>
      </div>
    </div>
  );
}
