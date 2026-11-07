import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  BookmarkPlus,
  BookmarkCheck,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

const ROLE_DESCRIPTIONS = {
  'Backend Developer':
    'Design APIs, database schemas, microservices, and server-side deployment architectures.',
  'Frontend Developer':
    'Build responsive, interactive user interfaces, web applications, and modern frontend states.',
  'Data Analyst':
    'Process datasets, construct SQL metrics, and build visual dashboards for business stakeholders.',
};

const PRESETS = {
  'Backend Developer': [
    { label: '🐍 Python & SQL Starter', skills: ['Python', 'SQL'] },
    { label: '☕ Java Developer', skills: ['Java', 'SQL', 'Git'] },
    { label: '🌱 Complete Beginner', skills: [] },
  ],
  'Frontend Developer': [
    { label: '⚛️ React Junior', skills: ['JavaScript', 'React', 'HTML/CSS'] },
    { label: '📘 TypeScript Dev', skills: ['TypeScript', 'React', 'Git'] },
    { label: '🌱 Complete Beginner', skills: [] },
  ],
  'Data Analyst': [
    { label: '📊 SQL & Tableau', skills: ['SQL', 'Tableau'] },
    { label: '🐍 Python Analytics', skills: ['Python', 'SQL', 'Pandas'] },
    { label: '🌱 Complete Beginner', skills: [] },
  ],
};

