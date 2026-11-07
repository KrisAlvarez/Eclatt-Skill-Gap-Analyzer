import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoleSelector from './components/RoleSelector';
import SkillSelector from './components/SkillSelector';
import AnalysisResults from './components/AnalysisResults';
import EvaluationDashboard from './components/EvaluationDashboard';
import DefenseModal from './components/DefenseModal';
import { api } from './api/client';
import { Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'evaluation'
  const [defenseModalOpen, setDefenseModalOpen] = useState(false);

  // Data states
  const [roles, setRoles] = useState([]);
  const [skillsByCategory, setSkillsByCategory] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initError, setInitError] = useState(null);

  // User input states
  const [selectedRole, setSelectedRole] = useState('Backend Developer');
  const [experienceMode, setExperienceMode] = useState('entry'); // 'entry' | 'all'
  const [selectedSkills, setSelectedSkills] = useState(['Python', 'SQL']);

  // Analysis states
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadRoles = async () => {
    try {
      setLoadingInitial(true);
      setInitError(null);
      const data = await api.getRoles();
      setRoles(data.roles || []);
      setSkillsByCategory(data.skills_by_category || {});
      if (data.roles && data.roles.length > 0) {
        setSelectedRole(data.roles[0].role_name);
      }
    } catch (err) {
      setInitError(err.message || 'Could not connect to SkillGap backend API');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleToggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleClearSkills = () => {
    setSelectedSkills([]);
  };

  const handleApplyPreset = (presetSkills) => {
    setSelectedSkills(presetSkills);
  };

  const handleRunAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const res = await api.analyze({
        role: selectedRole,
        possessed_skills: selectedSkills,
        experience_mode: experienceMode,
        top_k: 6,
      });
      setAnalysisResults(res);
      // Smooth scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-violet-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDefenseModal={() => setDefenseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loadingInitial ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="font-heading font-semibold text-white text-lg">Initializing SkillGap Engine...</h3>
            <p className="text-xs text-slate-400 font-mono">Loading roles, categories, and precomputed ECLAT rule bases</p>
          </div>
        ) : initError ? (
          <div className="p-8 max-w-xl mx-auto rounded-2xl bg-slate-900 border border-rose-800/40 text-center space-y-4 my-12">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Connection to Backend Failed</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {initError}
            </p>
            <p className="text-xs text-slate-400">
              Ensure the FastAPI backend is running on <code>http://localhost:8000</code> or your live Render service.
            </p>
            <button
              onClick={loadRoles}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
            </button>
          </div>
        ) : activeTab === 'evaluation' ? (
          <EvaluationDashboard />
        ) : (
          <div className="space-y-10">
            {/* Step 1: Target Role Selector */}
            <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
              <RoleSelector
                roles={roles}
                selectedRole={selectedRole}
                onSelectRole={(r) => {
                  setSelectedRole(r);
                  setAnalysisResults(null);
                }}
                experienceMode={experienceMode}
                onChangeExperienceMode={(m) => {
                  setExperienceMode(m);
                  setAnalysisResults(null);
                }}
              />
            </section>

            {/* Step 2: Skill Selector */}
            <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
              <SkillSelector
                skillsByCategory={skillsByCategory}
                selectedSkills={selectedSkills}
                onToggleSkill={handleToggleSkill}
                onClearSkills={handleClearSkills}
                onApplyPreset={handleApplyPreset}
                selectedRole={selectedRole}
                onAnalyze={handleRunAnalysis}
                isAnalyzing={isAnalyzing}
              />
            </section>

            {/* Step 3: Analysis Results */}
            {analysisResults && (
              <section id="results-view" className="animate-fade-in">
                <AnalysisResults
                  results={analysisResults}
                  onReset={() => {
                    setAnalysisResults(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SkillGap Team — Machine Learning Association Rule Mining Project</p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Algorithm: ECLAT (Vertical TID-Lists)</span>
            <span>•</span>
            <span>Dataset: LinkedIn 2024 (123K Postings)</span>
          </div>
        </div>
      </footer>

      {/* Defense Guide Modal */}
      <DefenseModal
        isOpen={defenseModalOpen}
        onClose={() => setDefenseModalOpen(false)}
      />
    </div>
  );
}
