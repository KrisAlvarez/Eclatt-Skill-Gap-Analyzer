import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeTab from './pages/HomeTab';
import ExplorerTab from './pages/ExplorerTab';
import RoadmapsTab from './pages/RoadmapsTab';
import HowToUseTab from './pages/HowToUseTab';
import AboutTab from './pages/AboutTab';
import { api } from './api/client';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer'); // 'home' | 'explorer' | 'roadmaps' | 'how-to-use' | 'about'

  // Data states
  const [roles, setRoles] = useState([]);
  const [skillsByCategory, setSkillsByCategory] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initError, setInitError] = useState(null);

  // User input states
  const [selectedRole, setSelectedRole] = useState('Backend Developer');
  const [experienceMode, setExperienceMode] = useState('entry'); // 'entry' | 'all'
  const [selectedSkills, setSelectedSkills] = useState(['Python', 'SQL']);
  const [roadmapSkills, setRoadmapSkills] = useState(['Docker', 'REST APIs', 'Git']);

  // Analysis states
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Run analysis helper
  const runAnalysis = async (role = selectedRole, skills = selectedSkills, expMode = experienceMode) => {
    try {
      setIsAnalyzing(true);
      const res = await api.analyze({
        role,
        possessed_skills: skills,
        experience_mode: expMode,
        top_k: 6,
      });
      setAnalysisResults(res);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      setInitError(null);
      const data = await api.getRoles();
      setRoles(data.roles || []);
      setSkillsByCategory(data.skills_by_category || {});
      const initialRole = data.roles && data.roles.length > 0 ? data.roles[0].role_name : 'Backend Developer';
      setSelectedRole(initialRole);
      // Run initial default analysis
      await runAnalysis(initialRole, ['Python', 'SQL'], 'entry');
    } catch (err) {
      setInitError(err.message || 'Could not connect to SkillGap cloud backend.');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectRole = (newRole) => {
    setSelectedRole(newRole);
    runAnalysis(newRole, selectedSkills, experienceMode);
  };

  const handleChangeExperienceMode = (newMode) => {
    setExperienceMode(newMode);
    runAnalysis(selectedRole, selectedSkills, newMode);
  };

  const handleToggleSkill = (skill) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    runAnalysis(selectedRole, updated, experienceMode);
  };

  const handleClearSkills = () => {
    setSelectedSkills([]);
    runAnalysis(selectedRole, [], experienceMode);
  };

  const handleApplyPreset = (presetSkills) => {
    setSelectedSkills(presetSkills);
    runAnalysis(selectedRole, presetSkills, experienceMode);
  };

  const handleToggleRoadmapSkill = (skill) => {
    setRoadmapSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSelectRoleAndExplore = (roleName) => {
    setSelectedRole(roleName);
    setActiveTab('explorer');
    runAnalysis(roleName, selectedSkills, experienceMode);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#1b2b20] flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {loadingInitial ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-9 h-9 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin"></div>
            <h3 className="font-editorial font-bold text-[#1b2b20] text-xl">
              Loading Skill Connections...
            </h3>
            <p className="text-xs text-[#526456]">
              Connecting to 123K verified LinkedIn job models
            </p>
          </div>
        ) : initError ? (
          <div className="p-8 max-w-lg mx-auto rounded-2xl bg-white border border-rose-200 text-center space-y-4 my-12 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-editorial font-bold text-xl text-[#1b2b20]">
              Connecting to Cloud Engine
            </h3>
            <p className="text-xs text-[#526456] leading-relaxed">
              The Render cloud service may be spinning up from idle. Please wait a moment and click retry.
            </p>
            <button
              onClick={loadInitialData}
              className="px-5 py-2.5 rounded-xl bg-[#1b3729] hover:bg-[#13271d] text-white text-xs font-semibold flex items-center gap-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
            </button>
          </div>
        ) : activeTab === 'home' ? (
          <HomeTab
            onSelectRoleAndExplore={handleSelectRoleAndExplore}
            onGoToRoadmaps={() => setActiveTab('roadmaps')}
          />
        ) : activeTab === 'explorer' ? (
          <ExplorerTab
            roles={roles}
            skillsByCategory={skillsByCategory}
            selectedRole={selectedRole}
            onSelectRole={handleSelectRole}
            experienceMode={experienceMode}
            onChangeExperienceMode={handleChangeExperienceMode}
            selectedSkills={selectedSkills}
            onToggleSkill={handleToggleSkill}
            onClearSkills={handleClearSkills}
            onApplyPreset={handleApplyPreset}
            analysisResults={analysisResults}
            isAnalyzing={isAnalyzing}
            onAnalyze={() => runAnalysis()}
            roadmapSkills={roadmapSkills}
            onToggleRoadmapSkill={handleToggleRoadmapSkill}
            onGoToRoadmaps={() => setActiveTab('roadmaps')}
          />
        ) : activeTab === 'roadmaps' ? (
          <RoadmapsTab
            selectedRole={selectedRole}
            onSelectRole={handleSelectRole}
            roles={roles}
            userSkills={selectedSkills}
            roadmapSkills={roadmapSkills}
            onToggleRoadmapSkill={handleToggleRoadmapSkill}
            onGoToExplorer={() => setActiveTab('explorer')}
          />
        ) : activeTab === 'how-to-use' ? (
          <HowToUseTab onGoToExplorer={() => setActiveTab('explorer')} />
        ) : activeTab === 'about' ? (
          <AboutTab />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e1e6dd] bg-[#edf1ea] py-6 px-4 text-center text-xs text-[#526456]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SkillGap — Career Skill Connection & Pathway Explorer</p>
          <div className="flex items-center gap-4 text-[11px] text-[#445548]">
            <span>1.3M LinkedIn 2024 Postings (asaniczka)</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('about')}
              className="text-[#1b3729] font-semibold hover:underline cursor-pointer"
            >
              About the Project
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
