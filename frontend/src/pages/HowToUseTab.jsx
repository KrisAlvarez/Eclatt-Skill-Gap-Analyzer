import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HowToUseTab({ onGoToExplorer }) {
  const steps = [
    {
      num: '1',
      title: 'Pick a career track',
      desc: 'Choose Backend Developer, Frontend Developer, or Data Analyst, then select Continue.',
    },
    {
      num: '2',
      title: 'Select what you know',
      desc: 'Search for skills you have studied or used, or browse a category. You can also start with no skills selected.',
    },
    {
      num: '3',
      title: 'See what goes with them',
      desc: 'Select Show my suggestions (or Find beginner skills). Start with three suggestions and open the evidence only when you want more detail.',
    },
    {
      num: '4',
      title: 'Save to your roadmap',
      desc: 'Select Save skill on any suggestion, then open My roadmap to track your practice. Your checklist stays available while this page is open; refreshing clears it.',
    },
  ];

  const faqs = [
    {
      q: 'How does this work?',
      a: 'SkillGap looks for skills that appear together in historical job postings. The 2024 source dataset reports 1,348,454 postings; SkillGap retains 44,441 records assigned to three tracks, including an entry-flagged subset of 3,454. Track and experience labels are assigned by rules and await human validation. For example, it can show whether postings with Python and SQL also mention Docker. A mention does not prove that a skill is required.',
    },
    {
      q: 'What do the benchmark results tell me?',
      a: 'The benchmark measures whether the system can recover a hidden skill from held-out job postings. It does not test whether a suggestion is useful for learning, assess your skill level, or predict hiring outcomes.',
    },
    {
      q: 'What is the entry-level filter?',
      a: 'Entry level uses a subset flagged from job-level labels or junior title keywords, with senior title keywords excluded. Job descriptions and years of experience are not checked. A record outside this subset is not necessarily senior. You can switch to all experience levels under Job experience in the skills step.',
    },
  ];

  return (
    <div className="space-y-8 py-4 max-w-3xl mx-auto">
      <div className="pb-4 border-b border-[#e1e6dd]">
        <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-wider block mb-0.5">
          HOW TO USE
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1b2b20]">
          How to use SkillGap
        </h1>
        <p className="text-xs text-[#526456] mt-0.5">
          Simple steps to discover your next learning goal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((s) => (
          <div key={s.num} className="p-5 rounded-2xl bg-white border border-[#e1e6dd] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#f0f4ee] text-[#1b3729] flex items-center justify-center text-xs font-bold">
              {s.num}
            </span>
            <h3 className="font-bold text-sm text-[#1b2b20]">{s.title}</h3>
            <p className="text-xs text-[#526456] leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-[#f4f7f2] border border-[#d8e2d6] flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-[#1b2b20]">Ready to try it?</h4>
          <p className="text-xs text-[#526456]">Pick a role and run your analysis in a few clicks.</p>
        </div>
        <button
          type="button"
          onClick={onGoToExplorer}
          className="px-4 py-2 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>Open Explorer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">Questions</h3>
        {faqs.map((faq, i) => (
          <div key={i} className="p-4 rounded-xl bg-white border border-[#e1e6dd] space-y-1">
            <h4 className="font-bold text-xs text-[#1b2b20]">{faq.q}</h4>
            <p className="text-xs text-[#526456] leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
