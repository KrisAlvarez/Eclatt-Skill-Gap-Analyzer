import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Search, Server, Layout, BarChart3 } from 'lucide-react';
import { getSkillPurpose } from '../utils/skillDescriptions';

const ROLE_INFO = {
  'Backend Developer': { icon: Server, description: 'Build the servers and databases behind an app.' },
  'Frontend Developer': { icon: Layout, description: 'Create the interfaces people see and interact with.' },
  'Data Analyst': { icon: BarChart3, description: 'Turn data into insights that help people make decisions.' },
};
function FriendlyEvidence({ rec, results }) {
  const rule = results?.active_rules?.find(item => item.consequent.includes(rec.skill));
  const paired = rule?.antecedent?.join(' and ');
  const percent = Math.round(rec.confidence * 100);
  const change = Math.round(Math.abs(rec.lift - 1) * 100);
  const foundational = rec.tier?.startsWith('Tier 3');
  return <details className="evidence"><summary>Why this suggestion?</summary>
    {foundational ? <p>{rec.skill} appears in about {percent}% of postings for this role and experience level. This suggestion is based on its overall popularity.</p> : <>
      {paired && <p><strong>{rec.skill} is {change === 0 ? 'about as common' : `${change}% ${rec.lift > 1 ? 'more' : 'less'} common`} in postings mentioning {paired}</strong>, compared with all postings in this role and experience group.</p>}
      {paired && <p>About {percent} out of every 100 postings mentioning {paired} also mention {rec.skill}.</p>}
      {results?.sub_lattice_fallback_used && <p>This pattern matches some of your selected skills, rather than the full combination.</p>}
    </>}
    <p>Based on {rec.evidence_jobs_count.toLocaleString()} supporting job postings{rec.evidence_jobs_count < 10 ? ' — a small sample, so use this as a starting point to explore' : ''}.</p>
    <p>These patterns don’t predict your chances of getting hired.</p>
    <details><summary>Technical details</summary><p>Confidence: {percent}% · Lift: {rec.lift.toFixed(2)}</p><p>{foundational ? 'Lift is set to 1.00 for this popularity-based suggestion; it is not a measured association.' : 'Lift compares how often this skill appears with the matched skills against how often it appears overall. Above 1 means more common; 1 means no difference.'}</p></details>
  </details>;
}
export default function ExplorerTab({ roles, skillsByCategory, selectedRole, onSelectRole,
  experienceMode, onChangeExperienceMode, selectedSkills, onToggleSkill, onClearSkills,
  analysisResults, analysisError, isAnalyzing, onAnalyze, roadmapSkills, onToggleRoadmapSkill, onGoToRoadmaps }) {
  const [step, setStep] = useState(analysisResults ? 3 : 1);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const heading = useRef(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus();
  }, [step]);
  const skills = [...new Set(Object.values(skillsByCategory).flat())];
  const matches = skills.filter(s => s.toLowerCase().includes(search.trim().toLowerCase()));
  const recommendations = analysisResults?.recommendations || [];
  const popularSkills = analysisResults?.popular_skills || [];
  const usedPopularityFallback = recommendations.some(rec => rec.tier?.startsWith('Tier 3'));
  const resultNote = usedPopularityFallback
    ? analysisResults.user_skills.length
      ? `We couldn't find a close pattern for the skills you selected in this dataset. These suggestions are skills often mentioned in ${analysisResults.role} postings. Try fewer selected skills to explore different combinations.`
      : `You haven't added any skills yet, so these suggestions show skills often mentioned in ${analysisResults.role} postings in this dataset. Treat them as ideas to explore, not a required checklist.`
    : analysisResults?.note;
  const analyze = async () => {
    if (await onAnalyze()) { setShowAll(false); setStep(3); }
  };
  const renderRecommendation = rec => {
    const saved = roadmapSkills.includes(rec.skill);
    return <article className="recommendation" key={rec.skill}>
      <div className="recommendation-top"><div><p className="eyebrow">{rec.category}</p><h2 className="font-editorial">{rec.skill}</h2></div><button className={`save-button ${saved ? 'saved' : ''}`} aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Save'} ${rec.skill} ${saved ? 'from' : 'to'} roadmap`} onClick={() => onToggleRoadmapSkill(rec.skill)}>{saved ? <Check size={16} /> : <Plus size={16} />}{saved ? 'Saved' : 'Save skill'}</button></div>
      <p className="skill-description">{getSkillPurpose(rec.skill)}</p>
      <FriendlyEvidence rec={rec} results={analysisResults} />
    </article>;
  };
  return <div className="guided-flow">
    <ol className="flow-steps" aria-label="Your progress">{['Your direction', 'Your skills', 'Next steps'].map((label, i) => <li key={label} aria-current={step === i + 1 ? 'step' : undefined} className={step > i + 1 ? 'complete' : ''}><span>{step > i + 1 ? <Check size={14} aria-hidden="true" /> : i + 1}</span>{label}</li>)}</ol>
    <div className="flow-heading">
      <p className="eyebrow">Step {step} of 3</p>
      <h1 ref={heading} tabIndex={-1} className="font-editorial">{step === 1 ? 'Where would you like to go?' : step === 2 ? 'What do you already know?' : 'A few skills to explore next.'}</h1>
      <p>{step === 1 ? 'Choose a direction that interests you. You can change it later.' : step === 2 ? 'Select skills you’ve studied or used. Starting fresh? It’s okay to skip this.' : `Suggestions for your path toward ${selectedRole}.`}</p>
    </div>
    {step === 1 && <section className="flow-panel" aria-label="Choose your direction">
      <fieldset className="role-options"><legend className="sr-only">Career role</legend>{roles.map(({ role_name }) => {
        const info = ROLE_INFO[role_name] || { icon: Server, description: 'Explore skills for this career.' };
        const Icon = info.icon;
        return <label className={`role-option ${selectedRole === role_name ? 'selected' : ''}`} key={role_name}>
          <input type="radio" name="career-role" value={role_name} checked={selectedRole === role_name} onChange={() => onSelectRole(role_name)} />
          <Icon size={23} strokeWidth={1.5} aria-hidden="true" /><span><strong>{role_name}</strong><small>{info.description}</small></span>
        </label>;
      })}</fieldset>
      <div className="flow-actions"><span>You don’t need to have it all figured out.</span><button className="primary-button" disabled={!selectedRole} onClick={() => setStep(2)}>Continue <ArrowRight size={17} aria-hidden="true" /></button></div>
    </section>}
    {step === 2 && <section className="flow-panel" aria-label="Choose your skills" aria-busy={isAnalyzing}>
      <fieldset disabled={isAnalyzing} className="skill-fieldset"><legend className="sr-only">Skills and experience</legend>
        <label htmlFor="skill-search" className="field-label">Search for a skill</label>
        <div className="skill-search"><Search size={18} aria-hidden="true" /><input id="skill-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Try Python, SQL or React" /></div>
        <div className="selection-summary"><span aria-live="polite">{selectedSkills.length} selected</span>{selectedSkills.length > 0 && <button className="text-button" onClick={onClearSkills}>Clear all</button>}</div>
        {selectedSkills.length > 0 && <div className="selected-skills" aria-label="Selected skills">{selectedSkills.map(skill => <button key={skill} className="skill-chip selected" aria-label={`Remove ${skill}`} onClick={() => onToggleSkill(skill)}>{skill}<Check size={14} aria-hidden="true" /></button>)}</div>}
        <div className="skill-categories">
          {search.trim() ? <div className="skill-list">{matches.length ? matches.map(skill => <button key={skill} className={`skill-chip ${selectedSkills.includes(skill) ? 'selected' : ''}`} aria-pressed={selectedSkills.includes(skill)} onClick={() => onToggleSkill(skill)}>{skill}</button>) : <p className="muted">No matching skills. Try another name or browse the categories below.</p>}</div> : <p className="muted mb-3">Or browse by category</p>}
          {Object.entries(skillsByCategory).map(([category, items]) => <details key={category} hidden={Boolean(search.trim() && matches.length)}><summary>{category}<span>{items.filter(s => selectedSkills.includes(s)).length || items.length}</span></summary><div className="skill-list">{items.map(skill => <button key={skill} className={`skill-chip ${selectedSkills.includes(skill) ? 'selected' : ''}`} aria-pressed={selectedSkills.includes(skill)} onClick={() => onToggleSkill(skill)}>{skill}{selectedSkills.includes(skill) && <Check size={14} aria-hidden="true" />}</button>)}</div></details>)}
        </div>
        <details className="experience-options"><summary>Job experience: {experienceMode === 'entry' ? 'Entry level' : 'All levels'}</summary><p className="muted">Choose the job postings used for your suggestions.</p><label htmlFor="experience-mode" className="sr-only">Job experience</label><select id="experience-mode" value={experienceMode} onChange={e => onChangeExperienceMode(e.target.value)}><option value="entry">Entry level — a good place to start</option><option value="all">All experience levels</option></select></details>
      </fieldset>
      {analysisError && <p role="alert" className="flow-error">{analysisError} Please try again.</p>}
      <div className="flow-actions"><button className="text-button" disabled={isAnalyzing} onClick={() => setStep(1)}><ArrowLeft size={16} aria-hidden="true" /> Back</button><button className="primary-button" disabled={isAnalyzing} onClick={analyze}>{isAnalyzing ? 'Finding suggestions…' : selectedSkills.length ? 'Show my suggestions' : 'Find beginner skills'}<ArrowRight size={17} aria-hidden="true" /></button></div>
      <p className="quiet-note" role="status">{isAnalyzing ? 'This may take a moment. Your selections are safe here.' : 'Your suggestions appear when you’re ready.'}</p>
    </section>}
    {step === 3 && <section aria-label="Your suggestions" className="results-section">
      <div className="results-context"><p>{selectedSkills.length ? `Based on ${selectedSkills.length} selected skill${selectedSkills.length === 1 ? '' : 's'}` : 'A starting point for beginners'} · {experienceMode === 'entry' ? 'Entry-level jobs' : 'All experience levels'}</p><button className="text-button" onClick={() => setStep(2)}>Edit my choices</button></div>
      <p className="muted">These suggestions summarize patterns in the selected postings. Choose any that interest you; they are not a checklist of requirements or a measure of job readiness.</p>
      {recommendations.length === 0 && <div className="flow-panel"><h2 className="font-editorial text-2xl">No suggestions for these choices yet.</h2><p className="muted mt-3">Try a different role or fewer skills to explore other patterns.</p><button className="text-button mt-4" onClick={() => setStep(1)}>Change my choices <ArrowRight size={16} /></button></div>}
      {(showAll ? recommendations : recommendations.slice(0, 3)).map(renderRecommendation)}
      {recommendations.length > 3 && <button className="text-button more-suggestions" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show fewer suggestions' : `See ${recommendations.length - 3} more suggestions`}</button>}
      {resultNote && <details className="muted result-note"><summary>About these results</summary><p>{resultNote}</p></details>}
      {popularSkills.length > 0 && <section aria-labelledby="popular-skills-heading" className="mt-8">
        <h2 id="popular-skills-heading" className="font-editorial text-2xl">More skills often mentioned in these postings</h2>
        <p className="muted">Popular skills in {analysisResults.role} postings ({analysisResults.experience_mode === 'entry' ? 'entry level' : 'all experience levels'}). These are based on how often they appear, rather than a match to your selected skills. Skills you selected or already see above are excluded.</p>
        {popularSkills.map(renderRecommendation)}
      </section>}
      <div className="flow-actions"><span role="status">{roadmapSkills.length ? `${roadmapSkills.length} skill${roadmapSkills.length === 1 ? '' : 's'} in your roadmap` : 'Save a skill to start your learning roadmap.'}</span>{roadmapSkills.length > 0 && <button className="primary-button" onClick={onGoToRoadmaps}>View my roadmap <ArrowRight size={17} /></button>}</div>
    </section>}
  </div>;
}
