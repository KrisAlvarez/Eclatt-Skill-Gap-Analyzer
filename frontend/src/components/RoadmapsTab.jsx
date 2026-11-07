import React, { useState } from 'react';
import {
  Printer,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  Compass,
} from 'lucide-react';
import { getSkillDescription } from '../utils/skillDescriptions';

const PORTFOLIO_PROJECTS = {
  'Backend Developer': {
    title: 'Distributed RESTful Task Engine with Docker & Redis',
    architecture: 'Microservices, Database Schemas, Authentication, & Containers',
    deliverables: [
      'FastAPI / Node.js authenticated CRUD service with PostgreSQL schema design and database indexing',
      'Docker Compose configuration with multi-stage builds and isolated network for web and db services',
      'Redis cache layer for sub-50ms API response times on high-volume endpoints',
      'Unit and integration test suite with GitHub Actions automated CI validation',
    ],
  },
  'Frontend Developer': {
    title: 'Interactive Real-Time Analytics Dashboard with React & TypeScript',
    architecture: 'Component Architecture, State Management, & Fluid Responsiveness',
    deliverables: [
      'Responsive React SPA with Tailwind styling, fluid mobile navigation, and dark/light support',
      'Type-safe REST API integration and global state management with clean custom hooks',
      'Accessible WCAG-compliant UI components with 95+ Google Lighthouse performance score',
      'End-to-end user workflows tested with Vitest and React Testing Library',
    ],
  },
  'Data Analyst': {
    title: 'Executive Sales & Operations Intelligence Dashboard',
    architecture: 'SQL Warehousing, ETL Pipelines, & Executive KPI Dashboards',
    deliverables: [
      'Complex SQL query pipelines with window functions, CTEs, and aggregated performance metrics',
      'Interactive Tableau / Power BI dashboard with executive KPI drill-downs and regional filters',
      'Exploratory Python notebook documenting statistical patterns and actionable recommendations',
      'Executive summary memo presenting clear ROI conclusions for business leaders',
    ],
  },
};

export default function RoadmapsTab({
  selectedRole,
  onSelectRole,
  roles,
  userSkills,
  roadmapSkills,
  onToggleRoadmapSkill,
  onGoToExplorer,
}) {
  const [completedSkills, setCompletedSkills] = useState([]);

  const toggleCompleted = (skill) => {
    setCompletedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const project =
    PORTFOLIO_PROJECTS[selectedRole] || PORTFOLIO_PROJECTS['Backend Developer'];

  const progressPercent =
    roadmapSkills.length > 0
      ? Math.round((completedSkills.length / roadmapSkills.length) * 100)
      : 0;

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#e1e6dd] gap-4">
        <div>
          <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-wider block mb-1">
            CAREER ROADMAPS
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1b2b20] tracking-tight">
            {selectedRole} Learning Pathway
          </h1>
          <p className="text-sm text-[#4d5e51] mt-1 max-w-xl">
            A practical, sequential checklist to transition from student to job-ready candidate.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white border border-[#d2ded0] hover:bg-[#edf2ea] text-[#1b2b20] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>Print Checklist</span>
          </button>

          <button
            type="button"
            onClick={onGoToExplorer}
            className="px-4 py-2 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Modify Skills in Explorer</span>
          </button>
        </div>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => {
          const isActive = r.role_name === selectedRole;
          return (
            <button
              key={r.role_name}
              type="button"
              onClick={() => onSelectRole(r.role_name)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1b3729] text-white shadow-xs'
                  : 'bg-white border border-[#d8ded4] text-[#445548] hover:bg-[#edf1ea]'
              }`}
            >
              {r.role_name}
            </button>
          );
        })}
      </div>

      {/* 3 Phases Sequence */}
      <div className="space-y-6">
        {/* Phase 1: Current Baseline Skills */}
        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#e8f3ec] text-[#2d6a4f] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
                Phase 1: Baseline Repertoire
              </h3>
              <p className="text-xs text-[#526456]">
                Technologies you already know that form your foundation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {userSkills.length === 0 ? (
              <p className="text-xs text-[#708474] italic">
                No existing skills selected yet. Select some in the{' '}
                <button
                  type="button"
                  onClick={onGoToExplorer}
                  className="font-bold text-[#1b3729] underline"
                >
                  Explorer
                </button>
                !
              </p>
            ) : (
              userSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg bg-[#f0f4ee] text-[#1b3729] border border-[#d2ded0] text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <span>{skill}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Phase 2: Missing Priority Companion Skills (Interactive Checklist) */}
        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1b3729] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
                  Phase 2: Missing Priority Companion Skills Checklist
                </h3>
                <p className="text-xs text-[#526456]">
                  High-frequency co-occurring tools needed to meet real employer job requirements.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-xs font-bold text-[#1b3729] block">
                  {completedSkills.length} of {roadmapSkills.length} Completed
                </span>
                <span className="text-[10px] text-[#5c6f60]">
                  {progressPercent}% Checklist Progress
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {roadmapSkills.length > 0 && (
            <div className="w-full h-2 rounded-full bg-[#e3eae0] overflow-hidden">
              <div
                className="h-full bg-[#2d6a4f] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          )}

          {roadmapSkills.length === 0 ? (
            <div className="p-6 text-center bg-[#f9faf7] rounded-xl border border-dashed border-[#d2ded0] space-y-2">
              <Sparkles className="w-5 h-5 text-[#2d6a4f] mx-auto" />
              <p className="text-xs text-[#526456]">
                You haven't saved any companion skills yet. Go to the{' '}
                <button
                  type="button"
                  onClick={onGoToExplorer}
                  className="font-bold text-[#1b3729] underline"
                >
                  Explorer
                </button>{' '}
                and click <strong>"Add to Roadmap"</strong> on recommendations!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {roadmapSkills.map((skill) => {
                const isDone = completedSkills.includes(skill);
                const desc = getSkillDescription(skill);

                return (
                  <div
                    key={skill}
                    onClick={() => toggleCompleted(skill)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isDone
                        ? 'bg-[#f4f8f4] border-[#b4dbb9]'
                        : 'bg-[#fafbfa] border-[#e1e6dd] hover:bg-[#f0f4ee]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-[#2d6a4f] mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 fill-[#2d6a4f] text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#889d8c]" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-sm font-semibold block ${
                            isDone
                              ? 'line-through text-[#6f8473]'
                              : 'text-[#1b2b20]'
                          }`}
                        >
                          {skill}
                        </span>
                        <p className="text-xs text-[#526456] mt-0.5 leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRoadmapSkill(skill);
                      }}
                      className="text-xs text-[#708474] hover:text-[#b91c1c] font-medium shrink-0 pt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phase 3: Capstone Portfolio Project */}
        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#e8f3ec] text-[#2d6a4f] flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
                Phase 3: Job-Ready Portfolio Project
              </h3>
              <p className="text-xs text-[#526456]">
                Prove your skills to hiring managers by constructing an end-to-end project.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#f8faf7] border border-[#e4ebe0] space-y-3">
            <div className="border-b border-[#e1e6dd] pb-3">
              <span className="text-[10px] font-semibold text-[#2d6a4f] uppercase tracking-wider block">
                Recommended Project Specification
              </span>
              <h4 className="font-editorial text-lg font-bold text-[#1b2b20]">
                {project.title}
              </h4>
              <p className="text-xs text-[#526456] mt-0.5 font-medium">
                Core Domains: {project.architecture}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-[#1b2b20] block">
                Deliverables for Your Resume & GitHub:
              </span>
              {project.deliverables.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#445548]">
                  <span className="text-[#2d6a4f] font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
