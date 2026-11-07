import React, { useState, useMemo } from 'react';
import { Search, X, Check, Sparkles, Filter, Trash2 } from 'lucide-react';

const PRESETS = {
  'Backend Developer': [
    { label: 'Python & SQL Starter', skills: ['Python', 'SQL'] },
    { label: 'Java Spring Stack', skills: ['Java', 'SQL', 'Git'] },
    { label: 'Node.js API Builder', skills: ['JavaScript', 'Node.js', 'REST APIs'] },
  ],
  'Frontend Developer': [
    { label: 'React Junior', skills: ['JavaScript', 'React', 'Git'] },
    { label: 'Modern TS + React', skills: ['TypeScript', 'React', 'HTML/CSS'] },
    { label: 'Vue.js Web Dev', skills: ['JavaScript', 'Vue.js', 'HTML/CSS'] },
  ],
  'Data Analyst': [
    { label: 'SQL & BI Starter', skills: ['SQL', 'Tableau'] },
    { label: 'Python Analytics', skills: ['Python', 'SQL', 'Pandas'] },
    { label: 'Power BI Analyst', skills: ['SQL', 'Power BI'] },
  ],
};

export default function SkillSelector({
  skillsByCategory,
  selectedSkills,
  onToggleSkill,
  onClearSkills,
  onApplyPreset,
  selectedRole,
  onAnalyze,
  isAnalyzing,
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = useMemo(() => {
    return ['ALL', ...Object.keys(skillsByCategory)];
  }, [skillsByCategory]);

  const filteredSkills = useMemo(() => {
    const list = [];
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      if (selectedCategory !== 'ALL' && selectedCategory !== category) return;
      skills.forEach((skill) => {
        if (!search || skill.toLowerCase().includes(search.toLowerCase())) {
          list.push({ skill, category });
        }
      });
    });
    return list;
  }, [skillsByCategory, selectedCategory, search]);

  const rolePresets = PRESETS[selectedRole] || [];

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider mb-1">
            <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold">2</span>
            Candidate Profile
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">Select Skills You Already Know</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ECLAT will use these as rule <strong>antecedents</strong> to discover conditional co-requirements.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Mining Rules...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run ECLAT Gap Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Presets Strip */}
      {rolePresets.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 pt-1 pb-2">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Presets:
          </span>
          {rolePresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onApplyPreset(preset.skills)}
              className="text-xs px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-violet-500/50 hover:text-white transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onClearSkills}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-500/30 transition-all flex items-center gap-1 ml-auto cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* Selected Skills Strip */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-slate-400">
            Selected Skills ({selectedSkills.length})
          </span>
          {selectedSkills.length === 0 && (
            <span className="text-xs text-amber-400 font-mono">
              Cold-start active (0 skills selected = baseline priors)
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center">
          {selectedSkills.length === 0 ? (
            <span className="text-xs text-slate-500 italic">
              No skills selected yet. Click skills below or select a preset to analyze your stack.
            </span>
          ) : (
            selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600/20 text-violet-200 border border-violet-500/30 text-xs font-medium"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => onToggleSkill(skill)}
                  className="hover:text-white text-violet-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search canonical tech skills (e.g., Python, Docker, React, SQL)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto pr-1">
        {filteredSkills.map(({ skill, category }) => {
          const isSelected = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => onToggleSkill(skill)}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-violet-950/40 border-violet-500 text-white shadow-sm ring-1 ring-violet-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="overflow-hidden">
                <span className="text-xs font-medium block truncate">{skill}</span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">{category}</span>
              </div>
              <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                isSelected ? 'bg-violet-600 border-violet-500 text-white' : 'border-slate-700 bg-slate-800/50'
              }`}>
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
