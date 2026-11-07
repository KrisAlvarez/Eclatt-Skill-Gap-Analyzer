import React, { useState, useMemo } from 'react';
import { Search, X, Check, Sparkles, Trash2, ArrowRight } from 'lucide-react';

const PRESETS = {
  'Backend Developer': [
    { label: '🐍 Python & SQL Starter', skills: ['Python', 'SQL'] },
    { label: '☕ Java Developer', skills: ['Java', 'SQL', 'Git'] },
    { label: '⚡ Node.js API Builder', skills: ['JavaScript', 'Node.js', 'REST APIs'] },
    { label: '🌱 Complete Beginner', skills: [] },
  ],
  'Frontend Developer': [
    { label: '⚛️ React Junior', skills: ['JavaScript', 'React', 'HTML/CSS'] },
    { label: '📘 TypeScript & React', skills: ['TypeScript', 'React', 'Git'] },
    { label: '🎨 Modern Web Dev', skills: ['JavaScript', 'HTML/CSS', 'Git'] },
    { label: '🌱 Complete Beginner', skills: [] },
  ],
  'Data Analyst': [
    { label: '📊 SQL & Tableau', skills: ['SQL', 'Tableau'] },
    { label: '🐍 Python Analytics', skills: ['Python', 'SQL', 'Pandas'] },
    { label: '📈 Power BI Analyst', skills: ['SQL', 'Power BI'] },
    { label: '🌱 Complete Beginner', skills: [] },
  ],
};

const CATEGORY_NAMES = {
  'Languages': '💻 Programming Languages',
  'Frameworks': '⚡ Web Frameworks & Libraries',
  'Databases': '🗄️ Databases & Storage',
  'DevOps & Cloud': '🛠️ Developer Tools & Cloud',
  'Concepts': '📐 Architecture & APIs',
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
      {/* Header & Main Analyze Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-violet-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Step 2 of 3
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            Select Skills You Already Know
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Click any skills you're familiar with. We will find which companion skills you are missing!
          </p>
        </div>

        {/* Big Friendly CTA */}
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing Your Skill Gap...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Find My Missing Skills</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Quick Starter Presets */}
      {rolePresets.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mr-1">
            ⚡ Quick Presets:
          </span>
          {rolePresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onApplyPreset(preset.skills)}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 hover:text-white transition-all cursor-pointer font-medium"
            >
              {preset.label}
            </button>
          ))}
          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={onClearSkills}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all flex items-center gap-1 ml-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>
      )}

      {/* Selected Skills Chips */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300">
            Skills in Your Profile ({selectedSkills.length})
          </span>
          {selectedSkills.length === 0 ? (
            <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Beginner mode active (0 skills selected)
            </span>
          ) : (
            <span className="text-xs text-emerald-400 font-medium">
              Ready to find co-required skills
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
          {selectedSkills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No skills selected. Click any skills below to add them to your profile, or click "Find My Missing Skills" to see essential baseline skills for beginners!
            </p>
          ) : (
            selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 text-violet-200 border border-violet-500/40 text-xs font-medium shadow-sm"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => onToggleSkill(skill)}
                  className="hover:text-white text-violet-400 p-0.5 rounded-full hover:bg-violet-600/30 transition-colors cursor-pointer"
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
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills (e.g., Python, Docker, React, SQL, AWS)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {CATEGORY_NAMES[cat] || (cat === 'ALL' ? '🌟 All Skills' : cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-1">
        {filteredSkills.map(({ skill, category }) => {
          const isSelected = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => onToggleSkill(skill)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-violet-950/60 to-slate-900 border-violet-500 text-white shadow-sm ring-1 ring-violet-500'
                  : 'bg-slate-900/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="overflow-hidden">
                <span className="text-xs font-semibold block truncate">{skill}</span>
                <span className="text-[10px] text-slate-400 block truncate">{category}</span>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                isSelected ? 'bg-violet-600 border-violet-500 text-white' : 'border-slate-700 bg-slate-800/60'
              }`}>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
