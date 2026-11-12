import React, { useEffect, useState } from 'react';
import {
  Binary,
  Activity,
  ShieldCheck,
  BarChart3,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Compass,
} from 'lucide-react';
import { api } from '../api/client';

const DEFENSE_QA = [
  {
    q: 'Why did you use ECLAT instead of Apriori or FP-Growth?',
    a: 'Apriori requires repeated horizontal dataset scans to count candidates, which is computationally expensive for large transaction sets. FP-Growth builds conditional prefix trees which are memory-heavy and algorithmic black boxes. ECLAT (Equivalence Class Transformation) uses a vertical database format (TID-lists) where each skill is represented as a set of posting IDs. Finding co-occurrence is an ultra-fast, direct set intersection: tid(A ∩ B) = tid(A) ∩ tid(B). This makes candidate counting instantaneous and mathematically transparent for academic defense.',
    tag: 'Algorithm Architecture',
  },
  {
    q: 'Isn\'t this just a SQL COUNT(*) query of the most popular skills?',
    a: 'No. A simple COUNT(*) gives marginal probability P(B), recommending the exact same high-frequency skills (like Git or Python) to every student regardless of their background. ECLAT computes conditional association rules P(B | A) and Lift = P(A ∩ B) / (P(A) · P(B)). For example, knowing Python and SQL increases the conditional requirement of Docker with a Lift of 1.86x, whereas knowing Java pivots recommendations toward Spring Boot. ECLAT personalizes recommendations based on conditional itemset co-occurrence.',
    tag: 'ML vs Naive SQL',
  },
  {
    q: 'How are entry-level postings identified?',
    a: 'The builder flags entry-level records using job_level or junior title keywords, with senior title keywords taking precedence. Descriptions and years of experience are not checked. The entry view is a heuristic subset of all retained records; its accuracy awaits human review and it does not guarantee that suggestions suit beginners.',
    tag: 'Dataset Anti-Bias',
  },
  {
    q: 'How did you evaluate the machine learning model without human labelers?',
    a: 'We use an 80/20 train/test split. Production thresholds are fixed before evaluation; one skill is masked from each held-out posting with at least three skills. This tests recovery from partial posting information, not learner usefulness or hiring outcomes.',
    tag: 'Model Evaluation',
  },
];

const LOOPHOLES = [
  {
    title: 'Loophole 1: Seniority Bias',
    problem: 'Source experience labels and title signals can be incomplete or inaccurate.',
    solution: 'Offer a heuristic entry subset with explicit limitations; human label review is pending.',
  },
  {
    title: 'Loophole 2: Predictive Overreach',
    problem: 'Claiming the system predicts job placement or salary guarantees.',
    solution: 'Strictly framed recommendations as descriptive association co-occurrence patterns, not placement guarantees.',
  },
  {
    title: 'Loophole 3: Marginal vs Conditional Gap',
    problem: 'Examiners arguing a basic SQL GROUP BY count achieves the same result.',
    solution: 'Proved via Lift > 1.0 and conditional probability P(B|A) that co-occurring tools cluster intelligently.',
  },
  {
    title: 'Loophole 4: Skill Extraction Noise',
    problem: 'Regex skill extractors capturing false positives (e.g. "Go" in English text).',
    solution: 'Curated 65 canonical tech skills with regex word boundaries and IT category taxonomies.',
  },
  {
    title: 'Loophole 5: Cold-Start Zero Skills',
    problem: 'Users who know 0 skills getting blank recommendations.',
    solution: 'Graceful fallback to unconditional top 1-itemsets (core baseline skills) when antecedents are empty.',
  },
  {
    title: 'Loophole 6: Evaluation Protocol',
    problem: 'Association rule mining is unsupervised and lacks traditional accuracy/loss metrics.',
    solution: 'Evaluated the production rule and fallback path on held-out postings with Hit-Rate@3, Hit-Rate@5, long-tail rates, and confidence intervals.',
  },
];

