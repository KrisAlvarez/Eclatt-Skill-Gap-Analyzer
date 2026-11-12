# SkillGap: Exploratory IT Skill Patterns

SkillGap shows skills mentioned together in historical job postings. Patterns are ideas to explore, not verified employer requirements, skill mastery, or hiring predictions.

## Run locally

Python with the packages in `requirements.txt` and Node/npm are required. From the repository root in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn server.app.main:app --reload
```

In another terminal:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173). API: http://127.0.0.1:8000; API documentation: http://127.0.0.1:8000/docs. Stop each process with Ctrl+C. If PowerShell blocks npm.ps1, use npm.cmd. If roles fail to load, check `/health` and the backend terminal. `frontend/src/api/client.js` can fall back to the hosted API; set `VITE_API_BASE_URL` to your local address for local development and keep the local API running.

## Current architecture

| Location | Responsibility |
|---|---|
| `frontend/src/App.jsx` | Tab navigation and shared selection/roadmap state |
| `frontend/src/pages/` | Home, Explorer, Roadmaps, How to Use, About |
| `frontend/src/components/Navbar.jsx` | Shared navigation |
| `frontend/src/api/client.js` | API requests and host failover |
| `frontend/src/utils/skillDescriptions.js` | Beginner-facing skill descriptions |
| `server/app/main.py` | FastAPI entry point; controllers in routes, contracts in schemas |
| `eclat_algorithm/miner.py` | ECLAT TID-list intersections and association rules |
| `eclat_algorithm/recommendation.py` | Artifact construction and serving cascade |
| `eclat_algorithm/builder.py`, `taxonomy.py` | Source filtering and canonical skill mapping |
| `eclat_algorithm/runner.py` | Offline production-rule generation |
| `eclat_algorithm/evaluation.py` | Original single-hidden-skill benchmark |
| `eclat_algorithm/assessment.py` | Frozen offline two-hidden-skill model and assessment |
| `eclat_algorithm/scripts/` | Explicit data, audit and reproducible experiment commands |
| `data/processed/` | Production JSON artifacts and separately named evaluation evidence |
| `data/processed/experiment_summary.json` | Historical model/cutoff and explicitly synthetic results |
| `tests/` | Algorithm, API, split, masking and metric contracts |
| `backend/` | Documented compatibility imports/CLI wrappers; canonical code is elsewhere |

The active flow is browser -> FastAPI controller -> recommendation cascade -> precomputed JSON. There is no database or online model training. Current serving uses exact rules, one matching subset, or popularity fallback. The experimental hybrid is not deployed. Roadmaps are session state in the browser.

## Evaluation and defense evidence

[Validation and held-out test table](docs/final-evaluation.md) reports the frozen experimental two-hidden-skill HR@10 assessment. Both Backend test groups remain below 85%. This differs from the [original single-hidden-skill benchmark](data/processed/evaluation_metrics.json). The held-out partition is not new independent data; prior inspection and duplicate-candidate limitations are disclosed.

[Data evidence](data/README.md) explains the 44,441 retained records and nested 3,454 entry-flagged records. Source counts are reported rather than independently recounted. Exact retained geography/dates and source identities are incomplete.

[Documentation index](docs/README.md) links reproducible experiments, limitations and the instructor decision brief. Superseded documents and experiment runners were consolidated into a compact experimental history. Unmounted legacy UI panels were removed; the current app does not provide a benchmark tab.

## Checks

```powershell
.\.venv\Scripts\python.exe -m pytest -q --basetemp=.pytest_cache/cleanup-check
cd frontend
npm.cmd run build
```

No dedicated frontend lint/typecheck script is configured. Production deployment configuration uses `server.app.main:app` in `render.yaml` and the Vite frontend in the Vercel configurations. Cleanup does not deploy or commit changes.

## Reproduce frozen assessments

```powershell
.\.venv\Scripts\python.exe eclat_algorithm/scripts/evaluate_multiple_hidden_skills.py --verify
.\.venv\Scripts\python.exe eclat_algorithm/scripts/evaluate_heldout_skills.py --verify
```

Verification reproduces saved counts and scores without overwriting files. Running without `--verify` refuses to replace an existing report. The frozen protocol lists model settings, exact membership, masks and protected production hashes. Historical experiment summaries describe retired variants and should not be presented as independent tests. Source dataset rebuilds additionally require the optional `kagglehub` downloader; the web/API runtime does not.
