import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  BookmarkPlus,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AnalysisResults({
  results,
  onReset,
  roadmapSkills,
  onToggleRoadmapSkill,
  onGoToRoadmap,
  onGoToTechnical,
}) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!results) return null;

  const {
    role,
    experience_mode,
    total_market_jobs,
    user_skills,
    recommendations,
    active_rules,
    note,
  } = results;

  const isColdStart = user_skills.length === 0;

  // Calculate user-friendly readiness score
  // Based on number of known skills vs core skills + recommendations
  const totalRelevantSkills = Math.max(5, user_skills.length + recommendations.length);
  const readinessPercent = Math.min(
    95,
    Math.max(15, Math.round((user_skills.length / totalRelevantSkills) * 100))
  );

  return (
    <div className="space-y-6 pt-4">
      {/* Top Career Readiness Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 glow-purple relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Skill Gap Analysis Results</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white flex items-center gap-3">
              <span>{role}</span>
              <span className="text-xs px-3 py-1 rounded-full font-medium uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {experience_mode === 'entry' ? '🌱 Entry-Level Focus' : '💼 General Market'}
              </span>
            </h2>

            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {isColdStart ? (
                <span>
                  Here are the <strong>core foundational skills</strong> required by employers hiring for this role.
                </span>
              ) : (
                <span>
                  Based on <strong>{total_market_jobs.toLocaleString()} real job postings</strong>, we found the key companion skills that hiring managers bundle together with your current stack.
                </span>
              )}
            </p>
          </div>

          {/* Readiness Meter Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shrink-0 min-w-[240px] text-center space-y-2">
            <span className="text-xs text-slate-400 font-medium block">Role Match Readiness</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
                {isColdStart ? '0%' : `${readinessPercent}%`}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Match</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 transition-all duration-1000"
                style={{ width: `${isColdStart ? 8 : readinessPercent}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-400">
              {isColdStart
                ? 'Select or learn baseline skills to raise your match.'
                : readinessPercent >= 60
                ? 'Strong foundation! Close the gaps below.'
                : 'Great starting point! Follow the roadmap.'}
            </p>
          </div>
        </div>

        {/* Friendly Status Alert */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-3 text-xs text-indigo-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-white">Insight: </span>
            {isColdStart ? (
              <span>
                Foundational starter skills identified. Adding these to your repertoire will open up entry-level opportunities.
              </span>
            ) : (
              <span>
                Employers looking for your skills (<strong>{user_skills.join(', ')}</strong>) strongly expect the companion skills below for collaboration, deployment, and daily workflows.
              </span>
            )}
          </div>
          <button
            onClick={onReset}
            className="text-xs text-indigo-300 hover:text-white underline font-medium cursor-pointer"
          >
            Edit Skills
          </button>
        </div>
      </div>

      {/* Recommended Missing Skills Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Recommended Skills to Learn Next</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by how strongly employers co-require them alongside your current skill set.
            </p>
          </div>

          {roadmapSkills.length > 0 && (
            <button
              onClick={onGoToRoadmap}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/40 hover:bg-violet-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>View Learning Roadmap ({roadmapSkills.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => {
            const isBookmarked = roadmapSkills.includes(rec.skill);
            const demandPercentage = Math.round(rec.confidence * 100);

            return (
              <div
                key={rec.skill}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Top Line: Priority Tag & Category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                      {index === 0 ? '🔥 Top Priority' : index === 1 ? '⚡ Essential Companion' : '💡 Recommended'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {rec.category}
                    </span>
                  </div>

                  {/* Skill Name & Action */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-heading font-bold text-2xl text-white group-hover:text-violet-300 transition-colors">
                      {rec.skill}
                    </h4>

                    {/* Add to Roadmap Button */}
                    <button
                      type="button"
                      onClick={() => onToggleRoadmapSkill(rec.skill)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-violet-600 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isBookmarked ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Save to Plan</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Plain English "Why this skill?" Reason */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
                    <p className="font-medium text-slate-200 mb-0.5">Why you need this:</p>
                    <p>{rec.explanation}</p>
                  </div>
                </div>

                {/* Bottom Market Evidence */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Demand Frequency: <strong className="text-white">{demandPercentage}%</strong></span>
                  </span>
                  <span>
                    Evidence: <strong className="text-slate-300">{rec.evidence_jobs_count.toLocaleString()}</strong> postings
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle Drawer for Curious Users: Link to Deep Dive Tab */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Curious about how the ECLAT algorithm discovered these?</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            View the mathematical TID-list set intersections, masked-skill evaluation tables, and panel defense notes.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToTechnical}
          className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <span>Open Algorithm & Research Tab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
