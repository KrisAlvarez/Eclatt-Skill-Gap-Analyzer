> Architecture and assessment update (2026-11-13): see [current runtime structure](README.md) and [separate validation/test table](docs/final-evaluation.md). Unmounted legacy UI components were removed. Experimental methods remain offline; the website uses its original cascade. The two-hidden-skill test results do not meet 85% in both Backend groups. Earlier benchmark tables below retain their original protocol.

# UM TAGUM COLLEGE
## BACHELOR OF SCIENCE IN COMPUTER SCIENCE
### Department of Computing Education
Visayan Village, Tagum City, Philippines

## Course Requirements
### in
## CST 9/L
## CS Professional Track 3

### SkillGap: An Exploratory IT Skill-Pattern Tool Using ECLAT

**Submitted to:**<br>
IRIS MAE C. MENDOZA, MIT

**Submitted by:**<br>
Not found in project

**Date of submission:**<br>
Not found in project

# PROJECT DOCUMENTATION FORMAT

**Documentation updated:** November 10, 2026. This update reflects the current repository and recorded validation work. It does not establish that the deployed website uses this exact revision.

## I. Project Overview

- **Project Title:** SkillGap: An Exploratory IT Skill-Pattern Tool Using ECLAT.
- **Type of Application:** Web application.
- **Intended Users:** IT students, aspiring developers, and learners exploring related technical skills.
- **Description:** SkillGap explores technical skills mentioned together in historical job postings. Users select a track, an experience subset, and skills they have studied or used. The application returns associated skills, evidence counts, and explanations of the observed patterns.
- **Objective:** Make role-filtered skill co-occurrence patterns understandable and inspectable through a guided interface, with an offline comparison against skill popularity.

The existing selectors are named Backend Developer, Frontend Developer, and Data Analyst. These labels identify heuristic groups in the dataset, not validated occupational classifications. The groups include mixed and adjacent occupations, including full-stack development, infrastructure, data engineering, and data science. More explicit bucket names have been recommended but are not implemented.

The project does not assess proficiency, calculate verified career readiness, determine a required learning order, or predict hiring success. A skill mention is not proof that an employer requires that skill.

## II. Problem Statement

A list of popular technologies does not show which combinations appear together in the same postings. Learners may benefit from inspecting these combinations and their supporting observations when exploring technical topics. However, posting-derived patterns do not establish what any individual must learn next.

SkillGap addresses the descriptive question: **Which additional skills appeared with this selected combination in the analyzed posting group?** It presents evidence for that association and uses skill frequency when no matching combination is available.

Association mining is appropriate for discovering frequent combinations without predefined outcome labels. ECLAT is an established algorithm [2]; the project's contribution is its implementation, role-filtered application, evidence presentation, and comparison with a popularity baseline. The current evaluation does not show that the recommendation cascade outperforms popularity overall. Learner usefulness remains unmeasured.

## III. Methodology

### 1. Development Tools

| Required field | Current implementation and evidence |
|---|---|
| Programming languages | Python for processing, mining, audits, evaluation, and API; JavaScript/JSX, HTML, and CSS for the frontend. |
| Frameworks and libraries | FastAPI, Pydantic, Uvicorn, pandas, React, Vite, Tailwind CSS, PostCSS, and lucide-react. See [frontend package manifest](frontend/package.json), [Python requirements](requirements.txt), and [server requirements](server/requirements.txt). |
| Dataset download | The builder imports `kagglehub` when retrieving the source. It must be available to run ingestion; it is not listed in the current root/server requirements. |
| Algorithm implementation | The repository implements ECLAT directly in Python; no external predictive model is trained for each request. |
| Storage | JSON files under `data/processed/`. No database engine is used for these records, rules, or metrics. |
| Frontend state | React state stores current selections, results, and saved skills by role. Refreshing the page clears the in-memory roadmap. |
| Deployment configuration | [Render configuration](render.yaml) for the API and [Vercel configuration](vercel.json) for the frontend. Deployment status was not established by this documentation update. |
| IDE | Specific IDE identity is **Not found in project**. The current session includes user-supplied IDE file context. |

