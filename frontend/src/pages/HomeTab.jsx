import React from 'react';
import { ArrowRight, Sprout } from 'lucide-react';
export default function HomeTab({ onStart }) {
  return <div className="welcome-page">
    <div className="welcome-symbol"><Sprout size={32} strokeWidth={1.5} aria-hidden="true" /></div>
    <p className="eyebrow">A little direction for your next step</p>
    <h1 className="font-editorial">Your next skill.<br />A clearer starting point.</h1>
    <p className="welcome-description">Tell us where you want to go and what you already know. Explore skills that appeared together in the historical job postings analyzed by SkillGap.</p>
    <button className="primary-button" onClick={onStart}>Find my next skill <ArrowRight size={18} aria-hidden="true" /></button>
    <p className="welcome-note">Just starting out? You don’t need any skills to begin.</p>
    <ol className="welcome-steps" aria-label="How it works">{['Choose a role', 'Add your skills', 'Explore suggestions'].map((label, i) => <li key={label}><span>{i + 1}</span>{label}</li>)}</ol>
  </div>;
}
