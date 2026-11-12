# SkillGap — Final System Documentation

**Documentation date:** November 13, 2026
**Project:** SkillGap, an exploratory IT skill-pattern web application using ECLAT.

## 1. Purpose and scope

SkillGap lets learners explore technical skills that appeared together in historical job postings. Its results describe patterns in the analyzed posting groups. They are not verified employer requirements, measures of a learner’s proficiency or readiness, learning prerequisites, or predictions of hiring outcomes.

The application offers Backend Developer, Frontend Developer, and Data Analyst tracks, with entry-flagged and all-level subsets. Track and entry labels are heuristic groupings rather than validated occupational classifications. The entry subset is contained within the all-level subset.

## 2. System architecture

The browser sends requests to a FastAPI service. The service validates inputs and reads precomputed JSON artifacts; it does not mine rules or train a model for each request. There is no database or account system. The experimental hybrid model is offline and is not used by the website.

| Area | Responsibility |
|---|---|
| `frontend/src/App.jsx` and `frontend/src/pages/` | Home, Explorer, Roadmaps, How to Use, About, navigation and session state |
| `frontend/src/api/client.js` | API calls and configured host fallback |
| `server/app/main.py` | FastAPI application and route registration |
| `server/app/routes/` | Health, role/taxonomy, analysis and metrics endpoints |
| `server/app/schemas/models.py` | Request and response contracts |
| `eclat_algorithm/miner.py` | ECLAT transaction-ID set intersections and association rule mining |
| `eclat_algorithm/recommendation.py` | Production artifact creation and recommendation cascade |
| `eclat_algorithm/evaluation.py` | Original single-hidden-skill benchmark |
| `eclat_algorithm/assessment.py` | Separate frozen two-hidden-skill experiment |
| `data/processed/` | Production rule/frequency artifacts and evaluation evidence |

The active interface contains Home, Explorer, Roadmaps, Help, and About views. Roadmap selections are in browser state and are not persisted to an account or database. There is no benchmark dashboard in the active navigation.

## 3. API

All application endpoints use the `/api/v1` prefix except health and generated documentation.

| Method and path | Function |
|---|---|
| `GET /health` | Health and application metadata |
| `GET /api/v1/roles` | Available tracks, posting counts, top skills and taxonomy categories |
| `POST /api/v1/analyze` | Recommendations, popular skills, matched rules and evidence |
| `GET /api/v1/metrics` | Six saved original benchmark rows |
| `GET /docs`, `GET /redoc` | Generated API documentation |

`POST /api/v1/analyze` accepts a role, `possessed_skills`, `experience_mode` (`entry` or `all`), and `top_k` from 1 through 20. Skills are normalized against the supported taxonomy. Unknown skills and unsupported roles return HTTP 400; missing required artifacts return HTTP 503. An unrecognized experience mode falls back to `entry` in the route implementation. The API has no authentication; CORS and frontend host fallback are configured in the application.

## 4. Production recommendation method

Each posting is represented as a transaction of canonical skills. ECLAT mines frequent skill combinations using transaction-ID set intersections. Association rules summarize directional co-occurrence; they do not imply causation or skill prerequisites.

The production settings are minimum support 5%, confidence 35%, lift 1.15, absolute support floor 3 postings, and maximum itemset size 4. Artifacts cap storage at 2,000 rules per mode and 25 rules per antecedent, with up to 20 popular skills stored for fallback.

The website recommendation cascade:

1. Uses rules matching the full selected skill set when available.
2. Otherwise searches non-empty subsets up to three selected skills and uses the largest matching subset, with joint support used for tie-breaking.
3. If no rule matches, recommends frequent skills from the selected track/subset, excluding selected skills.

The API also returns a popular-skills list. The benchmark field named `eclat_hr_at_k` measures the production cascade as a whole, not an isolated ECLAT-only ranker. A fallback lift of 1.00 is a placeholder rather than measured rule evidence.

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

## 6. Evaluation methods and results

### Original single-hidden-skill benchmark

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

### Separate two-hidden-skill experiment

The separate frozen experiment hides exactly two skills and returns ten recommendations. Hit@10 counts whether at least one hidden skill is recovered; precision divides recovered hidden skills by ten, and recall divides by two. It evaluates an offline hybrid of ECLAT evidence, skill cosine similarity, and popularity. It is not the production system or a replacement of the original benchmark.

| Role | Level | Validation Hit@10 | Test n | Test Hit@10 | Test Precision@10 | Test Recall@10 | Popularity Test Hit@10 |
|---|---|---:|---:|---:|---:|---:|---:|
| Backend Developer | Entry | 82.71% | 275 | 79.27% | 11.89% | 59.45% | 70.91% |
| Backend Developer | All | 79.85% | 4,760 | 80.55% | 11.69% | 58.46% | 66.20% |
| Frontend Developer | Entry | 95.48% | 50 | 92.00% | 15.60% | 78.00% | 94.00% |
| Frontend Developer | All | 94.37% | 466 | 93.35% | 15.09% | 75.43% | 92.70% |
| Data Analyst | Entry | 96.20% | 172 | 95.35% | 17.15% | 85.76% | 94.19% |
| Data Analyst | All | 96.66% | 1,839 | 96.68% | 16.80% | 84.01% | 92.93% |

Four groups have test Hit@10 at or above 85%; both Backend groups are below 85%. This does not satisfy a requirement of 85% in every group. The test partition is not fresh independent data: the original benchmark was inspected earlier, and duplicate title/skill content across the random split is documented. The single-hidden and two-hidden experiments are different tasks and must not be conflated.

Reproduce saved two-hidden-skill reports without overwriting them:

```powershell
.\.venv\Scripts\python.exe eclat_algorithm\scripts\evaluate_multiple_hidden_skills.py --verify
.\.venv\Scripts\python.exe eclat_algorithm\scripts\evaluate_heldout_skills.py --verify
```

The original benchmark’s saved table can be printed by running `eclat_algorithm/scripts/run_evaluation.py`; this script displays existing saved values. Recomputing from source requires running the evaluator and may update saved artifacts.

## 7. Limitations and interpretation

- Role buckets include adjacent occupations and have not been validated as occupational taxonomies.
- Entry flags are heuristic subset labels, not verified evidence of beginner suitability.
- Source identities are incomplete, so duplicate posting overlap cannot be resolved reliably.
- Hidden-skill recovery does not measure the usefulness of recommendations to learners, proficiency, hiring outcomes, or readiness.
- Data coverage is historical; geographic and temporal coverage of retained records is not established.
- The popularity baseline outperforms the production cascade on the original benchmark’s reported HR@k results.
- The alternate two-hidden-skill experiment is offline; its metrics do not describe website behavior.

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
