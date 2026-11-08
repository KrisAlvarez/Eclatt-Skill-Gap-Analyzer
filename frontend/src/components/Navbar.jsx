import React from 'react';
import { Sprout } from 'lucide-react';
export default function Navbar({ activeTab, setActiveTab }) {
  return <header className="site-header"><div className="header-inner">
    <button className="brand font-editorial" onClick={() => setActiveTab('home')} aria-label="SkillGap home"><Sprout size={25} aria-hidden="true" />SkillGap</button>
    <nav aria-label="Main navigation">{[['explorer', 'Explore'], ['roadmaps', 'My roadmap'], ['how-to-use', 'Help']].map(([id, label]) => <button key={id} onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined}>{label}</button>)}</nav>
  </div></header>;
}