The mounted interface is defined in [App.jsx](frontend/src/App.jsx). It contains Home, Explorer, Roadmaps, Help, and About views. The header exposes Explore, My roadmap, and Help; the brand returns to Home, and the footer opens About. Older components with readiness scores and presets remain in the source tree but are not mounted in this application flow. The evaluation dashboard and technical panel also exist as components but are not accessible through the mounted navigation.

The API is defined in [server/app/main.py](server/app/main.py) and its route modules:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Returns API health and application metadata. |
| GET | `/api/v1/roles` | Returns track counts, top skills, and taxonomy categories. |
| POST | `/api/v1/analyze` | Returns recommendations, active rules, evidence, and fallback explanations. |
| GET | `/api/v1/metrics` | Returns six stored benchmark rows, confidence intervals, and rule/fallback coverage. |
| GET | `/docs`, `/redoc` | Provides generated API documentation. |

[Request/response schemas](server/app/schemas/models.py) constrain `top_k` to 1-20. The mounted frontend requests six suggestions, initially showing up to three. Skills are normalized against the taxonomy; unsupported skills and roles are rejected with HTTP 400. Missing rule/metrics artifacts return HTTP 503. An unrecognized experience-mode string falls back to `entry`. There is no authentication or user account system in this API. Cross-origin requests are configured broadly, and the frontend client can try configured, local, and hosted API addresses; local use alone does not establish that every request stays on the local server.

### 2. Machine Learning Component

The system uses unsupervised frequent-itemset mining followed by directional association rules. A posting's canonical skills form a transaction. Rule direction describes a conditional posting frequency and does not imply a causal relationship or educational prerequisite.

The shared [recommendation module](eclat_algorithm/recommendation.py) builds capped artifacts and selects recommendations. Both the offline [runner](eclat_algorithm/runner.py) and [evaluation](eclat_algorithm/evaluation.py) use this module. The [analysis route](server/app/routes/analyze.py) applies the same selection logic to the loaded production artifact:

1. **Exact match:** Find rules whose antecedent equals the selected skill set.
2. **Subset match:** If no exact rule is available, search non-empty subsets up to three skills, choose a largest matching subset, and break subset-selection ties using the highest available joint support.
3. **Popularity fallback:** If no rule is available, use the saved top one-skill frequencies for the selected track and experience subset, excluding selected skills.

Rules retain their serialized order for recommendation ranking. Fallback uses the stored top-20 skill list and can return fewer suggestions than requested. The API normalizes and validates user input before invoking this shared logic.

The cascade combines association rules and popularity. Consequently, the benchmark field named `eclat_hr_at_5` measures this complete cascade, not an isolated association-rule-only method. The displayed evidence includes confidence, lift, and supporting posting counts. A fallback lift of 1.00 is a placeholder, not a measured association.

### 3. Algorithm Used

ECLAT represents each skill with a set of transaction IDs. It counts combinations through set intersections and recursively explores frequent combinations [2]. See [miner.py](eclat_algorithm/miner.py).

For antecedent A and consequent skill B:

- **Support:** fraction of transactions containing both A and B.
- **Confidence:** fraction of transactions containing A that also contain B.
- **Lift:** confidence divided by B's overall frequency in the same dataset group.

A lift above one indicates more co-occurrence than expected under independence. It does not establish employer requirements, causality, skill proficiency, or a learner's probability of success.

Current shared settings are minimum support 0.05, confidence 0.35, lift 1.15, minimum absolute support count 3, and maximum itemset size 4. The miner implements the support-count threshold as `max(3, int(0.05 * N))`, so the fractional count is truncated. Entry and all-level modes currently use the same thresholds. The stored artifact permits at most 25 rules per antecedent, 2,000 rules per mode, and 20 one-skill fallback entries. These values are confirmed in [recommendation.py](eclat_algorithm/recommendation.py).

### 4. Dataset Description

**Source:** The repository identifies asaniczka's *1.3M LinkedIn Jobs & Skills (2024)* dataset [1]. The [raw-data README](data/raw/README.md) reports 1,348,454 source postings and 1,296,381 skill rows. Those are reported source totals; the source CSVs and original build manifest are unavailable locally for independent recounting.

**Retained records:** The following counts were checked against [clean_transactions.json](data/processed/clean_transactions.json), [clean_summary.json](data/processed/clean_summary.json), and [data_audit.json](data/processed/data_audit.json):

