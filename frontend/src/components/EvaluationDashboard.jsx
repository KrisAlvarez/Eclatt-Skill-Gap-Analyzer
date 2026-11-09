import React, { useEffect, useState } from 'react';
import { Activity, Award, HelpCircle, CheckCircle, BarChart3, TrendingUp, Info } from 'lucide-react';
import { api } from '../api/client';

export default function EvaluationDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hr5Comparison = metrics.reduce((summary, row) => {
    if (row.eclat_hr_at_5 > row.baseline_hr_at_5) summary.eclatAhead += 1;
    else if (row.baseline_hr_at_5 > row.eclat_hr_at_5) summary.baselineAhead += 1;
    else summary.tied += 1;
    return summary;
  }, { eclatAhead: 0, baselineAhead: 0, tied: 0 });

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const data = await api.getMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err.message || 'Failed to load evaluation metrics');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 glow-purple">
        <div className="flex items-center gap-2.5 text-violet-400 text-xs font-mono uppercase tracking-wider mb-2">
          <Activity className="w-4 h-4" />
          <span>Empirical Machine Learning Rigor</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
          Model Evaluation: Masked Skill Recovery
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          This offline experiment checks whether the production recommendation path can recover one hidden skill
          from a held-out posting. It does not measure learner usefulness, skill mastery, or hiring outcomes.
        </p>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-mono text-slate-400 block mb-1">Experiment Protocol</span>
            <span className="text-base font-bold text-white block">80/20 Train-Test</span>
            <p className="text-xs text-slate-400 mt-1">
              Production thresholds are fixed; one skill is masked from each held-out posting with at least three skills.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-mono text-slate-400 block mb-1">Target Evaluation Metric</span>
            <span className="text-base font-bold text-emerald-400 block">Hit-Rate@3 & Hit-Rate@5</span>
            <p className="text-xs text-slate-400 mt-1">
              Measures percentage of test transactions where the masked skill is recovered in top recommendations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-mono text-slate-400 block mb-1">Recommendation Source</span>
            <span className="text-base font-bold text-violet-400 block">Rules or Popularity Fallback</span>
            <p className="text-xs text-slate-400 mt-1">
              Counts show how often a test input received association-rule suggestions or the fallback list.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h3 className="font-heading font-bold text-lg text-white">Held-Out Benchmark Table</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Offline Test Results</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading evaluation benchmark data...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-400 text-sm">
            Error loading metrics: {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                  <th className="py-3 px-4">Role / Career Track</th>
                  <th className="py-3 px-4">Seniority Segment</th>
                  <th className="py-3 px-4">Test Set</th>
                  <th className="py-3 px-4">ECLAT HR@3</th>
                  <th className="py-3 px-4">Naive Prior HR@3</th>
                  <th className="py-3 px-4">ECLAT HR@5</th>
                  <th className="py-3 px-4">Popularity Prior HR@5</th>
                  <th className="py-3 px-4">Non-Trivial Test Set</th>
                  <th className="py-3 px-4">Non-Trivial ECLAT HR@5</th>
                  <th className="py-3 px-4">Non-Trivial Prior HR@5</th>
                  <th className="py-3 px-4">Rule Results</th>
                  <th className="py-3 px-4">Popularity Fallbacks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {metrics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-white">{row.role}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        row.experience_mode === 'entry'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {row.experience_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{row.test_transactions_count} jobs</td>
                    <td className="py-3.5 px-4 font-bold text-white">{(row.eclat_hr_at_3 * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-slate-400">{(row.baseline_hr_at_3 * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{(row.eclat_hr_at_5 * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-slate-400">{(row.baseline_hr_at_5 * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.non_trivial_test_transactions_count} jobs</td>
                    <td className="py-3.5 px-4 font-bold text-violet-400">
                      <span title={`95% Wilson interval: ${((row.non_trivial_eclat_hr_at_5_ci95 || [0, 0])[0] * 100).toFixed(1)}%-${((row.non_trivial_eclat_hr_at_5_ci95 || [0, 0])[1] * 100).toFixed(1)}%`}>
                        {(row.non_trivial_eclat_hr_at_5 * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <span title={`95% Wilson interval: ${((row.non_trivial_baseline_hr_at_5_ci95 || [0, 0])[0] * 100).toFixed(1)}%-${((row.non_trivial_baseline_hr_at_5_ci95 || [0, 0])[1] * 100).toFixed(1)}%`}>
                        {(row.non_trivial_baseline_hr_at_5 * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{row.rule_based_recommendation_transactions_count} / {row.test_transactions_count}</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.popularity_fallback_transactions_count} / {row.test_transactions_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Academic Defense Interpretation */}
      <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-4">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
          <Info className="w-4 h-4" />
          <span>How to Interpret These Results in Your Project Defense:</span>
        </div>
        {!loading && !error && metrics.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-indigo-200/90 leading-relaxed">
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-indigo-900/40">
            <strong className="text-white block font-medium">HR@5 comparison</strong>
            <p>
              Results vary by role and experience segment. ECLAT is higher in {hr5Comparison.eclatAhead} of {metrics.length} groups; the popularity prior is higher in {hr5Comparison.baselineAhead}{hr5Comparison.tied > 0 ? `, with ${hr5Comparison.tied} tied` : ''}. Compare the results for each group above.
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-indigo-900/40">
            <strong className="text-white block font-medium">Non-trivial recovery</strong>
            <p>
              These rates use only the non-trivial test cases shown in the table. The smaller denominator can make the results less stable, so consider it alongside the overall Hit-Rate@5 values.
            </p>
          </div>
        </div>}
      </div>
    </div>
  );
}
