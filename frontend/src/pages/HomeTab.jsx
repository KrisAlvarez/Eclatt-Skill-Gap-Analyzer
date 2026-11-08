import React from 'react';
import { ArrowUpRight, ArrowRight, Server, Layout, BarChart3 } from 'lucide-react';

export default function HomeTab({ onSelectRoleAndExplore, onGoToRoadmaps }) {
  const roles = [
    {
      title: 'Backend Developer',
      icon: Server,
      skills: ['Python', 'SQL', 'Docker', 'REST APIs'],
      desc: 'Builds APIs, databases, servers, and cloud infrastructure.',
    },
    {
      title: 'Frontend Developer',
      icon: Layout,
      skills: ['JavaScript', 'React', 'HTML/CSS', 'TypeScript'],
      desc: 'Builds user interfaces, web applications, and mobile-friendly websites.',
    },
    {
      title: 'Data Analyst',
      icon: BarChart3,
      skills: ['SQL', 'Python', 'Tableau', 'Excel'],
      desc: 'Queries databases, cleans datasets, and creates visual dashboards.',
    },
  ];

  return (
    <div className="space-y-12 py-6 max-w-5xl mx-auto">
      {/* Simple, Human Hero */}
      <section className="text-center space-y-4 max-w-2xl mx-auto pt-6">
        <span className="text-[11px] font-semibold tracking-wider text-[#2d6a4f] uppercase px-3 py-1 rounded-full bg-[#e6f1e8] border border-[#cbe1d0] inline-block">
          SkillGap Explorer
        </span>

        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#1b2b20] tracking-tight leading-[1.2]">
          Find out what skills you actually need.
        </h1>

        <p className="text-base text-[#526456] leading-relaxed">
          See which tools appear together in 1.3 million real job postings so you know what companion skills to learn next.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onSelectRoleAndExplore('Backend Developer')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Start exploring</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onGoToRoadmaps}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#d8ded4] hover:bg-[#edf1ea] text-[#1b2b20] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>View roadmaps</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#586c5e]" />
          </button>
        </div>
      </section>

      {/* 3 Simple Roles */}
      <section className="space-y-4">
        <h2 className="font-editorial text-xl font-bold text-[#1b2b20]">
          Pick a role to explore
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="p-5 rounded-2xl bg-white border border-[#e1e6dd] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#f0f4ee] text-[#1b3729] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-[#1b2b20]">
                    {role.title}
                  </h3>
                  <p className="text-xs text-[#526456] leading-relaxed">
                    {role.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
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

                <button
                  type="button"
                  onClick={() => onSelectRoleAndExplore(role.title)}
                  className="w-full py-2 rounded-xl bg-[#f5f7f3] hover:bg-[#1b3729] text-[#1b2b20] hover:text-white border border-[#d6dfd3] hover:border-transparent text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span>Explore {role.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Simple Notes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white border border-[#e1e6dd] space-y-1">
          <span className="font-bold text-xs text-[#1b2b20] block">123K Real Postings</span>
          <p className="text-xs text-[#526456]">Data mined from LinkedIn postings in 2024.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#e1e6dd] space-y-1">
          <span className="font-bold text-xs text-[#1b2b20] block">Entry-Level Filter</span>
          <p className="text-xs text-[#526456]">Filters out senior requirements so advice fits beginners.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#e1e6dd] space-y-1">
          <span className="font-bold text-xs text-[#1b2b20] block">Co-Occurrence</span>
          <p className="text-xs text-[#526456]">Finds skills that naturally go together in production stacks.</p>
        </div>
      </section>
    </div>
  );
}