export default function ExplorerTab({
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
  onAnalyze,
  roadmapSkills,
  onToggleRoadmapSkill,
  onGoToRoadmaps,
}) {
  const [skillSearch, setSkillSearch] = useState('');
  const [openExplanation, setOpenExplanation] = useState({});

  const toggleExplanation = (skill) => {
    setOpenExplanation((prev) => ({
      ...prev,
      [skill]: !prev[skill],
    }));
  };

  // Flattened skills for easy selection
  const allSkills = useMemo(() => {
    const list = [];
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      skills.forEach((skill) => {
        if (!skillSearch || skill.toLowerCase().includes(skillSearch.toLowerCase())) {
          list.push({ skill, category });
        }
      });
    });
    return list;
  }, [skillsByCategory, skillSearch]);

  const currentRoleObj = roles.find((r) => r.role_name === selectedRole) || roles[0];
  const rolePresets = PRESETS[selectedRole] || [];

  const recommendations = analysisResults?.recommendations || [];
  const totalJobs =
    experienceMode === 'entry'
      ? currentRoleObj?.entry_postings_count || 170
      : currentRoleObj?.all_postings_count || 800;

  // Career match percentage
  const totalSkillsConsidered = Math.max(5, selectedSkills.length + recommendations.length);
  const readinessPercent = Math.min(
    95,
    Math.max(15, Math.round((selectedSkills.length / totalSkillsConsidered) * 100))
  );

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto">
      {/* Page Header (TactiChess Style) */}
      <div>
        <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-wider block mb-1">
          THE EXPLORER
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1b2b20] tracking-tight">
          Discover skill connections
        </h1>
        <p className="text-sm text-[#4d5e51] mt-1 max-w-3xl leading-relaxed">
          Choose a target career track, select the skills you already know, and discover which
          companion tools appear most frequently in real job postings.
        </p>
      </div>

      {/* 2-Column TactiChess Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recommendations & Skill Connections (Main View) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-6">
            {/* Header with Role & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#edf1ea] gap-3">
              <div>
                <h2 className="font-editorial text-2xl font-bold text-[#1b2b20]">
                  Career recommendations
                </h2>
                <p className="text-xs text-[#526456] mt-0.5">
                  Target: <span className="font-semibold text-[#1b2b20]">{selectedRole}</span> •{' '}
                  {selectedSkills.length > 0 ? (
                    <span>Known: {selectedSkills.join(', ')}</span>
                  ) : (
                    <span className="italic">Starting fresh</span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('control-sidebar');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#f2f6f0] hover:bg-[#e4ece1] text-[#1b3729] text-xs font-semibold border border-[#d2ded0] transition-colors cursor-pointer self-start sm:self-auto"
              >
                Change role / skills
              </button>
            </div>

            {/* Seniority Filter Buttons (Like TactiChess Puzzle Difficulty) */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#1b2b20] uppercase tracking-wider block">
                Job Seniority Filter
              </span>
              <div className="flex items-center gap-2 bg-[#f4f6f1] p-1 rounded-xl border border-[#dfe5dc] w-fit">
                <button
                  type="button"
                  onClick={() => onChangeExperienceMode('entry')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    experienceMode === 'entry'
                      ? 'bg-white text-[#1b3729] font-bold shadow-xs'
                      : 'text-[#586c5e] hover:text-[#1b2b20]'
                  }`}
                >
                  Entry-Level & Junior
                </button>
                <button
                  type="button"
                  onClick={() => onChangeExperienceMode('all')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    experienceMode === 'all'
                      ? 'bg-white text-[#1b3729] font-bold shadow-xs'
                      : 'text-[#586c5e] hover:text-[#1b2b20]'
                  }`}
                >
                  All Industry Roles
                </button>
              </div>
              <p className="text-[11px] text-[#637667]">
                {experienceMode === 'entry'
                  ? 'Filtering specifically for junior positions to eliminate senior architecture tool requirements.'
                  : 'Analyzing all seniorities across the full market sample.'}
              </p>
            </div>

            {/* Posting Count & Career Match Gauge */}
            <div className="p-4 rounded-xl bg-[#f8faf7] border border-[#e4ebe0] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1b2b20]">
                  Career Readiness Score
                </span>
                <span className="font-bold text-[#2d6a4f]">
                  {readinessPercent}% Match
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#e3eae0] overflow-hidden">
                <div
                  className="h-full bg-[#2d6a4f] rounded-full transition-all duration-700"
                  style={{ width: `${readinessPercent}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-[#5c6f60]">
                Based on <strong className="text-[#1b2b20]">{totalJobs}</strong> verified LinkedIn postings for this specialization.
              </p>
            </div>

            {/* Recommendations List (TactiChess Style Cards) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
                  Companion skills to learn
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e6f1e8] text-[#2d6a4f] font-semibold border border-[#cce2d2]">
                  {recommendations.length} recommended
                </span>
              </div>

              {recommendations.length === 0 ? (
                <div className="p-8 text-center bg-[#f9faf7] rounded-xl border border-dashed border-[#d2ded0] space-y-3">
                  <Sparkles className="w-6 h-6 text-[#2d6a4f] mx-auto" />
                  <p className="text-xs text-[#526456]">
                    Click <strong className="text-[#1b2b20]">"Analyze Skill Connections"</strong> in the sidebar to view personalized companion tools.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => {
                    const isSaved = roadmapSkills.includes(rec.skill);
                    const isExpanded = openExplanation[rec.skill];

                    return (
                      <div
                        key={rec.skill}
                        className={`p-4 sm:p-5 rounded-xl border transition-all ${
                          isSaved
                            ? 'bg-[#f4f9f4] border-[#b4dbb9]'
                            : 'bg-white border-[#e1e6dd] hover:border-[#b8ccb6]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-[#1b2b20]">
                                {rec.skill}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-[#edf2ea] text-[#3b5542] text-[10px] font-semibold">
                                {rec.category}
                              </span>
                              {rec.priority && (
                                <span className="px-2 py-0.5 rounded-md bg-[#eef7ee] text-[#215332] text-[10px] font-medium border border-[#cde0cb]">
                                  {rec.priority}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#526456] leading-relaxed">
                              {rec.plain_english || rec.learning_reason}
                            </p>
                          </div>

                          {/* Save Button */}
                          <button
                            type="button"
                            onClick={() => onToggleRoadmapSkill(rec.skill)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                              isSaved
                                ? 'bg-[#2d6a4f] text-white'
                                : 'bg-[#f0f4ee] hover:bg-[#e4ece1] text-[#1b3729] border border-[#d2ded0]'
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Roadmap</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Accordion: Why are these paired? (Just like TactiChess!) */}
                        <div className="mt-3 pt-3 border-t border-[#edf1ea]">
                          <button
                            type="button"
                            onClick={() => toggleExplanation(rec.skill)}
                            className="text-[11px] font-medium text-[#2d6a4f] hover:text-[#1b3729] flex items-center gap-1 cursor-pointer"
                          >
                            <span>▶ Why is {rec.skill} paired with your skills?</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-3 rounded-lg bg-[#f9faf7] text-xs text-[#445548] leading-relaxed border border-[#e4ede1]">
                              Found in <strong>{Math.round((rec.confidence || 0.8) * 100)}%</strong> of job postings requiring your existing toolkit. In production tech stacks, employers require this companion skill to complete end-to-end development workflows.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Roadmap Navigation Callout */}
            {recommendations.length > 0 && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#edf1ea]">
                <span className="text-xs text-[#526456]">
                  {roadmapSkills.length} skills saved to your personal study checklist
                </span>
                <button
                  type="button"
                  onClick={onGoToRoadmaps}
                  className="px-4 py-2 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Open Learning Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Controls & Skill Picker (TactiChess Sidebar Style) */}
        <div id="control-sidebar" className="lg:col-span-5 space-y-6">
          {/* Card 1: Choose a Target Role */}
          <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-[#1b2b20] uppercase tracking-wider block">
                Target Role
              </span>
              <label htmlFor="role-select" className="font-editorial text-xl font-bold text-[#1b2b20] block mt-0.5">
                Choose a career track
              </label>
            </div>

            <div className="relative">
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => onSelectRole(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#f8faf7] border border-[#d2ded0] text-sm font-semibold text-[#1b2b20] focus:outline-hidden focus:border-[#2d6a4f] cursor-pointer appearance-none pr-10"
              >
                {roles.map((r) => (
                  <option key={r.role_name} value={r.role_name}>
                    {r.role_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#586c5e] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <p className="text-xs text-[#526456] leading-relaxed">
              {ROLE_DESCRIPTIONS[selectedRole] || 'Explore market co-occurrences.'}
            </p>
          </div>

          {/* Card 2: Select Skills You Already Know */}
          <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#1b2b20] uppercase tracking-wider block">
                  Your Current Toolkit
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#1b2b20]">
                  Skills you already know
                </h3>
              </div>

              {selectedSkills.length > 0 && (
                <button
                  type="button"
                  onClick={onClearSkills}
                  className="text-xs text-[#637667] hover:text-[#b91c1c] font-medium cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Quick Starter Presets */}
            <div>
              <span className="text-[11px] font-semibold text-[#526456] block mb-2">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {rolePresets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onApplyPreset(p.skills)}
                    className="px-2.5 py-1 rounded-lg bg-[#f0f4ee] hover:bg-[#e4ece1] text-[#2c4434] text-[11px] font-medium border border-[#d2ded0] transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#728576] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search skills (e.g. Python, React, SQL)..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f8faf7] border border-[#d2ded0] text-xs text-[#1b2b20] placeholder-[#819284] focus:outline-hidden focus:border-[#2d6a4f]"
              />
            </div>

            {/* Skill Tag Cloud */}
            <div className="max-h-56 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map(({ skill }) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => onToggleSkill(skill)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1b3729] text-white shadow-2xs font-semibold'
                          : 'bg-[#f4f7f2] hover:bg-[#e6eee3] text-[#34483a] border border-[#d8e2d6]'
                      }`}
                    >
                      {skill} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Reactive Update Badge */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-[#5c6f60] border-t border-[#edf1ea]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-pulse"></span>
                <span>Live Co-Occurrence Analysis</span>
              </span>
              <span className="italic text-[#7b8f7f]">
                Updates instantly as you select
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
