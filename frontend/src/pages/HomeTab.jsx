import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Server,
  Layout,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export default function HomeTab({ onSelectRoleAndExplore, onGoToRoadmaps }) {
  const roles = [
    {
      title: 'Backend Developer',
      icon: Server,
      skills: ['Python', 'SQL', 'REST APIs', 'Docker', 'Java'],
      description:
        'Architect APIs, databases, servers, and cloud microservices powering web applications.',
    },
    {
      title: 'Frontend Developer',
      icon: Layout,
      skills: ['JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'Git'],
      description:
        'Design interactive user interfaces, single-page web applications, and responsive UX.',
    },
    {
      title: 'Data Analyst',
      icon: BarChart3,
      skills: ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel'],
      description:
        'Extract insights from corporate datasets, build executive dashboards, and drive decisions.',
    },
  ];

  return (
    <div className="space-y-16 py-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-5 max-w-3xl mx-auto pt-4">
        <span className="text-[11px] font-semibold tracking-wider text-[#2d6a4f] uppercase px-3 py-1 rounded-full bg-[#e6f1e8] border border-[#cbe1d0] inline-block">
          The Career Skill Explorer
        </span>

        <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1b2b20] tracking-tight leading-[1.15]">
          Discover the skill connections tech recruiters look for.
        </h1>

        <p className="text-base sm:text-lg text-[#445548] leading-relaxed max-w-2xl mx-auto">
          Choose a career track, learn what tools appear together in 123,849 real
          job postings, and build your personalized roadmap to become job-ready.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => onSelectRoleAndExplore('Backend Developer')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span>Launch Skill Explorer</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onGoToRoadmaps}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#d8ded4] hover:bg-[#edf1ea] text-[#1b2b20] text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span>View Career Roadmaps</span>
            <ArrowRight className="w-4 h-4 text-[#586c5e]" />
          </button>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#eef5ed] text-[#2d6a4f] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
            123K Real Job Postings
          </h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            Data sourced from verified 2024 tech job requirements across major
            industry hubs.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#eef5ed] text-[#2d6a4f] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
            Anti-Bias Seniority Filter
          </h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            Filters out senior architecture bloat so junior and entry-level
            candidates get realistic advice.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#eef5ed] text-[#2d6a4f] flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
            Companion Pattern Co-Occurrence
          </h3>
          <p className="text-xs text-[#526456] leading-relaxed">
            Recommends tools that naturally belong together (like Python with SQL
            and Docker).
          </p>
        </div>
      </section>

      {/* Career Specializations Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-wider block">
              Specializations
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1b2b20]">
              Choose a career path to analyze
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="p-6 rounded-2xl bg-white border border-[#e1e6dd] shadow-xs hover:border-[#b9ccb7] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f4ee] text-[#1b3729] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-[#1b2b20]">
                    {role.title}
                  </h3>
                  <p className="text-xs text-[#526456] leading-relaxed">
                    {role.description}
                  </p>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-[#1b2b20] block mb-1.5">
                      Frequent Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-[#edf2eb] text-[#213829] text-[11px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectRoleAndExplore(role.title)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-[#f5f7f3] hover:bg-[#1b3729] text-[#1b2b20] hover:text-white border border-[#d6dfd3] hover:border-transparent text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Explore {role.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