| Assigned track | All retained records | Entry-flagged subset |
|---|---:|---:|
| Backend Developer | 28,388 | 1,724 |
| Frontend Developer | 2,520 | 292 |
| Data Analyst | 13,533 | 1,438 |
| **Total** | **44,441** | **3,454** |

The entry column is a subset of the all-level column. These are records assigned by filtering/classification rules, not manually verified distinct source postings. The current records have at least two canonical skills; the evaluator uses only records with at least three.

| Field in current retained records | Meaning and limitation |
|---|---|
| `job_id` | Synthetic identifier assigned during preprocessing, not the original source posting ID. |
| `title` | Retained job title. |
| `skills` | Canonical skill mentions retained after taxonomy matching. |
| `is_entry` | Heuristic Boolean flag; false does not prove a senior role. |

The source join uses `job_link`, but the current retained artifact discarded it and the original `job_level`. Locations, posting dates, descriptions, employer information, and exact source requirements are not retained. The full raw schema/feature count is **Not found in project**. The builder reads only a subset of source fields.

The dataset title identifies 2024. Exact collection dates and geographic coverage of the retained records are not established. The dataset cannot be presented as a verified Philippine, global, or live 2026 job-market sample. US/UK occupational references used during review do not establish the geographic coverage of these records.

### 5. Data Preprocessing

The current [builder](eclat_algorithm/builder.py) retrieves the dataset, filters candidate job titles, joins skills to metadata using the source link, and normalizes skill tokens through a closed taxonomy and alias map. Duplicate skill tokens within a transaction are removed. Records with fewer than two canonical skills are excluded.

Role classification scores the overlap between the skill list and three track-specific marker sets, adds title bonuses, and chooses one winning track or excludes a tie. Generic Software Engineer/Developer titles receive a Backend bonus. Data Engineer and Data Scientist titles are explicitly included in the broad Data bucket. Zero cross-track overlap follows from one-primary-track assignment; it is not validation of occupational labels.

Entry classification uses `job_level` values such as associate, entry level, or internship, or junior title keywords. Senior title keywords override entry signals. The builder does not read descriptions or years of experience. Therefore, the entry flag is an imperfect source-label/title filter, not verified beginner suitability.

A [retained-data audit](data/processed/data_audit.json) records artifact and code hashes, duplicate-ID checks, repeated title/skill content, and the exact reconstruction of all six train/test splits. Run it with:

```powershell
.\.venv\Scripts\python.exe -m eclat_algorithm.scripts.check_duplicates --write-report
```

Existing classification worksheets are preserved by the audit script. Full instructions are in the [data guide](data/README.md).

**Future ingestion support:** The updated builder preserves a SHA-256 identity derived from the exact `job_link` and the original `source_job_level`. It writes `dataset_provenance.json` with the resolved download path, source and pipeline hashes, scan/retention counts, and processing limits. This was tested with a synthetic fixture; the existing dataset was not rebuilt. The current artifact still lacks those source fields. Downloading is not version-pinned, although future manifests record the resolved source. Same-link identity does not detect reposts with different URLs, and duplicate skill rows are not removed automatically.

### 6. Model Training and Testing

The current evaluation fixes production thresholds and uses an **80% training / 20% test split**, shuffled with seed 42. The old validation-grid selection has been removed; `validation_transactions_count` is retained as zero for API compatibility.

```text
retain records with at least three unique canonical skills
shuffle records with seed 42 and split 80/20
build the capped production-style artifact from training records only
for each eligible test posting (up to 10,000 per group):
    hide one randomly selected skill using mask seed 44
    pass the remaining skills through the shared recommendation cascade
    compare Top-3 and Top-5 recovery with a training-popularity baseline
    classify the hidden skill as long-tail if training frequency is below 30%
report rates, sample sizes, Wilson intervals, and rule/fallback counts
```

The popularity comparator ranks all training skills by frequency and excludes the input skills. Its candidate list is not restricted to the cascade's stored top-20 fallback entries. The benchmark therefore compares the actual configured cascade against a frequency baseline rather than matching every candidate restriction.

Long-tail frequency uses **training skill counts divided by the training population**. The former test-population denominator was corrected. Fixed seeds reproduce split/mask choices for the same input order; they should not be described as proof that all mining ties are reproducible across environments.

