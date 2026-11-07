import React, { useState } from 'react';
import {
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BarChart2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AnalysisResults({ results, onReset }) {
  const [showRawRules, setShowRawRules] = useState(false);

  if (!results) return null;

  const {
    role,
    experience_mode,
    total_market_jobs,
    user_skills,
    recommendations,
    active_rules,
    sub_lattice_fallback_used,
    matched_subset,
    note,
  } = results;

  const isColdStart = user_skills.length === 0;

  return (
    <div className="space-y-6 pt-4">
      {/* Results Header Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 glow-purple">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">3</span>
              ECLAT Association Analysis Complete
            </div>
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
              <span>{role}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-normal uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {experience_mode === 'entry' ? 'Entry-Level Model' : 'All Seniorities'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Mined across <strong>{total_market_jobs.toLocaleString()}</strong> verified technical job postings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            >
              Modify Selection
            </button>
          </div>
        </div>

        {/* Tier Fallback Banner */}
        <div className={`mt-5 p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
          isColdStart
            ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
            : sub_lattice_fallback_used
            ? 'bg-indigo-950/40 border-indigo-800/40 text-indigo-200'
            : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
        }`}>
          <div className="shrink-0 mt-0.5">
            {isColdStart ? (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            ) : sub_lattice_fallback_used ? (
              <Layers className="w-4 h-4 text-indigo-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="space-y-0.5">
            <span className="font-semibold text-white block">
              {isColdStart
                ? 'Tier 3 Active (Cold-Start Foundational Prior)'
                : sub_lattice_fallback_used
                ? `Tier 2 Active (Sub-Lattice Complement via ${matched_subset ? `[${matched_subset.join(', ')}]` : 'subsets'})`
                : 'Tier 1 Active (Exact Antecedent Rule Match)'}
            </span>
            <p className="opacity-90">{note}</p>
          </div>
        </div>
      </div>

      {/* Main Results Split: Missing Skills Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              <span>Recommended Co-Required Skills</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ranked mathematically by <strong>Confidence</strong> (conditional likelihood) and <strong>Lift</strong> (strength over chance).
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {recommendations.length} Gaps Identified
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
            <p className="text-sm">No skill gaps found! Your selected profile matches all mined core requirements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => {
              const confidencePct = Math.round(rec.confidence * 100);
              const isHighLift = rec.lift > 1.25;

              return (
                <div
                  key={rec.skill}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-violet-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Rank, Name, Category */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-heading font-bold text-base text-white">{rec.skill}</h4>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{rec.category}</span>
                        </div>
                      </div>

                      {/* Tier Badge */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0">
                        {rec.tier.split(':')[0]}
                      </span>
                    </div>

                    {/* Metrics Bar */}
                    <div className="space-y-1.5 my-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Conditional Confidence:</span>
                        <span className="text-emerald-400 font-bold">{confidencePct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.max(10, confidencePct))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Plain Language Explanation */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 my-3">
                      {rec.explanation}
                    </p>
                  </div>

                  {/* Bottom Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <span>Lift:</span>
                      <strong className={isHighLift ? 'text-violet-400' : 'text-slate-200'}>
                        {rec.lift.toFixed(2)}x
                      </strong>
                    </span>
                    <span>
                      Evidence: <strong className="text-slate-200">{rec.evidence_jobs_count.toLocaleString()}</strong> postings
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Collapsible Mined Association Rules Inspector */}
      {active_rules && active_rules.length > 0 && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRawRules(!showRawRules)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">Mined Mathematical Association Rules ({active_rules.length})</span>
            </div>
            {showRawRules ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showRawRules && (
            <div className="p-4 border-t border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-2">Antecedent (Known)</th>
                    <th className="pb-2"></th>
                    <th className="pb-2">Consequent (Missing)</th>
                    <th className="pb-2">Support</th>
                    <th className="pb-2">Confidence</th>
                    <th className="pb-2">Lift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {active_rules.map((rule, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2 text-violet-300">[{rule.antecedent.join(', ')}]</td>
                      <td className="py-2 text-slate-500">→</td>
                      <td className="py-2 text-emerald-300">[{rule.consequent.join(', ')}]</td>
                      <td className="py-2 text-slate-400">{(rule.support * 100).toFixed(1)}%</td>
                      <td className="py-2 text-emerald-400 font-bold">{(rule.confidence * 100).toFixed(1)}%</td>
                      <td className="py-2 text-violet-400 font-bold">{rule.lift.toFixed(2)}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
