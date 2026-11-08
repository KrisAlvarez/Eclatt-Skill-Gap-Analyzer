import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HowToUseTab({ onGoToExplorer }) {
  const steps = [
    {
      num: '1',
      title: 'Pick a career track',
      desc: 'Choose Backend Developer, Frontend Developer, or Data Analyst in the Explorer dropdown.',
    },
    {
      num: '2',
      title: 'Select what you know',
      desc: 'Click on the skills you have already studied or used (e.g. Python, SQL, or React).',
    },
    {
      num: '3',
      title: 'See what goes with them',
      desc: 'SkillGap scans real job postings to show you what companion skills employers usually look for alongside your toolkit.',
    },
    {
      num: '4',
      title: 'Save to your roadmap',
      desc: 'Add recommendations to your study roadmap and check them off as you practice.',
    },
  ];

  const faqs = [
    {
      q: 'How does this work?',
      a: 'We parsed 1.3 million real LinkedIn job postings to find co-occurrence patterns. If a job asks for Python and SQL, the data shows whether it also asks for Docker or REST APIs.',
    },
    {
      q: 'What is the entry-level filter?',
      a: 'Most tech postings online are for senior engineers. The entry-level filter removes senior-only tools so the recommendations are realistic for students and junior candidates.',
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
