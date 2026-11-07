import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Plus,
  BookmarkCheck,
  BookmarkPlus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Briefcase,
  Layers,
  GraduationCap,
} from 'lucide-react';

const ROLE_DESCRIPTIONS = {
  'Backend Developer': 'API design, database schemas, microservices, and server architecture.',
  'Frontend Developer': 'Interactive user interfaces, modern component frameworks, and responsive web apps.',
  'Data Analyst': 'Data visualization, SQL queries, dashboards, and quantitative business reporting.',
};

const PRESETS = {
  'Backend Developer': [
    { label: 'Python & SQL', skills: ['Python', 'SQL'] },
    { label: 'Java & Spring', skills: ['Java', 'SQL'] },
    { label: 'Node.js & APIs', skills: ['JavaScript', 'Node.js'] },
    { label: 'Beginner (0 skills)', skills: [] },
  ],
  'Frontend Developer': [
    { label: 'React Junior', skills: ['JavaScript', 'React'] },
    { label: 'TypeScript & React', skills: ['TypeScript', 'React'] },
    { label: 'HTML/CSS & JS', skills: ['JavaScript', 'HTML/CSS'] },
    { label: 'Beginner (0 skills)', skills: [] },
  ],
  'Data Analyst': [
    { label: 'SQL & Tableau', skills: ['SQL', 'Tableau'] },
    { label: 'Python & SQL', skills: ['Python', 'SQL'] },
    { label: 'Power BI Analyst', skills: ['SQL', 'Power BI'] },
    { label: 'Beginner (0 skills)', skills: [] },
  ],
};

