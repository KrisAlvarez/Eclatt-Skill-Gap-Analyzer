# SkillGap — Final System Documentation

**Documentation date:** November 13, 2026
**Project:** SkillGap, an exploratory IT skill-pattern web application using ECLAT.

## 1. Purpose and scope

SkillGap lets learners explore technical skills that appeared together in historical job postings. Its results describe patterns in the analyzed posting groups. They are not verified employer requirements, measures of a learner’s proficiency or readiness, learning prerequisites, or predictions of hiring outcomes.

The application offers Backend Developer, Frontend Developer, and Data Analyst tracks, with entry-flagged and all-level subsets. Track and entry labels are heuristic groupings rather than validated occupational classifications. The entry subset is contained within the all-level subset.

## 2. System architecture

The browser sends requests to a FastAPI service. The service validates inputs and reads the saved posting transactions and production artifacts. On the first request for a role and level in each server process, it builds and caches that group's hybrid rule, frequency, and similarity data; subsequent requests reuse the cache. There is no database or account system.

| Area | Responsibility |
|---|---|
| `frontend/src/App.jsx` and `frontend/src/pages/` | Home, Explorer, Roadmaps, How to Use, About, navigation and session state |
| `frontend/src/api/client.js` | API calls and configured host fallback |
| `server/app/main.py` | FastAPI application and route registration |
| `server/app/routes/` | Health, role/taxonomy, analysis and metrics endpoints |
| `server/app/schemas/models.py` | Request and response contracts |
| `eclat_algorithm/miner.py` | ECLAT transaction-ID set intersections and association rule mining |
| `eclat_algorithm/recommendation.py` | Production artifact creation and recommendation cascade |
| `eclat_algorithm/evaluation.py` | Original single-hidden-skill comparison, retained as historical evaluation |
| `eclat_algorithm/assessment.py` | Frozen two-hidden-skill primary benchmark and scoring logic |
| `eclat_algorithm/hybrid.py` | Live hybrid serving ranker and per-process role/level cache |
| `data/processed/` | Production rule/frequency artifacts and evaluation evidence |

The active interface contains Home, Explorer, Roadmaps, Help, and About views. Roadmap selections are in browser state and are not persisted to an account or database. There is no benchmark dashboard in the active navigation.

## 3. API

All application endpoints use the `/api/v1` prefix except health and generated documentation.

| Method and path | Function |
|---|---|
| `GET /health` | Health and application metadata |
| `GET /api/v1/roles` | Available tracks, posting counts, top skills and taxonomy categories |
| `POST /api/v1/analyze` | Recommendations, popular skills, matched rules and evidence |
| `GET /api/v1/metrics` | Six saved rows from the original single-hidden-skill benchmark |
| `GET /docs`, `GET /redoc` | Generated API documentation |

`POST /api/v1/analyze` accepts a role, `possessed_skills`, `experience_mode` (`entry` or `all`), and `top_k` from 1 through 20. Skills are normalized against the supported taxonomy. Unknown skills and unsupported roles return HTTP 400; missing required artifacts return HTTP 503. An unrecognized experience mode falls back to `entry` in the route implementation. The API has no authentication; CORS and frontend host fallback are configured in the application.

## 4. Production recommendation method

Each posting is represented as a transaction of canonical skills. ECLAT mines frequent skill combinations using transaction-ID set intersections. Association rules summarize directional co-occurrence; they do not imply causation or skill prerequisites.

The production settings are minimum support 5%, confidence 35%, lift 1.15, absolute support floor 3 postings, and maximum itemset size 4. Artifacts cap storage at 2,000 rules per mode and 25 rules per antecedent, with up to 20 popular skills stored for fallback.

The website recommendation cascade:

1. Uses rules matching the full selected skill set when available.
2. Otherwise searches non-empty subsets up to three selected skills and uses the largest matching subset, with joint support used for tie-breaking.
3. Ranks candidates by the frozen hybrid blend: 25% normalized ECLAT evidence, 50% normalized cosine similarity to selected skills, and 25% normalized frequency in the selected track/subset.