The evaluated artifact is rebuilt from the training split with the same production settings and serving logic. It is not the full-data `rules.json` file: evaluating that file on its own source postings would not be a held-out experiment. Production mining also uses retained two-skill records, whereas this benchmark's training population includes only records with at least three skills.

**Stored results:** All tables below are generated from the current [evaluation_metrics.json](data/processed/evaluation_metrics.json). "System" denotes the full rule/subset/popularity cascade. Rates are percentages; n denotes a number of postings.

| Track / subset | Train n | Test n | System HR@3 | Prior HR@3 | System HR@5 | Prior HR@5 |
|---|---:|---:|---:|---:|---:|---:|
| Backend Developer / Entry-flagged | 1,099 | 275 | 18.91% | 21.82% | 19.27% | 29.45% |
| Backend Developer / All levels | 19,039 | 4,760 | 24.14% | 22.00% | 26.34% | 28.84% |
| Frontend Developer / Entry-flagged | 199 | 50 | 54.00% | 54.00% | 54.00% | 56.00% |
| Frontend Developer / All levels | 1,864 | 466 | 39.06% | 51.72% | 40.77% | 60.94% |
| Data Analyst / Entry-flagged | 685 | 172 | 37.21% | 66.28% | 38.37% | 77.33% |
| Data Analyst / All levels | 7,356 | 1,839 | 45.57% | 54.38% | 46.60% | 67.70% |

**Overall HR@5 uncertainty:** The API reports separate 95% Wilson intervals for each system's rate:

| Track / subset | System HR@5 95% CI | Prior HR@5 95% CI |
|---|---|---|
| Backend Developer / Entry-flagged | 15.05% to 24.35% | 24.38% to 35.10% |
| Backend Developer / All levels | 25.11% to 27.61% | 27.57% to 30.15% |
| Frontend Developer / Entry-flagged | 40.40% to 67.03% | 42.31% to 68.84% |
| Frontend Developer / All levels | 36.40% to 45.29% | 56.44% to 65.27% |
| Data Analyst / Entry-flagged | 31.43% to 45.82% | 70.51% to 82.95% |
| Data Analyst / All levels | 44.33% to 48.89% | 65.53% to 69.80% |

**Long-tail recovery:** Only hidden skills below 30% training-set frequency contribute to these subgroup rates. Both subgroup counts and intervals are shown:

| Track / subset | Long-tail test n | System HR@5 | Prior HR@5 | System 95% CI | Prior 95% CI |
|---|---:|---:|---:|---|---|
| Backend Developer / Entry-flagged | 239 | 10.88% | 18.83% | 7.53% to 15.46% | 14.38% to 24.26% |
| Backend Developer / All levels | 3,988 | 13.57% | 15.07% | 12.54% to 14.66% | 13.99% to 16.21% |
| Frontend Developer / Entry-flagged | 25 | 12.00% | 12.00% | 4.17% to 29.96% | 4.17% to 29.96% |
| Frontend Developer / All levels | 256 | 17.19% | 28.91% | 13.06% to 22.29% | 23.70% to 34.74% |
| Data Analyst / Entry-flagged | 45 | 11.11% | 17.78% | 4.84% to 23.50% | 9.29% to 31.33% |
| Data Analyst / All levels | 853 | 24.50% | 30.36% | 21.73% to 27.50% | 27.37% to 33.53% |

These intervals describe each observed rate. They are not paired confidence intervals for the difference between the two methods and do not establish statistical superiority.

**Recommendation-source coverage:** Each evaluated input used either association rules (exact or subset) or the popularity fallback:

| Track / subset | Rule-based cases | Popularity-fallback cases |
|---|---:|---:|
| Backend Developer / Entry-flagged | 268 | 7 |
| Backend Developer / All levels | 4,603 | 157 |
| Frontend Developer / Entry-flagged | 44 | 6 |
| Frontend Developer / All levels | 405 | 61 |
| Data Analyst / Entry-flagged | 148 | 24 |
| Data Analyst / All levels | 1,785 | 54 |

The coverage counts sum to the test-set size for every group. They are evaluated-input counts, not counts of individual suggested skills. The current fields combine exact and subset rules; they do not provide a complete tier-by-tier ablation.

