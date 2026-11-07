import React from 'react';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Target,
  FileCheck,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

export default function HowToUseTab({ onGoToExplorer }) {
  const steps = [
    {
      num: '01',
      title: 'Choose Your Career Specialization',
      desc: 'Select Backend Developer, Frontend Developer, or Data Analyst depending on your career target. Toggle the Junior filter to ensure recommendations fit entry-level qualifications.',
    },
    {
      num: '02',
      title: 'Pick Skills You Already Know',
      desc: 'Click on programming languages, frameworks, or databases you have built projects with, or choose a 1-click starter preset (e.g. Python & SQL Starter).',
    },
    {
      num: '03',
      title: 'Discover Missing Companion Tools',
      desc: 'Instead of just showing the most popular tools, SkillGap analyzes co-occurrence patterns in 123K real job descriptions to identify the exact companion skills your stack is missing.',
    },
    {
      num: '04',
      title: 'Track Your Learning Checklist',
      desc: 'Save missing skills directly to your Learning Roadmap and follow the sequential phases to build a portfolio project that impresses hiring managers.',
    },
  ];

  const faqs = [
    {
      q: 'How does SkillGap differ from generic "Top 10 Tech Skills" articles?',
      a: 'Generic lists recommend the exact same popular tools (like Python and Git) to everyone. SkillGap evaluates conditional pairs: if you already know Python and SQL, it identifies that 93% of backend employers also demand Docker and REST APIs. If you know Java, it pivots to Spring Boot.',
    },
    {
      q: 'Will I be overwhelmed with senior architecture tools like Kubernetes or Terraform?',
      a: 'No. LinkedIn is heavily skewed toward senior roles (89% of postings). SkillGap includes an Anti-Bias filter that isolates entry-level and junior job postings so fresh graduates and students get actionable, realistic advice.',
    },
    {
      q: 'Is my data saved?',
      a: 'Your chosen skills and roadmap items are stored in your active browser session so you can modify and print your plan anytime without creating an account.',
    },
  ];

  return (
    <div className="space-y-12 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-[#e1e6dd]">
        <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-wider block mb-1">
          GUIDE & TUTORIAL
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1b2b20] tracking-tight">
          How to use SkillGap
        </h1>
        <p className="text-sm text-[#4d5e51] mt-1 max-w-xl">
          Follow these 4 simple steps to analyze your skill gaps and prepare for technical interviews.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {steps.map((s) => (
          <div
            key={s.num}
            className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-3 relative"
          >
            <span className="font-editorial text-3xl font-bold text-[#2d6a4f]/25 block">
              {s.num}
            </span>
            <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
              {s.title}
            </h3>
            <p className="text-xs text-[#526456] leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-2xl bg-[#eef5ed] border border-[#cde0cb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-editorial text-2xl font-bold text-[#1b2b20]">
            Ready to find your missing companion skills?
          </h3>
          <p className="text-xs text-[#526456] mt-1">
            It takes less than 30 seconds to run your first career gap analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToExplorer}
          className="px-6 py-3 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <span>Launch Explorer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#2d6a4f]" />
          <h2 className="font-editorial text-2xl font-bold text-[#1b2b20]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white border border-[#e1e6dd] shadow-xs space-y-2"
            >
              <h4 className="font-bold text-sm text-[#1b2b20]">{faq.q}</h4>
              <p className="text-xs text-[#526456] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
