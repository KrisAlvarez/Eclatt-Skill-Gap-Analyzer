import React, { useState } from 'react';
import { CheckCircle2, Circle, Trash2, ArrowRight, BookOpen, Compass, Award, Printer } from 'lucide-react';

export default function LearningRoadmap({
  selectedRole,
  userSkills,
  roadmapSkills,
  onToggleRoadmapSkill,
  onGoToAnalyzer,
}) {
  const [completedRoadmapSkills, setCompletedRoadmapSkills] = useState([]);

  const toggleCompleted = (skill) => {
    setCompletedRoadmapSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Roadmap Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 glow-purple flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-violet-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Personalized Career Path
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            Your {selectedRole} Study Roadmap
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            A practical, step-by-step checklist based on real job postings to bridge your gap and make you interview-ready.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Plan
          </button>
          <button
            type="button"
            onClick={onGoToAnalyzer}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" /> Modify Skills
          </button>
        </div>
      </div>

      {/* 3 Step Timeline */}
      <div className="space-y-6">
        {/* Phase 1: Current Skills */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Phase 1: Your Current Repertoire</h3>
              <p className="text-xs text-slate-400">Skills you already know that form your foundation</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {userSkills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills selected yet. Select some in the Career Analyzer!</p>
            ) : (
              userSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 text-xs font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{skill}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Phase 2: Next Recommended Skills (Your Saved Checklist) */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-violet-500/40 shadow-lg shadow-violet-950/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white">Phase 2: Priority Companion Skills</h3>
                <p className="text-xs text-slate-400">Recommended by market co-occurrence to close your specific gap</p>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-400">
              {completedRoadmapSkills.length} of {roadmapSkills.length} completed
            </span>
          </div>

          {roadmapSkills.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                You haven't saved any skills to your roadmap yet! Go to the <strong>Career Analyzer</strong>, run the gap analysis, and click <strong>"Save to Plan"</strong> on the skills you want to learn.
              </p>
              <button
                onClick={onGoToAnalyzer}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Find Recommended Skills</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 pt-2">
              {roadmapSkills.map((skill) => {
                const isDone = completedRoadmapSkills.includes(skill);
                return (
                  <div
                    key={skill}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      onClick={() => toggleCompleted(skill)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isDone ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {skill}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleRoadmapSkill(skill)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-850 transition-colors cursor-pointer"
                      title="Remove from plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phase 3: Milestone Job Readiness */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Phase 3: Job-Ready Portfolio Target</h3>
              <p className="text-xs text-slate-400">Build projects combining your current stack with your new companion skills to demonstrate capability to recruiters.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
