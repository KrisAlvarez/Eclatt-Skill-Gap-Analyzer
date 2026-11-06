# SkillGap Backend

FastAPI REST API and ECLAT Association Rule Mining Engine for IT career skill pattern discovery and gap analysis.

---

## Architecture Overview

```
backend/
├── app/
│   ├── main.py              # FastAPI application entrypoint with CORS & routes
│   ├── core/
│   │   ├── config.py        # Settings, file paths, support/confidence thresholds
│   │   └── taxonomy.py      # 300+ technical skill whitelist, alias mapping & categories
│   ├── data/
│   │   └── eclat_miner.py   # Pure Python ECLAT engine (vertical TID-lists, rules & fallback)
│   ├── models/
│   │   └── schemas.py       # Pydantic request/response models
│   └── routes/
│       ├── analyze.py       # POST /api/v1/analyze (3-Tier gap analysis recommendation)
│       ├── roles.py         # GET /api/v1/roles (Tracks, counts & taxonomy catalog)
│       └── metrics.py       # GET /api/v1/metrics (Offline Leave-One-Out Hit-Rate@K)
├── scripts/
│   ├── build_clean_dataset.py  # Hybrid title+stack classifier & skill extractor
│   ├── run_eclat_offline.py    # Precomputes rules & exports compact rules.json (Render-safe)
│   ├── run_evaluation.py       # Leave-One-Out Hit-Rate@K vs Naive baseline evaluation
│   ├── check_dataset.py        # Exploratory verification script
│   ├── check_dataset2.py       # Title and co-occurrence distributions
│   └── check_duplicates.py     # Dataset integrity auditor
├── tests/
│   ├── test_eclat.py        # Unit tests for ECLAT lattice intersections & rules
│   └── test_api.py          # Integration tests for FastAPI endpoints
└── README.md
```

---

## Quickstart & Pipeline Execution

### 1. Build Sanitized IT Transactions (Hybrid Classifier)
Streams `data/raw/postings.csv` in memory-efficient chunks, extracts canonical technical skills, applies multi-signal junior filters, and saves clean transactions:
```bash
python backend/scripts/build_clean_dataset.py
```

### 2. Precompute ECLAT Association Rules
Mines frequent itemsets via vertical TID-list intersections and exports a compact `data/processed/rules.json` (~2 MB), keeping memory usage under 40 MB:
```bash
python backend/scripts/run_eclat_offline.py
```

### 3. Run Academic Leave-One-Out Evaluation
Evaluates ECLAT Hit-Rate@3 and Hit-Rate@5 against a Naive Popularity Baseline (`COUNT(*)`) across an 80/20 train/test split:
```bash
python backend/scripts/run_evaluation.py
```

### 4. Run Pytest Suite
```bash
python -m pytest backend/tests/
```

### 5. Launch FastAPI Development Server
```bash
uvicorn backend.app.main:app --reload --port 8000
```
Interactive Swagger API documentation: `http://localhost:8000/docs`

---

## Core API Endpoints

* **`POST /api/v1/analyze`**: Accepts target role, possessed skills, and experience mode (`entry` or `all`). Returns missing skill complements ranked by Lift and Confidence with 3-tier fallback.
* **`GET /api/v1/roles`**: Returns available IT tracks, market sizes, and skills organized by functional category.
* **`GET /api/v1/metrics`**: Serves offline Leave-One-Out Hit-Rate@K evaluation data comparing ECLAT against baseline.
* **`GET /health`**: Monitoring healthcheck for cloud deployment.