**Recorded validation evidence:** Phase 3 recorded 12 passing focused audit/evaluation/miner tests in the repository virtual environment. Phase 2 recorded exact agreement between the live metrics API and all six generated rows, plus exact-rule, subset, and no-skill API parity with the shared recommender. These are recorded checks from implementation work, not tests rerun for this documentation edit. A full frontend build and browser flow review remain in Phase 4. No new build or deployment is claimed here.

## IV. System Output and Screenshots

The mounted frontend provides a guided flow:

1. **Home:** Introduces exploration of skill patterns in historical postings.
2. **Explore:** Choose a track, select studied/used skills or start with none, and optionally choose the entry-flagged or all-level subset.
3. **Results:** Inspect suggestions, open "Why this suggestion?" and technical details, read fallback context, and save selected topics.
4. **My roadmap:** Maintain a personal checklist and view an optional practice idea. Completion marks are self-reported and do not demonstrate mastery.
5. **Help and About:** Explain the dataset, counts, experience filter, and limits of the benchmark.

Evidence: [Home](frontend/src/pages/HomeTab.jsx), [Explorer](frontend/src/pages/ExplorerTab.jsx), [Roadmaps](frontend/src/pages/RoadmapsTab.jsx), [Help](frontend/src/pages/HowToUseTab.jsx), and [About](frontend/src/pages/AboutTab.jsx).

Colored application screenshots for the required views are **Not found in project**. No screenshots were fabricated. The evaluation dashboard and technical components are not mounted in the current app navigation, so their existence is not evidence that a first-time user can reach a benchmark page.

## V. Results and Discussion

### Benchmark interpretation

The popularity baseline has higher overall HR@5 in all six role/subset comparisons. It has higher long-tail HR@5 in five comparisons; Frontend entry-flagged rates tie on 25 cases. These point estimates support no claim that the cascade improves recovery over popularity. Separate rate intervals alone do not test a paired difference.

The association rules still offer inspectable conditional descriptions: they show which combinations were observed and how their frequencies compare. Whether this presentation is useful to learners requires a separate user study. Hidden-skill recovery from a mostly observed posting also differs from a learner supplying zero, one, or a few self-reported skills. The benchmark does not directly evaluate all those input scenarios, educational usefulness, proficiency, or employment outcomes.

### Role scope and entry-filter limitations

The dataset groups represent heuristic assignments derived from titles and canonical skill mentions. Occupational references [3]-[9] distinguish related occupations, while the current implementation groups some of them together. Data Scientist and Data Engineer titles are included in the Data Analyst bucket; full-stack and infrastructure work can also appear under development labels.

The retained records also include an Electrical Engineer, Avionics posting assigned to Backend from Automation/Networking, and a data project manager assigned to Data Analyst. These examples identify scope boundaries that should be reviewed before a future dataset rebuild. They do not establish a population-wide classification error rate.

The entry filter uses available source labels and title signals. Since original responsibilities and seniority metadata are absent from the retained artifact, the entry flag should be interpreted as a dataset filter rather than a confirmed measure of beginner suitability. Missing source information limits how precisely individual postings can be interpreted.

### Duplicate candidates and split independence

The audit finds no repeated synthetic IDs and no ID overlap across tracks. However, matching title-and-skill content occurs across training and test sets:

| Track / subset | Evaluated test records | Matching title and skill content in training |
|---|---:|---:|
| Backend Developer / Entry-flagged | 275 | 34 |
| Backend Developer / All levels | 4,760 | 997 |
| Frontend Developer / Entry-flagged | 50 | 2 |
| Frontend Developer / All levels | 466 | 59 |
| Data Analyst / Entry-flagged | 172 | 20 |
| Data Analyst / All levels | 1,839 | 423 |

Source: [data_audit.json](data/processed/data_audit.json). Matching content identifies duplicate candidates, not confirmed duplicate source postings: different vacancies can share a title and skill list. Missing source identities prevent resolving that question for the legacy artifact. Therefore, disjoint synthetic IDs do not prove independent source-posting, employer, or temporal groups. Existing benchmark values remain provisional with this limitation disclosed.

## VI. Conclusion and Recommendations

