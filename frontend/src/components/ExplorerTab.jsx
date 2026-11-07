import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { getSkillPurpose, getSkillReason } from '../utils/skillDescriptions';

const ROLE_DESCRIPTIONS = {
  'Backend Developer': 'Builds APIs, databases, servers, and cloud infrastructure.',
  'Frontend Developer': 'Creates user interfaces, websites, and web apps.',
  'Data Analyst': 'Analyzes data, runs SQL queries, and builds dashboards.',
};

const PRESETS = {
  'Backend Developer': [
    { label: 'Python & SQL', skills: ['Python', 'SQL'] },
    { label: 'Java & SQL', skills: ['Java', 'SQL'] },
    { label: 'Node.js', skills: ['JavaScript', 'Node.js'] },
    { label: 'Beginner', skills: [] },
  ],
  'Frontend Developer': [
    { label: 'React & JS', skills: ['JavaScript', 'React'] },
    { label: 'HTML & CSS', skills: ['HTML', 'CSS'] },
    { label: 'TypeScript', skills: ['TypeScript', 'React'] },
    { label: 'Beginner', skills: [] },
  ],
  'Data Analyst': [
    { label: 'SQL & Tableau', skills: ['SQL', 'Tableau'] },
    { label: 'Python & SQL', skills: ['Python', 'SQL'] },
    { label: 'Excel & SQL', skills: ['SQL', 'Excel'] },
    { label: 'Beginner', skills: [] },
  ],
};