The API also returns a separate popularity comparison list. A recommendation with no supporting association rule has lift 1.00 as a placeholder, not as measured association evidence. The `GET /api/v1/metrics` endpoint still serves historical single-hidden-skill metrics; the current primary benchmark reports the two-hidden-skill hybrid results documented below.

## 5. Data

The project identifies its source as asaniczka’s *1.3M LinkedIn Jobs & Skills (2024)* dataset. Repository documentation reports 1,348,454 source postings and 1,296,381 skill rows; raw source files are not available here for an independent recount. Geographic coverage and exact collection dates of the retained records are not established.

The processed artifact contains 44,441 retained records assigned to the project’s three tracks, including 3,454 entry-flagged records:

| Track | All-level records | Entry-flagged records |
|---|---:|---:|
| Backend Developer | 28,388 | 1,724 |
| Frontend Developer | 2,520 | 292 |
| Data Analyst | 13,533 | 1,438 |
| **Total** | **44,441** | **3,454** |

The entry counts are subsets of the all-level counts. These are heuristic retained records, not human-verified unique vacancies. Current processed rows contain a synthetic `job_id`, title, canonical skills, and heuristic `is_entry` flag. Original source identity and job level, locations, dates, descriptions, and employer data are not retained in the processed artifact. The system cannot prove that a skill mention is an employer requirement.

## 6. Primary evaluation benchmark and results

The primary reported benchmark is the frozen two-hidden-skill experiment below. The website now serves the same hybrid scoring method and frozen model settings. The held-out values remain an offline evaluation; serving the evaluated ranking method does not make the test set independent or establish learner benefit.

### Two-hidden-skill primary benchmark

For each eligible posting, exactly two skills are hidden; the remaining skills are provided as input, and the offline hybrid returns up to ten recommendations. The hybrid combines ECLAT rule evidence, cosine similarity between skill posting-occurrence vectors, and popularity. Hit@10 counts a posting as a hit if at least one hidden skill appears in the recommendations. Precision@10 is the number of hidden skills recovered divided by ten; Recall@10 is the number recovered divided by two. The popularity baseline uses training-set skill frequency with the same masked inputs.

The validation figures use grouped validation folds. Test figures use the frozen held-out partition and are reported alongside the saved popularity baseline. The original benchmark has previously been inspected, so this is not fresh independent test data. Test results are not a claim of learner benefit, readiness, hiring success, or production-system performance.

| Role | Level | Validation Hit@10 | Test n | Test Hit@10 | Test Precision@10 | Test Recall@10 | Popularity Test Hit@10 |
|---|---|---:|---:|---:|---:|---:|---:|
| Backend Developer | Entry | 82.71% | 275 | 79.27% | 11.89% | 59.45% | 70.91% |
| Backend Developer | All | 79.85% | 4,760 | 80.55% | 11.69% | 58.46% | 66.20% |
| Frontend Developer | Entry | 95.48% | 50 | 92.00% | 15.60% | 78.00% | 94.00% |
| Frontend Developer | All | 94.37% | 466 | 93.35% | 15.09% | 75.43% | 92.70% |
| Data Analyst | Entry | 96.20% | 172 | 95.35% | 17.15% | 85.76% | 94.19% |
| Data Analyst | All | 96.66% | 1,839 | 96.68% | 16.80% | 84.01% | 92.93% |

Four groups meet or exceed 85% test Hit@10; both Backend groups do not. The 85% target is therefore **not met in every group**. Popularity also exceeds the hybrid Hit@10 in both Backend groups and Frontend entry; the hybrid exceeds it in Frontend all and both Data groups. These are observed point estimates, not proof of general superiority.

### Original single-hidden-skill benchmark (historical comparison)