SkillGap implements an exploratory web application for historical skill co-occurrence patterns. It combines a custom ECLAT implementation, a shared recommendation cascade, JSON artifacts, a FastAPI API, and a guided React interface. The retained dataset contains 44,441 heuristic role assignments, including 3,454 entry-flagged records. Its precise occupational and seniority validity has not been established.

The corrected production-style benchmark has lower overall HR@5 than popularity in all six groups. The project's defensible output is transparent pattern evidence and a functioning exploration workflow; educational or employment benefits remain unmeasured.

Recommended actions, in priority order:

1. Preserve exploratory language and disclose broad/mixed occupational groups. Consider clearer bucket names only as a separately approved change.
2. Address clear scope failures, recover source identities/duties where feasible, and audit duplicate candidates before a future dataset rebuild. Reevaluate any changed cohort.
3. Evaluate classification scope and learner usefulness separately from masked-skill recovery, using explicit occupational definitions and original posting evidence where available.
4. Complete Phase 4 when approved: production build, six-row API comparison, user-flow wording review, and checklist update. Phase 4 has not started in the recorded implementation sequence.
5. Supply the submission details and required screenshots. These remain missing rather than being inferred or fabricated.

The progress checklist is maintained in [docs/project-plan.md](docs/project-plan.md). That file and this final documentation file are currently ignored by Git; their presence on disk does not mean they are included in a commit.

## VII. REFERENCES (IEEE Style)

[1] asaniczka, "1.3M LinkedIn Jobs & Skills (2024)," Kaggle. [Online]. Available: [dataset page](https://www.kaggle.com/datasets/asaniczka/1-3m-linkedin-jobs-and-skills-2024). Dataset identity and reported totals are documented in [data/raw/README.md](data/raw/README.md); the raw rows were not independently recounted in this review.

[2] M. J. Zaki, "Scalable algorithms for association mining," *IEEE Transactions on Knowledge and Data Engineering*, vol. 12, no. 3, pp. 372-390, May/June 2000, doi: [10.1109/69.846291](https://doi.org/10.1109/69.846291). Bibliographic details checked against the [author's publications](https://cs.rpi.edu/~zaki/publications/).

[3] U.S. Bureau of Labor Statistics, "Web Developers and Digital Designers," *Occupational Outlook Handbook*. [Online]. Available: [occupational profile](https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm). Accessed Nov. 10, 2026.

[4] National Center for O*NET Development, "Business Intelligence Analysts," O*NET-SOC 15-2051.01. [Online]. Available: [occupational profile](https://www.onetonline.org/link/summary/15-2051.01). Accessed Nov. 10, 2026.

[5] National Center for O*NET Development, "Data Scientists," O*NET-SOC 15-2051.00. [Online]. Available: [occupational profile](https://www.onetonline.org/link/summary/15-2051.00). Accessed Nov. 10, 2026.

[6] UK Government, "Data engineer," *Government Digital and Data Profession Capability Framework*. [Online]. Available: [role definition](https://understand-digital-data-roles-skills.service.gov.uk/role/data-engineer/). Accessed Nov. 10, 2026.

[7] U.S. Bureau of Labor Statistics, "Electrical and Electronics Engineers," *Occupational Outlook Handbook*. [Online]. Available: [occupational profile](https://www.bls.gov/ooh/architecture-and-engineering/electrical-and-electronics-engineers.htm). Accessed Nov. 10, 2026.

[8] UK Government, "Development operations (DevOps) engineer," *Government Digital and Data Profession Capability Framework*. [Online]. Available: [role definition](https://understand-digital-data-roles-skills.service.gov.uk/role/development-operations-devops-engineer/). Accessed Nov. 10, 2026.

[9] UK Government, "Software developer," *Government Digital and Data Profession Capability Framework*. [Online]. Available: [role levels](https://understand-digital-data-roles-skills.service.gov.uk/role/software-developer/). Accessed Nov. 10, 2026.

The occupational references support the distinctions between related roles; they do not establish global representativeness or confirm the original duties of individual postings.

**Information still missing:** submitting author names, submission date, full raw source schema/feature count, original source snapshot and metadata for the current artifact, and required application screenshots. Source code, metrics, and audit artifacts provide the evidence for the implementation claims in this document.