// Popular baseline skills per role for quick picking
const ROLE_POPULAR_SKILLS = {
  'Backend Developer': ['Python', 'SQL', 'Docker', 'REST APIs', 'Java', 'Git', 'PostgreSQL', 'Node.js', 'FastAPI', 'Redis'],
  'Frontend Developer': ['JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'Git', 'HTML', 'CSS', 'Tailwind CSS', 'Next.js', 'Node.js'],
  'Data Analyst': ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel', 'Pandas', 'PostgreSQL', 'Git', 'R'],
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
  roadmapSkills,
  onToggleRoadmapSkill,
  onGoToRoadmaps,
}) {
  const [skillSearch, setSkillSearch] = useState('');
  const [openWhy, setOpenWhy] = useState({});

  const toggleWhy = (skill) => {
    setOpenWhy((prev) => ({ ...prev, [skill]: !prev[skill] }));
  };

  const currentRoleObj = roles.find((r) => r.role_name === selectedRole) || roles[0];
  const rolePresets = PRESETS[selectedRole] || [];
  const popularSkills = ROLE_POPULAR_SKILLS[selectedRole] || ['Python', 'SQL', 'Git'];
  const recommendations = analysisResults?.recommendations || [];

  const totalPostings =
    experienceMode === 'entry'
      ? currentRoleObj?.entry_postings_count || 170
      : currentRoleObj?.all_postings_count || 800;

  // Filter skills by search query
  const displayedSkills = useMemo(() => {
    if (!skillSearch.trim()) return popularSkills;
    const query = skillSearch.toLowerCase();
    const all = [];
    Object.values(skillsByCategory).forEach((arr) => {
      arr.forEach((s) => {
        if (s.toLowerCase().includes(query) && !all.includes(s)) {
          all.push(s);
        }
      });
    });
    return all.slice(0, 15);
  }, [skillSearch, popularSkills, skillsByCategory]);

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      {/* TactiChess Header */}
      <div>
        <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-wider block mb-1">
          THE EXPLORER
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1b2b20] tracking-tight">
          Discover skill connections
        </h1>
        <p className="text-sm text-[#526456] mt-1 max-w-2xl leading-relaxed">
          Choose a role, pick what you know, and see what usually appears with your skills in real job postings.
        </p>
      </div>

      {/* 2-Column TactiChess Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recommended Skills (Main Card) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#edf1ea]">
              <div>
                <h2 className="font-editorial text-2xl font-bold text-[#1b2b20]">
                  Recommended skills
                </h2>
                <p className="text-xs text-[#526456] mt-0.5">
                  {selectedRole} • {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'Starting from scratch'}
                </p>
              </div>

              {selectedSkills.length > 0 && (
                <button
                  type="button"
                  onClick={onClearSkills}
                  className="text-xs text-[#637667] hover:text-[#1b2b20] font-medium cursor-pointer"
                >
                  Clear skills
                </button>
              )}
            </div>

            {/* Experience Filter (TactiChess Difficulty buttons: All / Entry) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#1b2b20] uppercase tracking-wide block">
                Job level
              </span>
              <div className="flex items-center gap-2 bg-[#f4f6f1] p-1 rounded-xl border border-[#dfe5dc] w-fit">
                <button
                  type="button"
                  onClick={() => onChangeExperienceMode('entry')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    experienceMode === 'entry'
                      ? 'bg-white text-[#1b3729] font-bold shadow-2xs'
                      : 'text-[#586c5e] hover:text-[#1b2b20]'
                  }`}
                >
                  Entry-level only
                </button>
                <button
                  type="button"
                  onClick={() => onChangeExperienceMode('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    experienceMode === 'all'
                      ? 'bg-white text-[#1b3729] font-bold shadow-2xs'
                      : 'text-[#586c5e] hover:text-[#1b2b20]'
                  }`}
                >
                  All levels
                </button>
              </div>
            </div>

            {/* Subtitle Count */}
            <div className="text-xs text-[#637667]">
              {recommendations.length} recommendations based on {totalPostings} real postings
            </div>

            {/* Skill Cards (Just like TactiChess tactic cards) */}
            <div className="space-y-3 pt-1">
              {recommendations.length === 0 ? (
                <div className="p-8 text-center bg-[#f9faf7] rounded-xl border border-dashed border-[#d2ded0] text-xs text-[#526456]">
                  You have selected the top core skills for this role! Check the Roadmaps tab to review practice projects.
                </div>
              ) : (
                recommendations.map((rec) => {
                  const isSaved = roadmapSkills.includes(rec.skill);
                  const isExpanded = openWhy[rec.skill];
                  const purpose = getSkillPurpose(rec.skill);
                  const reason = getSkillReason(rec.skill, selectedSkills);

                  return (
                    <div
                      key={rec.skill}
                      className={`p-4 rounded-xl border transition-all ${
                        isSaved
                          ? 'bg-[#f4f8f4] border-[#b4dbb9]'
                          : 'bg-white border-[#e1e6dd] hover:border-[#b8ccb6]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-[#1b2b20]">
                              {rec.skill}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#f0f4ee] text-[#2c4434]">
                              {rec.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#526456] leading-relaxed">
                            {purpose}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleRoadmapSkill(rec.skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                            isSaved
                              ? 'bg-[#2d6a4f] text-white'
                              : 'bg-[#f2f6f0] hover:bg-[#e4ece1] text-[#1b3729] border border-[#d2ded0]'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to roadmap</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* TactiChess accordion: "Why are these tactics paired?" */}
                      <div className="mt-3 pt-2.5 border-t border-[#edf1ea]">
                        <button
                          type="button"
                          onClick={() => toggleWhy(rec.skill)}
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
                          <p className="mt-2 text-xs text-[#526456] bg-[#f9faf7] p-2.5 rounded-lg border border-[#e4ede1] leading-relaxed">
                            {reason}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom roadmap callout */}
            <div className="pt-3 flex items-center justify-between border-t border-[#edf1ea] text-xs">
              <span className="text-[#637667]">
                {roadmapSkills.length} skills saved to your roadmap
              </span>
              <button
                type="button"
                onClick={onGoToRoadmaps}
                className="text-[#1b3729] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Controls (TactiChess Sidebar Cards) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Choose a role */}
          <div className="p-5 rounded-2xl bg-white border border-[#e1e6dd] space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-[#1b2b20] uppercase tracking-wide block">
                Choose a role
              </span>
              <span className="text-xs text-[#526456] block mt-0.5">
                Target career
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => onSelectRole(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#f8faf7] border border-[#d2ded0] text-sm font-semibold text-[#1b2b20] focus:outline-hidden focus:border-[#2d6a4f] cursor-pointer appearance-none pr-9"
              >
                {roles.map((r) => (
                  <option key={r.role_name} value={r.role_name}>
                    {r.role_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#586c5e] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <p className="text-xs text-[#526456]">
              {ROLE_DESCRIPTIONS[selectedRole]}
            </p>

            <button
              type="button"
              onClick={() => onSelectRole('Backend Developer')}
              className="text-xs text-[#2d6a4f] hover:underline cursor-pointer block"
            >
              Reset to Backend Developer
            </button>
          </div>

          {/* Card 2: Pair it with another skill (3 connections) */}
          <div className="p-5 rounded-2xl bg-white border border-[#e1e6dd] space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-[#1b2b20] uppercase tracking-wide block">
                Skills you already know
              </span>
              <span className="text-xs text-[#526456] block mt-0.5">
                Click what you have experience with
              </span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {rolePresets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onApplyPreset(p.skills)}
                  className="px-2.5 py-1 rounded-lg bg-[#f0f4ee] hover:bg-[#e4ece1] text-[#2c4434] text-xs font-medium border border-[#d2ded0] transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#728576] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search more skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#f8faf7] border border-[#d2ded0] text-xs text-[#1b2b20] placeholder-[#819284] focus:outline-hidden focus:border-[#2d6a4f]"
              />
            </div>

            {/* Skill Pills */}
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {displayedSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => onToggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1b3729] text-white font-semibold'
                        : 'bg-[#f4f7f2] hover:bg-[#e6eee3] text-[#34483a] border border-[#d8e2d6]'
                    }`}
                  >
                    {skill} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
