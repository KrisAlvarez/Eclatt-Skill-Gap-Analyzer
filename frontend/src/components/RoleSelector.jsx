import React from 'react';
import { Server, Layout, BarChart3, GraduationCap, Briefcase, Check, ArrowRight } from 'lucide-react';

const ROLE_METADATA = {
  'Backend Developer': {
    icon: Server,
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400',
    description: 'Build robust APIs, databases, servers, and cloud microservices that power web and mobile applications.',
    popularSkills: ['Python', 'SQL', 'Docker', 'REST APIs', 'Java'],
  },
  'Frontend Developer': {
    icon: Layout,
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400',
    description: 'Design and build interactive, responsive user interfaces and engaging modern web experiences.',
    popularSkills: ['JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'Git'],
  },
  'Data Analyst': {
    icon: BarChart3,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
    description: 'Turn raw data into business intelligence, interactive dashboards, and actionable visual insights.',
    popularSkills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel'],
  },
};

export default function RoleSelector({
  roles,
  selectedRole,
  onSelectRole,
  experienceMode,
  onChangeExperienceMode,
}) {
  return (
    <div className="space-y-6">
      {/* Header & Experience Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-violet-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Step 1 of 3
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            Choose Your Target Role
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Select the career path you want to pursue. We'll analyze real job postings to find your skill gaps.
          </p>
        </div>

        {/* Experience Level Switcher */}
        <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1.5 self-start lg:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => onChangeExperienceMode('entry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              experienceMode === 'entry'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Entry-Level & Junior</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeExperienceMode('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              experienceMode === 'all'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>All Industry Levels</span>
          </button>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {roles.map((role) => {
          const isSelected = selectedRole === role.role_name;
          const meta = ROLE_METADATA[role.role_name] || {
            icon: Server,
            color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/40 text-violet-400',
            description: 'Technical job role requirements.',
            popularSkills: ['Python', 'SQL', 'Git'],
          };
          const Icon = meta.icon;
          const postingCount =
            experienceMode === 'entry'
              ? role.entry_postings_count
              : role.all_postings_count;

          return (
            <div
              key={role.role_name}
              onClick={() => onSelectRole(role.role_name)}
              className={`p-6 rounded-2xl cursor-pointer border transition-all text-left flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-violet-500 shadow-xl shadow-violet-950/40 ring-2 ring-violet-500/60'
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Selected Indicator Pill */}
              {isSelected && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-violet-600 text-[11px] font-semibold text-white flex items-center gap-1 shadow-md">
                  <Check className="w-3 h-3 stroke-[3]" /> Selected
                </div>
              )}

              <div>
                {/* Icon & Posting Count */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${meta.color} border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60">
                    <strong>{postingCount.toLocaleString()}</strong> postings
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-heading font-bold text-xl text-white mb-2">{role.role_name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  {meta.description}
                </p>
              </div>

              {/* Common Skills Preview */}
              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">Frequently required skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {meta.popularSkills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