export default function ExplorerView({
  roles,
  skillsByCategory,
  selectedRole,
  onSelectRole,
  experienceMode,
  onChangeExperienceMode,
  selectedSkills,
  onToggleSkill,
  onClearSkills,
  onApplyPreset,
  analysisResults,
  isAnalyzing,
  onRunAnalysis,
  roadmapSkills,
  onToggleRoadmapSkill,
}) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [whyPairedOpen, setWhyPairedOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');

  // Flat list of all available skills for search
  const allSkillsList = useMemo(() => {
    const list = [];
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      skills.forEach((skill) => {
        list.push({ skill, category });
      });
    });
    return list;
  }, [skillsByCategory]);

  const filteredSearchSkills = useMemo(() => {
    if (!skillSearch) return [];
    return allSkillsList
      .filter((s) => s.skill.toLowerCase().includes(skillSearch.toLowerCase()))
      .slice(0, 10);
  }, [allSkillsList, skillSearch]);

  // Recommendations from API or default fallback
  const recommendations = analysisResults?.recommendations || [];

  // Filter recommendations by category tab
  const filteredRecommendations = useMemo(() => {
    if (selectedFilter === 'All') return recommendations;
    return recommendations.filter((item) => {
      if (selectedFilter === 'Languages') return item.category === 'Languages';
      if (selectedFilter === 'Frameworks & DBs')
        return item.category === 'Frameworks' || item.category === 'Databases';
      if (selectedFilter === 'Cloud & Tools')
        return item.category === 'DevOps & Cloud' || item.category === 'Concepts';
      return true;
    });
  }, [recommendations, selectedFilter]);

  const rolePresets = PRESETS[selectedRole] || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Editorial Header (TactiChess Style) */}
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#476b53] block mb-1">
          THE EXPLORER
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#142e20] tracking-tight">
          Discover skill connections
        </h1>
        <p className="text-sm sm:text-base text-[#4f6b58] mt-2 max-w-3xl leading-relaxed">
          Choose a role, pick the skills you currently possess, and discover what complementary tools
          appear together in real 2024 job postings.
        </p>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Main Recommendations Area - 8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="tacti-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#e2e8df]">
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7ede4]">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif text-[#163322]">
                  Recommended companion skills
                </h2>
                <p className="text-xs sm:text-sm text-[#52705b] mt-0.5">
                  Target: <span className="font-semibold text-[#183a26]">{selectedRole}</span>
                  {selectedSkills.length > 0 && (
                    <>
                      {' • '}
                      <span>Current: {selectedSkills.join(', ')}</span>
                    </>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={onRunAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 rounded-xl bg-[#edf5ec] hover:bg-[#dfeee0] border border-[#d2e4cf] text-[#1b4329] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
                    <span>Refresh analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Filter Pills (All | Languages | Frameworks & DBs | Cloud & Tools) */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {['All', 'Languages', 'Frameworks & DBs', 'Cloud & Tools'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedFilter === filter
                      ? 'bg-[#1e3c2b] text-white shadow-xs'
                      : 'bg-[#f0f4ee] hover:bg-[#e4ede1] text-[#42614d]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Results count indicator */}
            <div className="pt-3 pb-2 text-xs text-[#5f7d69]">
              {filteredRecommendations.length} companion skills identified • Ranked by real LinkedIn hiring co-occurrence
            </div>

            {/* Recommendation Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {filteredRecommendations.length === 0 ? (
                <div className="col-span-full py-12 text-center tacti-card-subtle rounded-2xl p-6">
                  <p className="text-sm font-serif text-[#163825]">
                    {selectedSkills.length === 0
                      ? 'Select your skills on the right, or click a quick starter preset to begin!'
                      : 'No skills found matching this specific filter. Try selecting "All".'}
                  </p>
                </div>
              ) : (
                filteredRecommendations.map((rec) => {
                  const isSaved = roadmapSkills.includes(rec.skill);
                  const confidencePct = Math.round(rec.confidence * 100);

                  return (
                    <div
                      key={rec.skill}
                      className="tacti-card-subtle p-5 rounded-2xl border border-[#dbe4d8] hover:border-[#b4cfb0] transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#e2ede0] text-[#225734] border border-[#cedfcb]">
                              {rec.category || 'Skill'}
                            </span>
                            <h3 className="text-lg font-serif font-bold text-[#153422] mt-1.5">
                              {rec.skill}
                            </h3>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-semibold text-[#1f4e32] block">
                              {confidencePct}%
                            </span>
                            <span className="text-[10px] text-[#63806d]">Co-occurrence</span>
                          </div>
                        </div>

                        {/* Co-occurrence Progress Bar */}
                        <div className="w-full bg-[#dbe5d8] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#2e6e44] h-full rounded-full transition-all duration-500"
                            style={{ width: `${confidencePct}%` }}
                          ></div>
                        </div>

                        {/* Plain English Explanation */}
                        <p className="text-xs text-[#486351] leading-relaxed">
                          {rec.why_it_matters ||
                            `Required alongside your selected skills in ${confidencePct}% of postings for this role.`}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 mt-3 border-t border-[#d8e3d5] flex items-center justify-between">
                        <span className="text-[11px] text-[#55735f]">
                          Found in {rec.market_presence_pct}% of jobs
                        </span>

                        <button
                          type="button"
                          onClick={() => onToggleRoadmapSkill(rec.skill)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-[#1b3a27] text-white'
                              : 'bg-white hover:bg-[#eaf2e8] text-[#1e482d] border border-[#cde0cb]'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5 text-[#86efac]" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>Save to Plan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Controls & Pairings Area - 4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Choose a Target Role */}
          <div className="tacti-card rounded-2xl sm:rounded-3xl p-5 border border-[#e2e8df] space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#496a54] block mb-1">
                Target Role
              </span>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => onSelectRole(e.target.value)}
                  className="w-full p-2.5 bg-[#f5f8f3] border border-[#d2dfce] rounded-xl text-sm font-serif font-bold text-[#143220] focus:outline-none focus:ring-1 focus:ring-[#295e3a] cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.role_name} value={r.role_name}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[#587361] mt-2 leading-relaxed">
                {ROLE_DESCRIPTIONS[selectedRole] || 'Software engineering career path.'}
              </p>
            </div>

            {/* Seniority Selector */}
            <div className="pt-2 border-t border-[#e6ede3]">
              <span className="text-[11px] font-semibold text-[#486b53] block mb-1.5">
                Experience Level
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeExperienceMode('entry')}
                  className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    experienceMode === 'entry'
                      ? 'bg-[#1d3b2a] text-white shadow-xs font-semibold'
                      : 'bg-[#f1f5ee] hover:bg-[#e4ede0] text-[#3e5d48]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Entry-Level</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeExperienceMode('all')}
                  className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    experienceMode === 'all'
                      ? 'bg-[#1d3b2a] text-white shadow-xs font-semibold'
                      : 'bg-[#f1f5ee] hover:bg-[#e4ede0] text-[#3e5d48]'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>All Levels</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Primary Skills & Presets */}
          <div className="tacti-card rounded-2xl sm:rounded-3xl p-5 border border-[#e2e8df] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#496a54] block">
                  Your Current Skills
                </span>
                <span className="text-xs text-[#63806d]">
                  {selectedSkills.length} skills selected
                </span>
              </div>
              {selectedSkills.length > 0 && (
                <button
                  type="button"
                  onClick={onClearSkills}
                  className="text-xs text-[#7d9384] hover:text-[#c2410c] cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#55715e] block">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {rolePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onApplyPreset(preset.skills)}
                    className="px-2.5 py-1 rounded-lg bg-[#f0f5ed] hover:bg-[#e0ece0] text-[11px] text-[#245233] font-medium transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Selected Badges */}
            <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 rounded-xl bg-[#f5f8f3] border border-[#dce6d8]">
              {selectedSkills.length === 0 ? (
                <span className="text-xs text-[#7e9987] italic">No skills selected yet</span>
              ) : (
                selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-[#1e3c2b] text-white text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => onToggleSkill(skill)}
                      className="hover:text-[#f87171] cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Skill Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7d9585]" />
              <input
                type="text"
                placeholder="Search tools (e.g. Docker, SQL)..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#f9faf7] border border-[#d5e0d2] rounded-xl text-xs text-[#163322] focus:outline-none focus:ring-1 focus:ring-[#295e3a]"
              />

              {filteredSearchSkills.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#d2ded0] rounded-xl shadow-lg p-1.5 max-h-48 overflow-y-auto space-y-1">
                  {filteredSearchSkills.map(({ skill, category }) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <div
                        key={skill}
                        onClick={() => {
                          onToggleSkill(skill);
                          setSkillSearch('');
                        }}
                        className="p-2 rounded-lg hover:bg-[#f1f6ef] cursor-pointer flex items-center justify-between text-xs text-[#143220]"
                      >
                        <span className="font-medium">{skill}</span>
                        <span className="text-[10px] text-[#698574]">{category}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Pair it with another skill (Matching TactiChess) */}
          <div className="tacti-card rounded-2xl sm:rounded-3xl p-5 border border-[#e2e8df] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#163825]">
                Skill Pairings
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#edf5ec] text-[#245e38] text-[10px] font-semibold border border-[#d3e5d1]">
                {recommendations.length} connections
              </span>
            </div>

            <p className="text-xs text-[#52705c]">
              Skills that most frequently co-occur with your background:
            </p>

            <div className="space-y-2 pt-1">
              {recommendations.slice(0, 3).map((item) => (
                <div
                  key={item.skill}
                  className="p-3 rounded-xl bg-[#f5f8f3] border border-[#dce6d8] flex items-center justify-between"
                >
                  <div>
                    <span className="font-serif font-semibold text-sm text-[#143321] block">
                      {item.skill}
                    </span>
                    <span className="text-[11px] text-[#64806f]">
                      {item.category} • {Math.round(item.confidence * 100)}% co-occurrence
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleRoadmapSkill(item.skill)}
                    className="p-1.5 rounded-lg text-[#1e442d] hover:bg-[#e4ede0] cursor-pointer"
                  >
                    {roadmapSkills.includes(item.skill) ? (
                      <BookmarkCheck className="w-4 h-4 text-[#16a34a]" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* TactiChess "Why are these tactics paired?" Accordion */}
            <div className="pt-2 border-t border-[#e7ede4]">
              <button
                type="button"
                onClick={() => setWhyPairedOpen(!whyPairedOpen)}
                className="w-full flex items-center justify-between text-xs font-medium text-[#2b5a3b] hover:text-[#163c23] transition-colors cursor-pointer py-1"
              >
                <span>Why are these skills paired?</span>
                {whyPairedOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {whyPairedOpen && (
                <p className="text-xs text-[#526e5b] pt-2 leading-relaxed bg-[#f8faf6] p-3 rounded-xl border border-[#dfe7db]">
                  In modern software engineering, tools are rarely used in isolation. Employers hire for
                  cohesive workflows—for example, backend developers using Python need containerization (Docker)
                  and structured databases (PostgreSQL) to ship operational APIs. SkillGap discovers these natural
                  workflow clusters using association rule mining on 2024 LinkedIn job postings.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
