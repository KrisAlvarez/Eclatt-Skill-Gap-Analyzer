# SkillGap: An Exploratory IT Skill-Pattern Tool

[![FastAPI](https://img.shields.io/badge/Server-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Algorithm](https://img.shields.io/badge/Algorithm-ECLAT-FF6F00)](https://en.wikipedia.org/wiki/Association_rule_learning)
[![Dataset](https://img.shields.io/badge/Dataset-LinkedIn_2024-0A66C2?logo=linkedin&logoColor=white)](https://www.kaggle.com/datasets/asaniczka/1-3m-linkedin-jobs-and-skills-2024)

> **Course:** Machine Learning  
> **Core Algorithm:** ECLAT (Equivalence Class Clustering and bottom-up Lattice Traversal)  
> **Application Domain:** Information Technology (IT) Career Development  
> **Target Audience:** IT Students, Fresh Graduates, and Career Changers  
> **Deployment Architecture:** GitHub &rarr; Render (FastAPI REST Server) + Vercel (React Frontend)

SkillGap explores skills mentioned together in historical postings. The source reports 1,348,454 postings; SkillGap retains 44,441 rule-assigned records, including 3,454 entry-flagged records. Labels await human review. Geographic coverage and exact collection dates are not established from retained records. See [data evidence and audit instructions](data/README.md) for counts, duplicate candidates across splits, and the human review sheet.

---

## 🧭 Master Repository Navigation Guide

The project is structured into clear, decoupled domains so that anyone can immediately locate the **Server Side**, the **ECLAT Algorithms**, the **Frontend UI**, the **Datasets**, the **Test Suites**, and the **Academic Defense Documentation**:

```
Eclatt-Skill-Gap-Analyzer/
│
├── 🖥️ server/                       # THE SERVER SIDE (FastAPI REST API Service)
│   ├── app/                         # Server application packages
│   │   ├── main.py                  # FastAPI server entry point, CORS middleware, routing
│   │   ├── config.py                # Pydantic server settings & file paths
│   │   ├── schemas/                 # Request & Response models (Pydantic)
│   │   │   └── models.py            # GapAnalysisRequest, GapRecommendation, RolesResponse
│   │   └── routes/                  # API Endpoint Controllers
│   │       ├── analyze.py           # POST /api/v1/analyze (3-Tier recommendation engine)
│   │       ├── roles.py             # GET /api/v1/roles (Roles & taxonomy catalog)
│   │       └── metrics.py           # GET /api/v1/metrics (Hit-Rate@K validation metrics)
│   ├── requirements.txt             # Server Python dependencies
│   └── README.md                    # Server architecture, endpoints & run guide
│
├── 🧮 eclat_algorithm/              # THE ECLAT ALGORITHMS (Machine Learning Engine)
│   ├── miner.py                     # Core ECLATMiner: Vertical TID-lists & Lattice Intersections
│   ├── taxonomy.py                  # Canonical IT Skills Taxonomy & alias regex normalizer
│   ├── evaluation.py # Leakage-safe train/validation/test masked recovery
│   ├── builder.py                   # Data preprocessing & hybrid title+stack classifier
│   ├── runner.py                    # Precomputes & serializes rules to rules.json
│   ├── scripts/                     # Standalone CLI tools to run and test ECLAT:
│   │   ├── build_dataset.py         # Builds clean transactions from asaniczka 1.3M dataset (via kagglehub)
│   │   ├── run_mining.py            # Executes ECLAT offline & saves rules.json
│   │   ├── run_evaluation.py        # Computes Hit-Rate@K benchmark & saves metrics
│   │   ├── check_dataset.py         # TID-list demonstration & pair intersection test
│   │   ├── check_dataset2.py        # Title distributions & co-occurrence counts
│   │   └── check_duplicates.py      # Multi-table deduplication audit
│   └── README.md                    # Full mathematical proof, lattice theory & ECLAT guide
│
├── 🎨 frontend/                     # THE FRONTEND (React / Vite UI Client)
│   ├── src/
│   │   ├── api/client.js            # API client connecting to FastAPI server
│   │   ├── pages/                   # Full-screen tab views (swapped by App.jsx)
│   │   │   ├── HomeTab.jsx          # Landing page with CTAs
│   │   │   ├── ExplorerTab.jsx      # Main skill gap analysis explorer
│   │   │   ├── RoadmapsTab.jsx      # Learning roadmap builder
│   │   │   ├── HowToUseTab.jsx      # Guide / walkthrough page
│   │   │   └── AboutTab.jsx         # Project info & academic context
│   │   ├── components/              # Reusable UI widgets (shared across pages)
│   │   │   ├── Navbar.jsx           # App header & server status badge
│   │   │   ├── RoleSelector.jsx     # Track switcher (Backend, Frontend, Data Analyst)
│   │   │   ├── SkillSelector.jsx    # Category-grouped multi-select skill chips
│   │   │   ├── AnalysisResults.jsx  # Recommendations, Lift/Confidence badges
│   │   │   ├── EvaluationDashboard.jsx # Hit-Rate@K vs Naive Baseline visualizer
│   │   │   ├── LearningRoadmap.jsx  # Skill roadmap timeline renderer
│   │   │   ├── TechnicalDeepDive.jsx # Algorithm explainer panel
│   │   │   └── DefenseModal.jsx     # Defense Q&A & 7 loopholes modal
│   │   ├── utils/                   # Shared utility functions & helpers
│   │   ├── App.jsx                  # Root layout & reactive state orchestrator
│   │   └── index.css                # Tailwind / custom CSS design system
│   ├── .env                         # Local dev (VITE_API_BASE_URL=http://localhost:8000)
│   ├── .env.production              # Production (Render cloud URL for Vercel builds)
│   ├── package.json                 # Node dependencies
│   └── README.md                    # Frontend setup & development guide
│
├── 📊 data/                         # DATA LAYER (Raw & Processed Data)
│   ├── raw/                         # Automated via kagglehub ("asaniczka/1-3m-linkedin-jobs-and-skills-2024")
│   │   └── README.md                # Ingestion instructions & dataset details
│   ├── processed/                   # Preprocessed transactions & precomputed indexes
│   │   ├── clean_transactions.json  # Sanitized role-segmented transactions (44,441 heuristic role-assigned records; source deduplication unverified)
│   │   ├── clean_summary.json       # Seniority & track distribution counts
│   │   ├── rules.json               # Precomputed association rules (sub-millisecond lookups)
│   │   └── evaluation_metrics.json  # Hit-Rate@3, Hit-Rate@5, Lift over baseline
│   └── README.md                    # Dataset dictionary, schema & storage notes
│
├── 🧪 tests/                        # AUTOMATED TEST SUITE
│   ├── test_eclat.py                # Unit tests: TID-lists, itemsets, rules, fallback tiers
│   └── test_server.py               # Integration tests: FastAPI endpoints (/health, /analyze, etc.)
│
├── 📑 docs/                         # DEFENSE SPECIFICATIONS & RESEARCH
│   ├── SYSTEM_COMPREHENSIVE_GUIDE.md # 🌟 Exhaustive Master AI & Architecture Compendium
│   ├── project-plan.md              # Master Academic Blueprint & Defense Plan
│   ├── research/                    # Critical evaluation notes & loophole resolutions
│   │   ├── clean_loopholes.md       # In-depth resolution of 7 academic loopholes
│   │   ├── clean_recommendations.md # Scope, role segmentation & model guidelines
│   │   ├── chatgpt_evaluation_full.md # Full defense-readiness evaluation transcript
│   │   ├── tools/                   # Scraper scripts
│   │   └── raw/                     # Archived web scrapes & raw data logs
│   └── README.md                    # Documentation index
│
├── eclat_colab.ipynb                # Google Colab Notebook (standalone interactive ECLAT pipeline)
├── render.yaml                      # Render cloud deployment blueprint
├── pytest.ini                       # Pytest test configuration
├── requirements.txt                 # Root Python dependencies
└── README.md                        # Master repository navigation hub (this file)
```

---

## ⚡ Quickstart Commands

### 1. Test the ECLAT Algorithms
Run the standalone CLI scripts to verify dataset integrity and ECLAT mining:
```bash
# Verify TID-list vertical set intersections
python -m eclat_algorithm.scripts.check_dataset

# Run offline ECLAT rule mining
python -m eclat_algorithm.scripts.run_mining

# Run Masked Skill Recovery benchmark
python -m eclat_algorithm.scripts.run_evaluation
```

### 2. Run All Automated Tests
```bash
pytest
```
*(All 10 unit and integration tests run in ~0.5s).*

### 3. Launch the Server Side (FastAPI API)
```bash
uvicorn server.app.main:app --reload --port 8000
```
- Interactive Swagger documentation: `http://localhost:8000/docs`

### 4. Launch the Frontend (React / Vite)
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🛡️ Resolution of 7 Academic Loopholes

| Loophole Identified | Root Academic Risk | SkillGap Engineering Solution | Reference |
| :--- | :--- | :--- | :--- |
| **1. Seniority Bias** | Experience labels may be incomplete or inaccurate | Explore an entry-flagged subset or all retained records; human label review is pending | [`docs/project-plan.md`](./docs/project-plan.md#32-addressing-seniority-bias-loophole-1) |
| **2. Predictive Overreach** | ECLAT cannot guarantee hiring or sequence priorities | Framed strictly as empirical co-occurrence patterns; ranked by **Lift** and **Confidence** | [`docs/research/clean_loopholes.md`](./docs/research/clean_loopholes.md) |
| **3. ECLAT vs Count(*)** | Popular skills alone don't justify machine learning | Generates **conditional dependencies** ($P(B \mid A)$) vs marginal frequency ($P(B)$) | [`docs/project-plan.md`](./docs/project-plan.md#13-refined-objective) |
| **4. Unvetted Skills** | Soft skills and generic perks pollute transactions | Strict IT skill taxonomy whitelist with canonical normalization | [`eclat_algorithm/taxonomy.py`](./eclat_algorithm/taxonomy.py) |
| **5. Excessive Scope** | 15+ job roles lead to sparse mapping and noise | Scoped strictly to **3 core tracks**: Backend, Frontend, and Data Analyst | [`docs/project-plan.md`](./docs/project-plan.md#33-focused-scope-3-core-it-tracks-loophole-5) |
| **6. Lack of Evaluation** | Subjective recommendations cannot be defended | **80/20 train/test masked-skill recovery** through the production rule/fallback path with popularity baseline and confidence intervals | [`eclat_algorithm/evaluation.py`](./eclat_algorithm/evaluation.py) |
| **7. Cold-Start Failure** | Zero input skills or unseen combinations yield empty rules | 3-tier cascade: Exact Match &rarr; Sub-Lattice Step-Down &rarr; Unconditional Prior | [`server/app/routes/analyze.py`](./server/app/routes/analyze.py) |
