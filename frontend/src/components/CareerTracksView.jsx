import React from 'react';
import { Server, Layout, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

const TRACKS = [
  {
    role_name: 'Backend Developer',
    icon: Server,
    summary: 'Powers web applications through REST APIs, cloud databases, microservices, and server logic.',
    topSkills: ['Python', 'SQL', 'Docker', 'REST APIs', 'Java', 'Git', 'PostgreSQL'],
    commonPairs: [
      { from: 'Python + SQL', to: 'Docker (93% co-occurrence)' },
      { from: 'Java + SQL', to: 'Spring Boot (88% co-occurrence)' },
      { from: 'Node.js', to: 'MongoDB / Express (85% co-occurrence)' },
    ],
    experienceInsight: 'Entry-level postings emphasize writing clean API endpoints and relational queries; senior postings shift to container orchestration and distributed caching.',
  },
  {
    role_name: 'Frontend Developer',
    icon: Layout,
    summary: 'Creates responsive user experiences, single-page web applications, and interactive user interfaces.',
    topSkills: ['JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'Git', 'TailwindCSS'],
    commonPairs: [
      { from: 'JavaScript + HTML/CSS', to: 'React (91% co-occurrence)' },
      { from: 'React', to: 'TypeScript (78% co-occurrence)' },
      { from: 'React + TypeScript', to: 'Next.js / Redux (74% co-occurrence)' },
    ],
    experienceInsight: 'Entry roles focus on responsive layouts and component state; advanced roles demand performance optimization, state management, and build pipelines.',
  },
  {
    role_name: 'Data Analyst',
    icon: BarChart3,
    summary: 'Transforms raw business data into actionable dashboards, KPIs, SQL metrics, and visual reports.',
    topSkills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel', 'Pandas'],
    commonPairs: [
      { from: 'SQL + Excel', to: 'Tableau or Power BI (89% co-occurrence)' },
      { from: 'Python + SQL', to: 'Pandas & Seaborn (84% co-occurrence)' },
      { from: 'SQL + Power BI', to: 'DAX Data Modeling (72% co-occurrence)' },
    ],
    experienceInsight: 'Entry-level roles prioritize clear dashboard design and clean SQL aggregation; higher levels expect statistical modeling and data warehouse architecture.',
  },
];

export default function CareerTracksView({ onSelectTrackAndExplore }) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Editorial Header */}
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#476b53] block mb-1">
          CAREER THEMES &amp; TRACKS
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#142e20] tracking-tight">
          Explore IT Career Tracks
        </h1>
        <p className="text-sm sm:text-base text-[#4f6b58] mt-2 max-w-2xl leading-relaxed">
          Browse our curated technology tracks to see the baseline skills and top co-occurring pairings
          demanded across 123,000+ LinkedIn tech job listings.
        </p>
      </div>

      {/* Track Cards */}
      <div className="space-y-6">
        {TRACKS.map((track) => {
          const Icon = track.icon;
          return (
            <div
              key={track.role_name}
              className="tacti-card p-6 sm:p-8 rounded-3xl border border-[#e2e8df] space-y-6 hover:border-[#b8cfb4] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7ede4]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#edf5ec] text-[#245e38] flex items-center justify-center font-bold">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#153422]">
                      {track.role_name}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#506e5a]">{track.summary}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTrackAndExplore(track.role_name)}
                  className="px-4 py-2 rounded-full bg-[#1b3827] hover:bg-[#12281c] text-white text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <span>Explore this track</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#86efac]" />
                </button>
              </div>

              {/* Core Skills & Common Co-Occurrences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#496a54] block mb-2.5">
                    Core Baseline Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {track.topSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-[#f0f5ed] border border-[#d6e5d3] text-xs font-medium text-[#1e482d]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#52705d] mt-3 leading-relaxed">
                    {track.experienceInsight}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#496a54] block mb-2.5">
                    Top Co-Occurring Skill Bundles
                  </span>
                  <div className="space-y-2">
                    {track.commonPairs.map((pair, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#f5f8f3] border border-[#dce6d8] text-xs flex items-center justify-between text-[#163825]"
                      >
                        <span className="font-medium">{pair.from}</span>
                        <span className="text-[11px] font-semibold text-[#245e38] bg-[#e4ede1] px-2 py-0.5 rounded-md">
                          → {pair.to}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
