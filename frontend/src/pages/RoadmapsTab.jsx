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
} from 'lucide-react';

const PORTFOLIO_PROJECTS = {
  'Backend Developer': {
    title: 'Distributed RESTful Task Engine with Docker & Redis',
    deliverables: [
      'FastAPI / Node.js authenticated CRUD service with PostgreSQL schema design',
      'Docker Compose configuration with multi-stage builds and isolated network',
      'Unit & integration test suite validating edge cases and rate-limiting',
    ],
  },
  'Frontend Developer': {
    title: 'Interactive Real-Time Dashboard with React & TypeScript',
    deliverables: [
      'Responsive React SPA with Tailwind styling and fluid mobile navigation',
      'Type-safe REST API integration and global state management',
      'Accessible WCAG-compliant UI components with lighthouse score 90+',
    ],
  },
  'Data Analyst': {
    title: 'Executive Sales & Operations Intelligence Dashboard',
    deliverables: [
      'Complex SQL query pipelines with window functions and aggregations',
      'Interactive Tableau / Power BI dashboard with KPI drill-downs',
      'Exploratory Python notebook documenting key business findings and insights',
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
            <Printer className="w-3.5 h-3.5" />
            <span>Print Roadmap</span>
          </button>

          <button
            type="button"
            onClick={onGoToExplorer}
            className="px-4 py-2 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span>Modify Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
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

      {/* 3 Phases Timeline */}
      <div className="space-y-6">
        {/* Phase 1: Current Skills */}
        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#e8f3ec] text-[#2d6a4f] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
                Phase 1: Your Baseline Repertoire
              </h3>
              <p className="text-xs text-[#526456]">
                Core technologies you already know that serve as your foundation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {userSkills.length === 0 ? (
              <p className="text-xs text-[#708474] italic">
                No existing skills selected yet. Choose your known tools in the Explorer!
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

        {/* Phase 2: Missing Priority Companion Skills */}
        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1b3729] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
                  Phase 2: Priority Companion Skills Checklist
                </h3>
                <p className="text-xs text-[#526456]">
                  High-frequency co-occurring tools needed to meet real employer job requirements.
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-[#2d6a4f]">
              {completedSkills.length} of {roadmapSkills.length} completed
            </span>
          </div>

          {roadmapSkills.length === 0 ? (
            <div className="p-6 text-center bg-[#f9faf7] rounded-xl border border-dashed border-[#d2ded0] space-y-2">
              <Sparkles className="w-5 h-5 text-[#2d6a4f] mx-auto" />
              <p className="text-xs text-[#526456]">
                You haven't added any skills to your roadmap yet. Visit the{' '}
                <button
                  type="button"
                  onClick={onGoToExplorer}
                  className="font-bold text-[#1b3729] underline"
                >
                  Explorer
                </button>{' '}
                to save recommended skills!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {roadmapSkills.map((skill) => {
                const isDone = completedSkills.includes(skill);
                return (
                  <div
                    key={skill}
                    onClick={() => toggleCompleted(skill)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isDone
                        ? 'bg-[#f4f8f4] border-[#b4dbb9]'
                        : 'bg-[#fafbfa] border-[#e1e6dd] hover:bg-[#f0f4ee]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-[#2d6a4f]">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 fill-[#2d6a4f] text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#889d8c]" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          isDone
                            ? 'line-through text-[#6f8473]'
                            : 'text-[#1b2b20]'
                        }`}
                      >
                        {skill}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRoadmapSkill(skill);
                      }}
                      className="text-xs text-[#708474] hover:text-[#b91c1c] font-medium"
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
                Build a production-ready application that showcases your complete companion toolset.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#f8faf7] border border-[#e4ebe0] space-y-3">
            <h4 className="font-bold text-sm text-[#1b2b20]">
              Recommended Project: {project.title}
            </h4>
            <div className="space-y-1.5">
              {project.deliverables.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#445548]">
                  <span className="text-[#2d6a4f] font-bold">✓</span>
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
