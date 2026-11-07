import React, { useState } from 'react';
import { Database, ShieldCheck, ChevronDown, ChevronUp, CheckCircle2, Heart } from 'lucide-react';

export default function AboutView() {
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#476b53] block mb-1">
          ABOUT SKILLGAP
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#142e20] tracking-tight">
          Data-driven career guidance
        </h1>
        <p className="text-sm sm:text-base text-[#4f6b58] mt-2 max-w-2xl leading-relaxed">
          SkillGap is an educational project designed to bridge the gap between academic study
          and real-world tech hiring standards.
        </p>
      </div>

      {/* Main Narrative Card */}
      <div className="tacti-card p-6 sm:p-8 rounded-3xl border border-[#e2e8df] space-y-5">
        <h2 className="text-2xl font-serif font-bold text-[#153422]">
          Why SkillGap Exists
        </h2>
        <p className="text-sm text-[#4d6a56] leading-relaxed">
          Many aspiring developers and data analysts face analysis paralysis when choosing what to learn next.
          Online courses often present endless lists of tools without indicating which technologies are actually
          paired together in the workplace.
        </p>
        <p className="text-sm text-[#4d6a56] leading-relaxed">
          SkillGap was built to solve this problem by mining over <strong>123,000 real 2024 tech job postings</strong> from
          LinkedIn. Rather than showing simple popularity counts, SkillGap discovers natural workflow clusters:
          if a job requires Python and SQL, what companion tools (like Docker or FastAPI) are actually expected alongside them?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#e8efe5]">
          <div className="p-4 rounded-2xl bg-[#f5f8f3] border border-[#dce6d8]">
            <span className="text-xs text-[#5f7e69] block">Data Source</span>
            <span className="font-serif font-bold text-base text-[#153422] block mt-0.5">LinkedIn 2024</span>
            <span className="text-[11px] text-[#55735f]">123,849 job postings</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#f5f8f3] border border-[#dce6d8]">
            <span className="text-xs text-[#5f7e69] block">Model Type</span>
            <span className="font-serif font-bold text-base text-[#153422] block mt-0.5">Pattern Co-Occurrence</span>
            <span className="text-[11px] text-[#55735f]">Conditional association</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#f5f8f3] border border-[#dce6d8]">
            <span className="text-xs text-[#5f7e69] block">Seniority Scope</span>
            <span className="font-serif font-bold text-base text-[#153422] block mt-0.5">Anti-Bias Segments</span>
            <span className="text-[11px] text-[#55735f]">Entry-level &amp; All-levels</span>
          </div>
        </div>
      </div>

      {/* Discrete Methodology Dropdown (Keeps the main page clean) */}
      <div className="tacti-card rounded-3xl border border-[#e2e8df] overflow-hidden">
        <button
          type="button"
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-[#f6f9f4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#edf5ec] text-[#245e38] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#153422]">
                Technical Methodology &amp; Research Note
              </h3>
              <p className="text-xs text-[#577462]">
                Click to expand the technical details and validation protocol
              </p>
            </div>
          </div>
          {methodologyOpen ? (
            <ChevronUp className="w-5 h-5 text-[#63806d]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#63806d]" />
          )}
        </button>

        {methodologyOpen && (
          <div className="px-6 pb-6 pt-2 border-t border-[#e8efe5] bg-[#f9faf7] space-y-4 text-xs text-[#4c6955] leading-relaxed">
            <div>
              <h4 className="font-bold text-[#163825] mb-1">1. Association Mining Architecture</h4>
              <p>
                SkillGap utilizes vertical TID-lists (transaction ID lists) to find co-occurring itemsets via fast set intersections:
                <code> tid(A ∩ B) = tid(A) ∩ tid(B)</code>. Rules are filtered by Lift &gt; 1.0 to ensure true positive
                co-occurrence rather than random chance.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#163825] mb-1">2. Anti-Bias Seniority Segregation</h4>
              <p>
                To avoid overwhelming students with senior architecture requirements, job postings are partitioned by
                <code>formatted_experience_level</code>. Separate models are maintained for entry-level and overall roles.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#163825] mb-1">3. Offline Validation</h4>
              <p>
                The model was validated using an offline Leave-One-Out (Masked Skill Recovery) benchmark on held-out test postings,
                demonstrating 2x to 4x higher recovery on non-trivial skills compared to naive popularity counting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Acknowledgments */}
      <div className="text-center py-4 text-xs text-[#6e8a78] flex items-center justify-center gap-1.5">
        <span>Built with care for students and career switchers</span>
        <span>•</span>
        <span>© 2026 SkillGap Team</span>
      </div>
    </div>
  );
}
