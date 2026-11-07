import React from 'react';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
  Server,
  Layers,
} from 'lucide-react';

export default function AboutTab() {
  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-[#e1e6dd]">
        <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-wider block mb-1">
          PROJECT OVERVIEW
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1b2b20] tracking-tight">
          About SkillGap
        </h1>
        <p className="text-sm text-[#4d5e51] mt-1 max-w-2xl leading-relaxed">
          SkillGap was designed to solve the critical transition gap between university computer science
          curricula and modern industry software engineering job requirements.
        </p>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#eef5ed] text-[#2d6a4f] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-[#1b2b20]">
            The Motivation
          </h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            Most academic programs teach programming in isolation (e.g. learning Python syntax). In
            the real world, however, tech companies do not hire for syntax alone—they hire for{' '}
            <strong>integrated toolchains</strong>. A backend engineer knowing Python must also know
            how to query databases via SQL, design RESTful contracts, and package software using Docker.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#eef5ed] text-[#2d6a4f] flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-[#1b2b20]">
            The Dataset
          </h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            Trained on <strong>123,849 LinkedIn Tech Job Postings</strong> from 2024. Job descriptions
            were processed using canonical keyword extraction and mapped against industry taxonomy
            standards to filter out noise, corporate jargon, and duplicate postings.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#eef5ed] text-[#2d6a4f] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-[#1b2b20]">
            The Seniority Anti-Bias Filter
          </h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            Over 89% of LinkedIn postings demand senior, staff, or lead qualifications. Without
            deliberate filtering, career advice engines overwhelm fresh graduates with senior-level
            tools like Kubernetes cluster federation or Terraform. SkillGap segments junior and
            entry-level roles to provide realistic, actionable advice.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#eef5ed] text-[#2d6a4f] flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-[#1b2b20]">
            Cloud Architecture
          </h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            The analytics service is deployed on <strong>Render Cloud</strong> with an ultra-lightweight
            FastAPI backend, precomputed co-occurrence indexes for instantaneous sub-10ms response times,
            and CORS configuration for seamless client communication.
          </p>
        </div>
      </div>

      {/* GitHub Repository Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1b2b20] text-white flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#1b2b20]">
              Open-Source GitHub Repository
            </h4>
            <p className="text-xs text-[#526456]">
              Review the complete source code, tests, and dataset documentation.
            </p>
          </div>
        </div>

        <a
          href="https://github.com/KrisAlvarez/Eclatt-Skill-Gap-Analyzer"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-[#f0f4ee] hover:bg-[#e4ece1] text-[#1b3729] text-xs font-semibold border border-[#d2ded0] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>View on GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