The original benchmark uses a seeded train/test split and hides one skill from each eligible test posting. Both SkillGap and popularity receive the same remaining skills. HR@k is the proportion of test postings where the hidden skill appears in the first k suggestions. The saved metrics also include a long-tail subset, confidence intervals, and rule/fallback coverage. The popularity baseline ranks skills by training frequency and excludes the inputs.

The current saved results are in `data/processed/evaluation_metrics.json`; percentages below are saved values, not newly computed live results.

| Role | Level | Test n | SkillGap HR@5 | Popularity HR@5 | SkillGap HR@10 | Popularity HR@10 | SkillGap HR@20 | Popularity HR@20 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Backend Developer | Entry | 275 | 19.27% | 29.45% | 20.00% | 41.09% | 20.73% | 65.09% |
| Backend Developer | All | 4,760 | 26.34% | 28.84% | 27.56% | 41.30% | 28.66% | 65.00% |
| Frontend Developer | Entry | 50 | 54.00% | 56.00% | 60.00% | 78.00% | 60.00% | 92.00% |
| Frontend Developer | All | 466 | 40.77% | 60.94% | 42.06% | 73.39% | 44.64% | 87.12% |
| Data Analyst | Entry | 172 | 38.37% | 77.33% | 40.12% | 84.30% | 40.70% | 91.28% |
| Data Analyst | All | 1,839 | 46.60% | 67.70% | 46.76% | 77.54% | 47.09% | 90.05% |

Popularity has higher HR@5 in all six groups and higher HR@10 and HR@20 in all six. These results do not show that the production cascade outperforms popularity on hidden-skill recovery.

Reproduce the primary benchmark's saved reports without overwriting them:

```powershell
.\.venv\Scripts\python.exe eclat_algorithm\scripts\evaluate_multiple_hidden_skills.py --verify
.\.venv\Scripts\python.exe eclat_algorithm\scripts\evaluate_heldout_skills.py --verify
```

The historical single-hidden-skill benchmark is stored separately in `data/processed/evaluation_metrics.json` and exposed by the existing `/api/v1/metrics` endpoint. It is not the primary benchmark presented above. Recomputing it may update saved artifacts.

## 7. Limitations and interpretation

- Role buckets include adjacent occupations and have not been validated as occupational taxonomies.
- Entry flags are heuristic subset labels, not verified evidence of beginner suitability.
- Source identities are incomplete, so duplicate posting overlap cannot be resolved reliably.
- Hidden-skill recovery does not measure the usefulness of recommendations to learners, proficiency, hiring outcomes, or readiness.
- Data coverage is historical; geographic and temporal coverage of retained records is not established.
- The popularity baseline outperforms the production cascade on the historical single-hidden-skill benchmark's reported HR@k results.
- The two-hidden-skill benchmark does not measure the usefulness of the recommendations to learners or establish hiring outcomes.

## 8. Run and validate

From the repository root, with Python 3 and Node.js installed:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn server.app.main:app --reload
```

In another terminal:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open the Vite URL printed by the frontend. The API is normally at `http://127.0.0.1:8000`; generated docs are at `/docs`. Stop each server with Ctrl+C. For project checks:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
cd frontend
npm.cmd run build
```

## 9. Repository evidence and references

Numerical and implementation evidence is maintained in `data/processed/clean_transactions.json`, `data/processed/data_audit.json`, `data/processed/evaluation_metrics.json`, `data/processed/assessment_protocol.json`, `data/processed/multiple_hidden_validation.json`, and `data/processed/multiple_hidden_test.json`. See `docs/final-evaluation.md`, `docs/data/README.md`, `docs/README.md`, and `docs/project-plan.md` for the associated evidence and progress record.

[1] asaniczka, “1.3M LinkedIn Jobs & Skills (2024),” Kaggle. https://www.kaggle.com/datasets/asaniczka/1-3m-linkedin-jobs-and-skills-2024.
[2] M. J. Zaki, “Scalable algorithms for association mining,” *IEEE Transactions on Knowledge and Data Engineering*, vol. 12, no. 3, pp. 372–390, 2000, doi: 10.1109/69.846291.
