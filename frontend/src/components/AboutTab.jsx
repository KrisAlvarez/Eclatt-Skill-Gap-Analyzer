import React from 'react';
import { ExternalLink, Code2 } from 'lucide-react';

export default function AboutTab() {
  return (
    <div className="space-y-6 py-4 max-w-3xl mx-auto">
      <div className="pb-4 border-b border-[#e1e6dd]">
        <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-wider block mb-0.5">
          ABOUT
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1b2b20]">
          About SkillGap
        </h1>
        <p className="text-xs text-[#526456] mt-0.5">
          A tool to help learners see what companion skills employers look for.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-white border border-[#e1e6dd] space-y-2">
          <h3 className="font-bold text-sm text-[#1b2b20]">Why did we build this?</h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            When learning to code, it's easy to pick up a single language (like Python or JavaScript) without realizing that companies hire for full workflows. A Python backend job almost always expects a database (SQL), API patterns (REST), and deployment tools (Docker). SkillGap analyzes co-occurrences in real job postings to help learners connect the dots.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e1e6dd] space-y-2">
          <h3 className="font-bold text-sm text-[#1b2b20]">Where is the data from?</h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            We analyzed 123,849 real tech job postings from LinkedIn (2024). We extracted canonical technical skills and grouped them by career track (Backend, Frontend, and Data Analyst).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e1e6dd] space-y-2">
          <h3 className="font-bold text-sm text-[#1b2b20]">Seniority filter</h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            Over 85% of tech postings online ask for mid to senior engineers with advanced architecture tools. We separated entry-level postings so beginners get advice that fits their actual starting level.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white border border-[#e1e6dd] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-[#2d6a4f]" />
          <span className="text-xs font-semibold text-[#1b2b20]">Open-source project on GitHub</span>
        </div>
        <a
          href="https://github.com/KrisAlvarez/Eclatt-Skill-Gap-Analyzer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#2d6a4f] hover:underline font-medium flex items-center gap-1"
        >
          <span>View repository</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
