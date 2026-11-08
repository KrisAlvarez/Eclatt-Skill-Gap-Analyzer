import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HomeTab from './pages/HomeTab';
import ExplorerTab from './pages/ExplorerTab';
import RoadmapsTab from './pages/RoadmapsTab';
import HowToUseTab from './pages/HowToUseTab';
import AboutTab from './pages/AboutTab';
import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [roles, setRoles] = useState([]);
  const [skillsByCategory, setSkillsByCategory] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initError, setInitError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [experienceMode, setExperienceMode] = useState('entry');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [roadmaps, setRoadmaps] = useState({});
  const roadmapSkills = roadmaps[selectedRole] || [];
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const requestId = useRef(0);
  const main = useRef(null);
  const navigate = (tab) => { setActiveTab(tab); };
  useEffect(() => { main.current?.focus(); window.scrollTo(0, 0); }, [activeTab]);
  const invalidateResults = () => {
    requestId.current += 1;
    setAnalysisResults(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
  };
  const runAnalysis = async () => {
    const id = ++requestId.current;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await api.analyze({ role: selectedRole, possessed_skills: selectedSkills, experience_mode: experienceMode, top_k: 6 });
      if (id !== requestId.current) return false;
      setAnalysisResults(res);
      return true;
    } catch (_) {
      if (id === requestId.current) setAnalysisError('We couldn’t load your suggestions.');
      return false;
    } finally {
      if (id === requestId.current) setIsAnalyzing(false);
    }
  };
  const loadInitialData = async () => {
    setLoadingInitial(true);
    setInitError(null);
    try {
      const data = await api.getRoles();
      if (!data.roles?.length) throw new Error('No roles available');
      setRoles(data.roles);
      setSkillsByCategory(data.skills_by_category || {});
    } catch (_) {
      setInitError('We couldn’t load the career options. Check your connection or try again in a moment.');
    } finally { setLoadingInitial(false); }
  };
  useEffect(() => { loadInitialData(); }, []);
  const handleSelectRole = role => { setSelectedRole(role); invalidateResults(); };
  const handleChangeExperienceMode = mode => { setExperienceMode(mode); invalidateResults(); };
  const handleToggleSkill = skill => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    invalidateResults();
  };
  const handleClearSkills = () => { setSelectedSkills([]); invalidateResults(); };
  const handleToggleRoadmapSkill = skill => setRoadmaps(prev => {
    const saved = prev[selectedRole] || [];
    return { ...prev, [selectedRole]: saved.includes(skill) ? saved.filter(s => s !== skill) : [...saved, skill] };
  });
  const needsData = activeTab === 'explorer' || activeTab === 'roadmaps';
  return <div className="min-h-screen bg-[#f5f6f1] text-[#1b2b20] flex flex-col font-sans">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Navbar activeTab={activeTab} setActiveTab={navigate} />
    <main id="main-content" ref={main} tabIndex={-1} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      {needsData && loadingInitial ? <div className="connection-state" role="status"><h1 className="font-editorial">Getting things ready…</h1><p>Loading career options. This may take a moment.</p></div>
      : needsData && initError ? <div className="connection-state"><h1 className="font-editorial">Let’s try that again.</h1><p role="alert">{initError}</p><button className="primary-button" onClick={loadInitialData}>Try again</button></div>
      : activeTab === 'home' ? <HomeTab onStart={() => navigate('explorer')} />
      : activeTab === 'explorer' ? <ExplorerTab roles={roles} skillsByCategory={skillsByCategory} selectedRole={selectedRole} onSelectRole={handleSelectRole} experienceMode={experienceMode} onChangeExperienceMode={handleChangeExperienceMode} selectedSkills={selectedSkills} onToggleSkill={handleToggleSkill} onClearSkills={handleClearSkills} analysisResults={analysisResults} analysisError={analysisError} isAnalyzing={isAnalyzing} onAnalyze={runAnalysis} roadmapSkills={roadmapSkills} onToggleRoadmapSkill={handleToggleRoadmapSkill} onGoToRoadmaps={() => navigate('roadmaps')} />
      : activeTab === 'roadmaps' ? !selectedRole || !roadmapSkills.length ? <div className="connection-state"><p className="eyebrow">Your learning roadmap</p><h1 className="font-editorial">Start with one skill.</h1><p>Explore suggestions and save a skill you’d like to learn. You’ll find your checklist here.</p><button className="primary-button" onClick={() => navigate('explorer')}>Explore skills</button></div> : <RoadmapsTab key={selectedRole} selectedRole={selectedRole} onSelectRole={handleSelectRole} roles={roles} userSkills={selectedSkills} roadmapSkills={roadmapSkills} onToggleRoadmapSkill={handleToggleRoadmapSkill} onGoToExplorer={() => navigate('explorer')} />
      : activeTab === 'how-to-use' ? <HowToUseTab onGoToExplorer={() => navigate('explorer')} />
      : activeTab === 'about' ? <AboutTab /> : null}
    </main>
    <footer className="site-footer"><span>SkillGap · A little clarity for your learning journey.</span><button onClick={() => navigate('about')}>About the project</button></footer>
  </div>;
}
