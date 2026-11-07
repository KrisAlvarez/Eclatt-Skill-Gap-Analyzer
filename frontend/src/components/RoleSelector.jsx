import React from 'react';
import { Server, Layout, BarChart3, Info, Users, GraduationCap } from 'lucide-react';

const ROLE_ICONS = {
  'Backend Developer': Server,
  'Frontend Developer': Layout,
  'Data Analyst': BarChart3,
};

const ROLE_DESCRIPTIONS = {
  'Backend Developer': 'API design, database schemas, microservices, distributed caching, and container orchestration.',
  'Frontend Developer': 'User interfaces, single-page apps, responsive design, state management, and web performance.',
  'Data Analyst': 'Data visualization, SQL queries, business metrics, descriptive analytics, and reporting dashboards.',
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
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider mb-1">
            <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold">1</span>
            Target IT Specialization
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">Choose Your Desired Career Track</h2>
        </div>

        {/* Seniority Filter Switcher (Resolves Loophole #1) */}
        <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeExperienceMode('entry')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              experienceMode === 'entry'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Entry-Level & Junior</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeExperienceMode('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              experienceMode === 'all'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Seniority Levels</span>
          </button>
        </div>
      </div>

      {/* Seniority Loophole Callout */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Anti-Bias Filter Active: </span>
          {experienceMode === 'entry' ? (
            <span>
              Currently mining <strong>Junior & Entry-Level postings only</strong>. This prevents senior architecture tools (like multi-region Kubernetes or Terraform) from skewing fresh-graduate advice.
            </span>
          ) : (
            <span>
              Currently mining across <strong>all seniority levels</strong>. This gives you a broad view of general industry demand across mid and senior tiers.
            </span>
          )}
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.role_name;
          const Icon = ROLE_ICONS[role.role_name] || Server;
          const postingCount =
            experienceMode === 'entry'
              ? role.entry_postings_count
              : role.all_postings_count;

          return (
            <div
              key={role.role_name}
              onClick={() => onSelectRole(role.role_name)}
              className={`p-5 rounded-2xl cursor-pointer border transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-violet-900/40 to-slate-900 border-violet-500 shadow-xl shadow-violet-950/40 ring-1 ring-violet-500'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60">
                    {postingCount.toLocaleString()} {experienceMode === 'entry' ? 'entry jobs' : 'jobs'}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-white mb-1.5">{role.role_name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {ROLE_DESCRIPTIONS[role.role_name] || 'Technical skill co-occurrence and requirements.'}
                </p>
              </div>

              {/* Core Skill Tags Preview */}
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1.5">Top Baseline Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {(role.top_1_itemsets || []).slice(0, 4).map((item) => (
                    <span
                      key={item.skill}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/40"
                    >
                      {item.skill}
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
