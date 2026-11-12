import React from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';

const DEFENSE_QA = [
  {
    q: 'Why did you use ECLAT instead of Apriori or FP-Growth?',
    a: 'Apriori requires repeated horizontal dataset scans to count candidates, which is computationally expensive. FP-Growth builds conditional prefix trees which are memory-heavy and opaque. ECLAT uses a vertical database format (TID-lists) where each skill is represented as a set of posting IDs. Finding co-occurrence is a straightforward, ultra-fast set intersection: tid(A ∩ B) = tid(A) ∩ tid(B), making it mathematically transparent for educational defense.',
  },
  {
    q: 'Isn\'t this just a SQL COUNT(*) query of the most popular skills?',
    a: 'No. A simple COUNT(*) gives marginal probability P(B), recommending the exact same skills to every student. ECLAT computes conditional association rules P(B | A) and Lift. For example, knowing Python and SQL increases the conditional requirement of Docker with a Lift of 1.86x, whereas knowing Java pivots recommendations toward Spring Boot. ECLAT personalizes recommendations based on conditional itemsets.',
  },
  {
    q: 'How are entry-level postings identified?',
    a: 'The builder uses job_level or junior title keywords, with senior title keywords taking precedence. It does not check descriptions or years of experience. The entry view is a heuristic subset of all retained records, and human label review is pending.',
  },
  {
    q: 'How did you evaluate the machine learning model?',
    a: 'We use an 80/20 train/test split with fixed production thresholds. One skill is masked from each held-out posting with at least three skills, then the production rule and fallback path are compared with a popularity baseline using Hit-Rate@3, Hit-Rate@5, and long-tail rates with confidence intervals. This measures recovery from partial posting data, not learner usefulness or hiring outcomes.',
  },
];

export default function DefenseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Machine Learning Defense Guide</h3>
              <p className="text-xs text-slate-400 font-mono">Answers to the 4 Tough Questions Panel Examiners Will Ask</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Q&A Cards */}
        <div className="space-y-4">
          {DEFENSE_QA.map((item, index) => (
            <div key={index} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                  Q{index + 1}
                </span>
                <h4 className="font-heading font-semibold text-sm text-white">{item.q}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-7.5">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
