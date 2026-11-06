# SkillGap: An ECLAT-Based IT Skill Pattern and Gap Analysis System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Algorithm](https://img.shields.io/badge/Algorithm-ECLAT-FF6F00)](https://en.wikipedia.org/wiki/Association_rule_learning)
[![Dataset](https://img.shields.io/badge/Dataset-LinkedIn_2024-0A66C2?logo=linkedin&logoColor=white)](https://www.kaggle.com/datasets/asaniczka/1-3m-linkedin-jobs-and-skills-2024)

> **Course:** Machine Learning  
> **Core Algorithm:** ECLAT (Equivalence Class Clustering and bottom-up Lattice Traversal)  
> **Application Domain:** Information Technology (IT) Career Development  
> **Target Audience:** IT Students, Fresh Graduates, and Career Changers  
> **Deployment Architecture:** GitHub &rarr; Render (FastAPI REST Backend) + Vercel (React Frontend)

---

## 🧭 Repository Navigation Guide

Every file and folder in this repository is strictly organized to make browsing, developing, and auditing seamless:

```
Eclatt-Skill-Gap-Analyzer/
├── 📁 backend/                      # Python FastAPI REST API & ML mining engine
│   ├── 📁 app/                      # Application source packages
│   │   ├── 📁 core/                 # Config, environment settings, and logging
│   │   ├── 📁 data/                 # In-memory TID-lists, transaction loaders
│   │   ├── 📁 models/               # Pydantic schemas (Request/Response models)
│   │   └── 📁 routes/               # API route controllers (endpoints)
│   ├── 📁 scripts/                  # Dataset validation and exploration scripts
│   │   ├── check_dataset.py         # Transaction stats, ECLAT TID-list demo
│   │   ├── check_dataset2.py        # Title distributions & co-occurrence counts
│   │   └── check_duplicates.py      # Multi-table deduplication audit
│   ├── 📁 tests/                    # Backend unit & integration test suite
│   └── 📄 README.md                 # Detailed backend setup & run instructions
│
├── 📁 data/                         # Data layer (raw Kaggle datasets & processed transactions)
│   ├── 📁 raw/                      # Raw LinkedIn (2024) dataset files
│   │   ├── job_skills.csv           # Job-to-skill junction table (213K+ links)
│   │   ├── postings.csv             # Full job postings with seniority tags (516 MB)
│   │   └── skills.csv               # Skill abbreviation-to-name dictionary
│   ├── 📁 processed/                # Filtered transactions and precomputed indexes
│   └── 📄 README.md                 # Data dictionary, schema, and git policy
│
├── 📁 docs/                         # Academic documentation & research repository
│   ├── 📄 project-plan.md           # 🌟 DEFENSE BLUEPRINT & Academic Specification
│   ├── 📁 research/                 # Methodological analysis and loophole resolutions
│   │   ├── clean_loopholes.md       # In-depth analysis of 7 academic loopholes & fixes
│   │   ├── clean_recommendations.md # Scope, role segmentation & model guidelines
│   │   ├── chatgpt_evaluation_full.md # Full defense-readiness evaluation transcript
│   │   ├── skillgap_chatgpt_response.md # Original blueprint formulate transcript
│   │   ├── 📁 tools/                # Extraction scripts for chat archives
│   │   ├── 📁 raw/                  # Archived web scrapes & raw data logs
│   │   └── 📄 README.md             # Research directory guide
│   └── 📄 README.md                 # Documentation hub guide
│
├── 📁 frontend/                     # React single-page application (UI/UX)
│   ├── 📁 public/                   # Static assets (favicons, icons)
│   ├── 📁 src/
│   │   ├── 📁 api/                  # Axios/fetch backend API connectors
│   │   ├── 📁 assets/               # CSS styles, SVGs, and images
│   │   ├── 📁 components/           # Reusable UI widgets (SkillSelector, RuleCard)
│   │   └── 📁 pages/                # Route views (Dashboard, GapAnalysis, Metrics)
│   └── 📄 README.md                 # Frontend component overview & dev commands
│
├── 📁 postman/                      # Postman API workspace definitions & environments
├── 📁 .postman/                     # Postman CLI configuration metadata
├── 📄 .gitignore                    # Git ignore file (excludes >100MB postings.csv, etc.)
└── 📄 README.md                     # This file (master navigation hub)
```

---

## 🎯 Executive Summary & Purpose

IT students and graduates often struggle to identify the secondary and tertiary technical skills expected alongside core programming languages. Traditional job search platforms provide flat lists of requirements without uncovering **conditional dependencies** (e.g., *How does the demand for Docker or Redis shift once a candidate already possesses Python and PostgreSQL?*).

**SkillGap** models IT skill co-occurrence using **vertical transaction lists (TID-lists)** with the **ECLAT algorithm** to:
1. Discover frequent co-occurring skill itemsets for 3 core IT tracks (Backend, Frontend, Data Analyst).
2. Compute conditional association rules evaluated by **Support**, **Confidence**, and **Lift**.
3. Detect candidate-specific skill gaps and cluster recommendations based on user-selected competencies.
4. Validate recommendation performance against a naive frequency baseline using **Masked Skill Recovery (Leave-One-Out Hit-Rate@K)**.

---

## 🛡️ Resolution of Academic Loopholes & Forensic Fixes

| Loophole Identified | Root Academic Risk | SkillGap Engineering Solution | Reference |
| :--- | :--- | :--- | :--- |
| **0. Data Source Mismatch** | Raw data has 35 broad industry codes (`Sales`, `MGMT`), not IT skills | **Data Rectification Protocol:** Migrate to granular skills (`asaniczka` or regex extraction); 300+ whitelist | [`docs/project-plan.md`](./docs/project-plan.md#3-data-pipeline--taxonomy-rectification-resolving-flaw-0--4) |
| **1. Seniority Bias** | 89% mid-senior posts skew advice toward senior tooling | Dual mode: **Entry-Level Market** (`experience_filter='entry'`) vs **General Market** (`'all'`) | [`docs/project-plan.md`](./docs/project-plan.md#42-seniority-multi-signal-filtering-loophole-1) |
| **2. Predictive Overreach** | ECLAT cannot guarantee hiring or sequence priorities | Framed strictly as empirical co-occurrence patterns; ranked by **Lift** and **Confidence** | [`docs/project-plan.md`](./docs/project-plan.md#12-academic-problem-statement) |
| **3. ECLAT vs Count(*)** | Popular skills alone don't justify machine learning | Generates **conditional dependencies** ($P(B \mid A)$) vs marginal frequency ($P(B)$) | [`docs/project-plan.md`](./docs/project-plan.md#51-why-eclat-over-apriori) |
| **4. Unvetted Skills** | Soft skills and generic perks pollute transactions | Strict IT skill taxonomy whitelist with canonical normalization | [`docs/project-plan.md`](./docs/project-plan.md#32-canonical-technical-skill-whitelist) |
| **5. Excessive Scope** | 15+ job roles lead to sparse mapping and noise | Scoped strictly to **3 core tracks**: Backend, Frontend, and Data Analyst | [`docs/project-plan.md`](./docs/project-plan.md#4-bounded-occupational-scope--role-classification-loophole-5) |
| **6. Lack of Evaluation** | Subjective recommendations cannot be defended | **Masked Skill Recovery (Leave-One-Out Hit-Rate@K)** + Long-Tail evaluation split | [`docs/project-plan.md`](./docs/project-plan.md#7-rigorous-evaluation-methodology-loophole-3--6) |
| **7. Cold-Start Failure** | Zero input skills or unseen combinations yield empty rules | 3-tier fallback: exact antecedent $\rightarrow$ sub-lattice step-down $\rightarrow$ 1-itemset role baseline | [`docs/project-plan.md`](./docs/project-plan.md#6-cold-start-protocol--sub-lattice-fallback-loophole-7) |

---

## ⚡ Quickstart

### 1. Inspect & Validate Dataset
The project includes verification scripts to audit dataset integrity and test the vertical TID-list intersection logic:

```bash
# Check skill frequency and run pair intersection (ECLAT vertical op)
python backend/scripts/check_dataset.py

# Check title distribution and top co-occurring skill pairs
python backend/scripts/check_dataset2.py

# Audit dataset for duplicate rows and keys
python backend/scripts/check_duplicates.py
```

### 2. Run Backend API
```bash
# Run FastAPI development server
uvicorn backend.app.main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at: `http://localhost:8000/docs`

---

## 📚 Core Documentation Index

- **Academic Blueprint & Defense Guide**: [`docs/project-plan.md`](./docs/project-plan.md)
- **Detailed Loophole Resolutions**: [`docs/research/clean_loopholes.md`](./docs/research/clean_loopholes.md)
- **Methodology & Architectural Recommendations**: [`docs/research/clean_recommendations.md`](./docs/research/clean_recommendations.md)
- **Complete Evaluation Transcript**: [`docs/research/chatgpt_evaluation_full.md`](./docs/research/chatgpt_evaluation_full.md)
- **Backend Guide**: [`backend/README.md`](./backend/README.md)
- **Data Dictionary**: [`data/README.md`](./data/README.md)
- **Frontend Architecture**: [`frontend/README.md`](./frontend/README.md)
