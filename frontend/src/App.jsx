import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExplorerView from './components/ExplorerView';
import HomeView from './components/HomeView';
import CareerTracksView from './components/CareerTracksView';
import HowToUseView from './components/HowToUseView';
import AboutView from './components/AboutView';
import { api } from './api/client';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function App() {
  // Tabs: 'home' | 'explorer' | 'tracks' | 'how-to-use' | 'about'
  // Default to 'explorer' to immediately show the TactiChess-style explorer
  const [activeTab, setActiveTab] = useState('explorer');

  // Backend Data states
  const [roles, setRoles] = useState([]);
  const [skillsByCategory, setSkillsByCategory] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initError, setInitError] = useState(null);

  // User input states
  const [selectedRole, setSelectedRole] = useState('Backend Developer');
  const [experienceMode, setExperienceMode] = useState('entry'); // 'entry' | 'all'
  const [selectedSkills, setSelectedSkills] = useState(['Python', 'SQL']);
  const [roadmapSkills, setRoadmapSkills] = useState(['Docker']);

  // Analysis state
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initial load of roles & skill taxonomy from backend
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

  // Run analysis whenever role, skills, or experience mode changes
  const runAnalysis = async (role = selectedRole, skills = selectedSkills, mode = experienceMode) => {
    try {
      setIsAnalyzing(true);
      const res = await api.analyze({
        role: role,
        possessed_skills: skills,
        experience_mode: mode,
        top_k: 8,
      });
      setAnalysisResults(res);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run first analysis once roles are loaded
  useEffect(() => {
    if (roles.length > 0) {
      runAnalysis(selectedRole, selectedSkills, experienceMode);
    }
  }, [roles]);

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

  const handleSelectTrackAndExplore = (trackName) => {
    setSelectedRole(trackName);
    runAnalysis(trackName, selectedSkills, experienceMode);
    setActiveTab('explorer');
  };

  return (
    <div className="min-h-screen bg-[#f8faf6] text-[#193224] flex flex-col selection:bg-[#d6e7d4] selection:text-[#142e20]">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {loadingInitial ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-8 h-8 border-3 border-[#245e38] border-t-transparent rounded-full animate-spin"></div>
            <h3 className="font-serif text-lg font-bold text-[#153422]">
              Loading Skill Connections...
            </h3>
            <p className="text-xs text-[#52705d]">Connecting to live LinkedIn 2024 database</p>
          </div>
        ) : initError ? (
          <div className="p-8 max-w-lg mx-auto rounded-3xl tacti-card border border-rose-200 text-center space-y-4 my-12 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#163825]">Connection Notice</h3>
            <p className="text-xs text-[#4b6654] leading-relaxed">
              {initError}
            </p>
            <p className="text-xs text-[#738e7d]">
              The cloud analytics engine may be warming up. Please retry in a moment.
            </p>
            <button
              onClick={loadRoles}
              className="px-4 py-2 rounded-xl bg-[#1b3827] text-white text-xs font-semibold flex items-center gap-2 mx-auto cursor-pointer hover:bg-[#12281c] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        ) : activeTab === 'home' ? (
          <HomeView onGoToExplorer={() => setActiveTab('explorer')} />
        ) : activeTab === 'tracks' ? (
          <CareerTracksView onSelectTrackAndExplore={handleSelectTrackAndExplore} />
        ) : activeTab === 'how-to-use' ? (
          <HowToUseView onGoToExplorer={() => setActiveTab('explorer')} />
        ) : activeTab === 'about' ? (
          <AboutView />
        ) : (
          <ExplorerView
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
            onRunAnalysis={() => runAnalysis(selectedRole, selectedSkills, experienceMode)}
            roadmapSkills={roadmapSkills}
            onToggleRoadmapSkill={handleToggleRoadmapSkill}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5ebe2] bg-[#f8faf6] px-4 py-6 text-center text-xs text-[#627e6d]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-serif font-semibold text-sm text-[#1b3a27]">
            <span>SkillGap</span>
            <span className="text-[10px] text-[#55735f] font-sans font-normal">
              • Real LinkedIn 2024 Tech Skill Explorer
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#63806e]">
            <button
              onClick={() => setActiveTab('how-to-use')}
              className="hover:text-[#183925] cursor-pointer"
            >
              How to use
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-[#183925] cursor-pointer"
            >
              About &amp; Methodology
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