export default function TechnicalDeepDive({ onGoToAnalyzer }) {
  const [metrics, setMetrics] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState(null);
  const [openQA, setOpenQA] = useState(0); // Accordion state

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoadingMetrics(true);
        const data = await api.getMetrics();
        setMetrics(data || []);
      } catch (err) {
        setMetricsError(err.message || 'Failed to load evaluation metrics');
      } finally {
        setLoadingMetrics(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-4">
      {/* Hero Header */}
      <div className="p-8 rounded-3xl glass-panel border border-indigo-500/30 glow-purple relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
              <Binary className="w-4 h-4" />
              <span>Research & Machine Learning Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              ECLAT Association Mining & Defense Guide
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Complete technical transparency: mathematical formulation of vertical TID-list intersections, 
              Held-out masked-skill benchmarks, and clear answers to academic defense questions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onGoToAnalyzer}
              className="px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Compass className="w-4 h-4" /> Try Career Analyzer
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Mathematical Foundations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Part 1: The Core Algorithm</span>
        </div>
        <h2 className="text-2xl font-heading font-bold text-white">Vertical TID-List ECLAT Engine</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-heading font-semibold text-white text-base">Vertical Representation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlike Apriori which scans horizontal rows repeatedly, ECLAT converts each skill into a Transaction ID list:
            </p>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800">
              tid("Python") = &#123;101, 104, 109, 212&#125;<br />
              tid("SQL") = &#123;101, 103, 104, 305&#125;
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-heading font-semibold text-white text-base">Set Intersection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Joint frequency is calculated by intersecting transaction sets without touching the raw disk dataset:
            </p>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800">
              tid(Python ∩ SQL) = &#123;101, 104&#125;<br />
              Support = |tid(Python ∩ SQL)| / |D|
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-heading font-semibold text-white text-base">Lift & Confidence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rules are filtered by Lift &gt; 1.0 to guarantee true positive co-occurrence over independent chance:
            </p>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-300 border border-slate-800">
              Confidence = P(B | A) = Sup(A∪B) / Sup(A)<br />
              Lift = P(B | A) / P(B) &gt; 1.0
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Validation Benchmark Table */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Part 2: Empirical Evaluation</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white">Masked Skill Hit-Rate@K Benchmark</h2>
            <p className="text-xs text-slate-400">
              Fixed production thresholds; one skill masked from each held-out posting with at least three skills
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
            Protocol: Masked Skill Recovery
          </span>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          {loadingMetrics ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-mono">Loading empirical benchmark metrics...</span>
            </div>
          ) : metricsError ? (
            <div className="p-6 text-center text-rose-400 text-xs font-mono">
              Could not load metrics: {metricsError}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                    <th className="py-3 px-4">Role / Career Track</th>
                    <th className="py-3 px-4">Seniority Segment</th>
                    <th className="py-3 px-4">Test Set</th>
                    <th className="py-3 px-4 text-emerald-400">ECLAT HR@3</th>
                    <th className="py-3 px-4 text-slate-400">Naive Prior HR@3</th>
                    <th className="py-3 px-4 text-cyan-400">ECLAT HR@5</th>
                    <th className="py-3 px-4 text-slate-400">Non-Trivial n</th>
                    <th className="py-3 px-4 text-amber-300">Non-Trivial ECLAT</th>
                    <th className="py-3 px-4 text-slate-400">Non-Trivial Prior</th>
                    <th className="py-3 px-4 text-slate-400">Rule Results</th>
                    <th className="py-3 px-4 text-slate-400">Popularity Fallbacks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics.map((row, idx) => {
                    const testCount = row.test_transactions_count ?? row.test_transactions ?? 0;
                    const nonTrivialTestCount = row.non_trivial_test_transactions_count ?? 0;
                    const eclatHr3 = (row.eclat_hr_at_3 ?? row.eclat_hit_rate_at_3 ?? 0) * 100;
                    const baseHr3 = (row.baseline_hr_at_3 ?? row.naive_hit_rate_at_3 ?? 0) * 100;
                    const eclatHr5 = (row.eclat_hr_at_5 ?? row.eclat_hit_rate_at_5 ?? 0) * 100;
                    const nonTrivialEclat = (row.non_trivial_eclat_hr_at_5 ?? row.eclat_non_trivial_hr_3 ?? 0) * 100;
                    const nonTrivialBase = (row.non_trivial_baseline_hr_at_5 ?? row.naive_non_trivial_hr_3 ?? 0) * 100;
                    const nonTrivialEclatCI = row.non_trivial_eclat_hr_at_5_ci95 ?? [0, 0];
                    const nonTrivialBaseCI = row.non_trivial_baseline_hr_at_5_ci95 ?? [0, 0];

                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white font-sans">{row.role}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                            row.experience_mode === 'entry'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {row.experience_mode === 'entry' ? 'Junior / Entry' : 'All Levels'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{testCount} jobs</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">
                          {eclatHr3.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {baseHr3.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-cyan-400 font-bold">
                          {eclatHr5.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-slate-400">{nonTrivialTestCount}</td>
                        <td className="py-3 px-4 text-amber-300 font-bold">
                          <span title={`95% Wilson interval: ${(nonTrivialEclatCI[0] * 100).toFixed(1)}%-${(nonTrivialEclatCI[1] * 100).toFixed(1)}%`}>
                            {nonTrivialEclat.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          <span title={`95% Wilson interval: ${(nonTrivialBaseCI[0] * 100).toFixed(1)}%-${(nonTrivialBaseCI[1] * 100).toFixed(1)}%`}>
                            {nonTrivialBase.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{row.rule_based_recommendation_transactions_count ?? 0} / {testCount}</td>
                        <td className="py-3 px-4 text-slate-400">{row.popularity_fallback_transactions_count ?? 0} / {testCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>* Long-tail means the masked skill appeared in less than 30% of training postings; intervals are 95% Wilson intervals.</span>
            <span className="text-slate-300 font-semibold">80/20 train/test · production thresholds · one mask per test posting</span>
          </div>
        </div>
      </section>

      {/* Section 3: Academic Defense Q&A Guide */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Part 3: Academic Defense Guide</span>
        </div>
        <h2 className="text-2xl font-heading font-bold text-white">4 Tough Questions Examiners Will Ask</h2>

        <div className="space-y-3">
          {DEFENSE_QA.map((item, index) => {
            const isOpen = openQA === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenQA(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                      Q{index + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 block">
                        {item.tag}
                      </span>
                      <h3 className="font-heading font-semibold text-white text-sm sm:text-base">
                        {item.q}
                      </h3>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 bg-slate-950/40 text-xs sm:text-sm text-slate-300 leading-relaxed pl-15">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: The 6 Loopholes Handled */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Part 4: Methodological Integrity</span>
        </div>
        <h2 className="text-2xl font-heading font-bold text-white">How We Solved Every Academic Loophole</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LOOPHOLES.map((lh, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-heading font-bold text-violet-400 block">
                {lh.title}
              </span>
              <div className="text-xs">
                <span className="text-rose-300 font-medium">Potential Criticism: </span>
                <span className="text-slate-400">{lh.problem}</span>
              </div>
              <div className="text-xs">
                <span className="text-emerald-300 font-medium">Our Solution: </span>
                <span className="text-slate-300">{lh.solution}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
