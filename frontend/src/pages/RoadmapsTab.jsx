import React, { useState } from 'react';
import {
  Printer,
  CheckCircle2,
  Circle,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { getSkillPurpose } from '../utils/skillDescriptions';

const PROJECTS = {
  'Backend Developer': {
    title: 'REST API with a Database & Docker',
    summary: 'Build a backend service that performs CRUD operations, connects to PostgreSQL, and runs in Docker.',
    bullets: [
      'Write API endpoints with Python (FastAPI/Django) or Node/Java',
      'Design database tables and queries with SQL',
      'Containerize your code using a Dockerfile and docker-compose',
    ],
  },
  'Frontend Developer': {
    title: 'Responsive Web App with React',
    summary: 'Build an interactive web interface connected to a public API with clean styling and mobile layout.',
    bullets: [
      'Create reusable components with React and modern JavaScript/TypeScript',
      'Style layouts using clean CSS or Tailwind',
      'Fetch and display live data from a REST API',
    ],
  },
  'Data Analyst': {
    title: 'Data Analysis & Visual Dashboard',
    summary: 'Take a raw dataset, clean and query it with SQL, and build an interactive dashboard.',
    bullets: [
      'Query and aggregate data with SQL (joins, group by, filters)',
      'Clean and explore the numbers using Python (Pandas)',
      'Build a dashboard in Tableau or Power BI showing key trends',
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

  const project = PROJECTS[selectedRole] || PROJECTS['Backend Developer'];

  return (
    <div className="space-y-6 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e1e6dd] gap-3">
        <div>
          <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-wider block mb-0.5">
            ROADMAPS
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1b2b20]">
            {selectedRole} checklist
          </h1>
          <p className="text-xs text-[#526456] mt-0.5">
            A personal checklist for skills you mark as known and skills you choose to explore. Suggestions reflect patterns in the selected postings, not required steps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#d2ded0] hover:bg-[#edf2ea] text-[#1b2b20] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={onGoToExplorer}
            className="px-3.5 py-1.5 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explorer</span>
          </button>
        </div>
      </div>

      {/* Role Picker Pills */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => {
          const isActive = r.role_name === selectedRole;
          return (
            <button
              key={r.role_name}
              type="button"
              onClick={() => onSelectRole(r.role_name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1b3729] text-white font-bold'
                  : 'bg-white border border-[#d8ded4] text-[#445548] hover:bg-[#edf1ea]'
              }`}
            >
              {r.role_name}
            </button>
          );
        })}
      </div>

      {/* 3 Simple Sections */}
      <div className="space-y-4">
        {/* Section 1: Known Skills */}
        <div className="p-5 rounded-2xl bg-white border border-[#e1e6dd] space-y-3">
          <h3 className="font-bold text-sm text-[#1b2b20]">
            1. What you already know ({userSkills.length})
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {userSkills.length === 0 ? (
              <p className="text-xs text-[#708474] italic">
                None selected yet. Pick skills in the Explorer!
              </p>
            ) : (
              userSkills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-[#f0f4ee] text-[#1b3729] border border-[#d2ded0] text-xs font-medium flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <span>{s}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Skills to Learn (Checklist) */}
        <div className="p-5 rounded-2xl bg-white border border-[#e1e6dd] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1b2b20]">
              2. Skills you chose to explore ({roadmapSkills.length})
            </h3>
            {roadmapSkills.length > 0 && (
              <span className="text-xs text-[#526456]">
                {completedSkills.length} of {roadmapSkills.length} completed
              </span>
            )}
          </div>

          {roadmapSkills.length === 0 ? (
            <p className="text-xs text-[#708474] italic">
              No skills added yet. Go to the Explorer and save any suggestion you would like to explore.
            </p>
          ) : (
            <div className="space-y-2 pt-1">
              {roadmapSkills.map((skill) => {
                const isDone = completedSkills.includes(skill);
                const purpose = getSkillPurpose(skill);

                return (
                  <div
                    key={skill}
                    onClick={() => toggleCompleted(skill)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-[#f4f8f4] border-[#b4dbb9]'
                        : 'bg-[#fafbfa] border-[#e1e6dd] hover:bg-[#f0f4ee]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-[#2d6a4f]">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 fill-[#2d6a4f] text-white" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#889d8c]" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-xs font-semibold ${
                            isDone ? 'line-through text-[#6f8473]' : 'text-[#1b2b20]'
                          }`}
                        >
                          {skill}
                        </span>
                        <span className="text-xs text-[#526456] ml-2 hidden sm:inline">
                          — {purpose}
                        </span>
                      </div>
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

        {/* Section 3: Optional practice idea */}
        <div className="p-5 rounded-2xl bg-white border border-[#e1e6dd] space-y-3">
          <h3 className="font-bold text-sm text-[#1b2b20]">
            Optional practice idea: {project.title}
          </h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            {project.summary}
          </p>

          <div className="space-y-1 pt-1">
            {project.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#445548]">
                <span className="text-[#2d6a4f] font-bold">✓</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
