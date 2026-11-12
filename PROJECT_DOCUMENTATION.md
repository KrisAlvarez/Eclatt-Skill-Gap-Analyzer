> Historical document: dataset fields, seniority percentages, and validation claims below are superseded by the [current data evidence guide](data/README.md) and [retained-data audit](data/processed/data_audit.json). Human classification review is pending.

# SkillGap: Project Execution & Architecture Documentation
## Comprehensive Record from Project Inception to Current Status

> **Project Title:** SkillGap — An ECLAT-Based IT Skill Pattern and Gap Analysis System  
> **Course:** Machine Learning  
> **Primary Algorithm:** ECLAT (Equivalence Class Clustering and bottom-up Lattice Traversal)  
> **Repository:** `Eclatt-Skill-Gap-Analyzer`  
> **Documentation Date:** November 5, 2026  

---

## Table of Contents
1. [Project Overview & Core Mission](#1-project-overview--core-mission)
2. [Chronological Execution Log (Start to Current)](#2-chronological-execution-log-start-to-current)
3. [The 7 Academic Loopholes & Exact Engineering Solutions](#3-the-7-academic-loopholes--exact-engineering-solutions)
4. [Dataset Audit & Storage Diagnostics](#4-dataset-audit--storage-diagnostics)
5. [ECLAT Algorithm: Mathematical Justification & Defense Guide](#5-eclat-algorithm-mathematical-justification--defense-guide)
6. [Cloud Architecture & Remote Hosting Pipeline](#6-cloud-architecture--remote-hosting-pipeline)
7. [Repository File Map](#7-repository-file-map)
8. [Current Status & Next Immediate Milestones](#8-current-status--next-immediate-milestones)

---

## 1. Project Overview & Core Mission

### The Core Problem
Students and fresh graduates entering the IT industry frequently struggle to identify **what secondary and tertiary skills employers expect in combination with core programming languages**. While traditional job boards present long, unstructured requirement lists, they fail to reveal **conditional skill dependencies** (e.g., how the expectation of knowing Docker or Redis changes once a candidate already knows Python and PostgreSQL).

### The Solution: SkillGap
SkillGap is a machine learning web application that uses **association rule mining (ECLAT)** on historical job postings. Rather than displaying generic popularity rankings, the app:
1. Takes a user's target IT role and their currently known skills.
2. Identifies matching **antecedent rule sets** mined from real job postings.
3. Surfaces missing co-required skills (**consequents**) ranked by **Confidence** and **Lift**.
4. Provides transparent co-occurrence network graphs and cluster groupings.

---

## 2. Chronological Execution Log (Start to Current)

Here is the exact record of all actions taken from project kickoff to now:

```
[Kickoff: Architecture Decisions]
   │
   ├─► Confirmed decoupled architecture:
   │   - Backend: Python / FastAPI on GitHub -> Deployed on Render (Web Service API)
   │   - Frontend: React / Vite on Vercel -> Consumes remote Render API
   │   - Zero local server requirement for grading / live usage.
   │
[Data Acquisition & Investigation]
   │
   ├─► Installed Kaggle API CLI and configured dependencies (six, pandas, urllib).
   ├─► Retrieved actual 2024 LinkedIn Job Postings dataset files from Kaggle:
   │   - data/raw/skills.csv (35 category codes)
   │   - data/raw/job_skills.csv (213,768 records linking job_id to skill abbreviations)
   │   - data/raw/postings.csv (1,348,454 job records with titles & full descriptions, 516 MB)
   │
[Storage & Duplicate Audit]
   │
   ├─► Audited disk space and row-level duplicates:
   │   - job_skills.csv: 213,768 rows -> 0 duplicates
   │   - skills.csv: 35 rows -> 0 duplicates
   │   - postings.csv: 1,348,454 unique job IDs -> 0 duplicates
   ├─► Storage diagnosis: Diagnosed why storage shrank — 95%+ of the 492.9 MB file
   │   is full HTML/text in the 'description' column.
   ├─► Created root .gitignore to exclude postings.csv (preventing GitHub 100MB limit failure).
   │
[Academic Review & Loophole Resolution]
   │
   ├─► Integrated critical academic critique (analyzing the 7 vulnerabilities).
   ├─► Addressed all 7 loopholes (seniority bias, counting vs. ECLAT, evaluation, etc.).
   ├─► Created scripts/check_dataset.py and scripts/check_dataset2.py to verify 3-table joins.
   ├─► Produced the master defense blueprint (project-plan.md).
```

---

## 3. The 7 Academic Loopholes & Exact Engineering Solutions

During project design, we subjected our concept to a rigorous academic critique. Below is how each vulnerability is permanently resolved:

### Loophole 1: Seniority Bias in Job Postings
* **The Vulnerability:** In the 1.3M dataset, approximately **89% of postings are Mid-to-Senior level**, while only **~10.7% are Entry-Level / Associate**. If an app for students naively trains on the entire dataset, it will recommend senior architecture tools (e.g., Kubernetes orchestration, multi-region failover, Terraform) that are unrealistic for fresh graduates.
* **Our Engineering Solution:** We utilize the `formatted_experience_level` metadata in `postings.csv`. The preprocessing pipeline creates an **Entry-Level Model** (`experience_filter='entry'`) alongside a **General Market Model** (`experience_filter='all'`). Students see what entry jobs expect vs. general market trends.

---

### Loophole 2: What ECLAT Can and Cannot Do
* **The Vulnerability:** ECLAT discovers **co-occurrence itemsets** (skills appearing together in the same basket). It does **not** understand learning prerequisites (e.g., you must learn Python syntax before Django), nor does it guarantee employment.
* **Our Engineering Solution:** We frame the application transparently as an **Association-Based IT Skill Pattern & Gap Analyzer**. Missing skills are ranked strictly by mathematical association metrics (**Confidence** and **Lift**), with contextual explanations (e.g., *"Appears in 84% of entry backend jobs requiring Python & SQL"*).

---

### Loophole 3: Defending "Why ECLAT?" vs. Simple Counting (`COUNT(*)`)
* **The Vulnerability (Crucial defense question):** *"Why use an ML frequent itemset algorithm instead of just doing a simple SQL query counting the most popular skills?"*
* **Our Engineering Solution:**
  - A simple count gives **marginal frequency** $P(B)$ (e.g., Docker is in 45% of backend jobs). It recommends the exact same skills to every user regardless of what they already know.
  - **ECLAT computes conditional association rules** $P(B \mid A)$. If a user knows `[Python, SQL]`, the conditional requirement for Docker jumps to 84% ($\text{Lift} = 1.86$). If a user knows `[Java, SQL]`, the requirement pivots to Spring Boot. ECLAT personalizes recommendations based on **skill ecosystem co-occurrence**.

---

### Loophole 4: Unvetted Skills & Company Perks
* **The Vulnerability:** Raw job descriptions contain company benefits, soft skills, and generic company tools that are not actual job qualification requirements.
* **Our Engineering Solution:** We implement a **Canonical Technical Skill Whitelist** spanning 5 core categories (Languages, Frameworks, Databases, DevOps/Cloud, Architecture Concepts). Unrelated vocabulary is strictly excluded during transaction extraction.

---

### Loophole 5: Scope Creep Across 15 Roles
* **The Vulnerability:** Trying to support 15 poorly defined job roles dilutes transaction volume, causes low support counts, and creates noisy title matching.
* **Our Engineering Solution:** We strictly scope Phase 1 to **3 high-demand, well-defined IT roles**:
  1. **Backend Developer**
  2. **Frontend Developer**
  3. **Data Analyst / Data Scientist**

---

### Loophole 6: Formal Machine Learning Evaluation
* **The Vulnerability:** Most student association mining projects provide no quantitative evaluation to prove the model actually works.
* **Our Engineering Solution:** We implement **leakage-safe masked skill recovery**:
  - We hold out a 20% test set of real job postings.
  - We mask one skill from each posting and feed the remaining skills into our ECLAT rule engine.
  - We calculate **Hit-Rate@3** and **Hit-Rate@5** to verify whether the masked skill appears in the top recommendations.
  - We benchmark this against a Naive Frequency Baseline (`COUNT(*)`) without assuming ECLAT will win every segment.

---

### Loophole 7: The Cold-Start & Unseen Input Problem
* **The Vulnerability:** If a user selects 0 skills, or enters an uncommon combination that doesn't trigger any association rules, ECLAT outputs an empty list.
* **Our Engineering Solution:** We implement a **Two-Tier Fallback Policy**:
  - If 0 skills are provided: The system returns the top unconditional 1-itemsets (baseline most frequent skills for that role) with a clear UI banner: *"Showing baseline essential skills for beginners"*.
  - If an unseen combination is provided: The engine performs sub-lattice testing (evaluating subsets of size $k-1$) before falling back gracefully.

---

## 4. Dataset Audit & Storage Diagnostics

Our actual inspection and alignment yielded the following metrics:

### 1. Production Benchmark Dataset (1.3M+ asaniczka LinkedIn 2024 Dataset)
- **Source:** Kaggle `asaniczka/1-3m-linkedin-jobs-and-skills-2024`
- **Total Ingested Records:** 1,300,000+ job postings & skills
- **Clean Filtered IT Transactions:** 44,441 validated primary-assigned transactions (>=2 technical skills, 0 cross-track overlap)
  - **Backend Developer:** 28,388 total (1,724 entry-level)
  - **Frontend Developer:** 2,520 total (292 entry-level)
  - **Data Analyst:** 13,533 total (1,438 entry-level)
- **Precomputed Artifacts:** `data/processed/clean_transactions.json`, `rules.json`, `clean_summary.json`, `evaluation_metrics.json`

### 2. Local Sample Dataset (`data/raw/`)

| File | Path | Size | Records | Duplicate Rows | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`job_skills.csv`** | `data/raw/job_skills.csv` | 3.5 MB | 213,768 | **0** | Maps `job_id` to `skill_abr` |
| **`skills.csv`** | `data/raw/skills.csv` | 679 B | 35 | **0** | Code dictionary |
| **`postings.csv`** | `data/raw/postings.csv` | 492.9 MB | 1,348,454 | **0** | Job titles, experience level, descriptions |

### Storage & Serialization Optimization:
- **Investigation:** Running column size diagnostics revealed that **over 95% of the 492.9 MB in `postings.csv` is raw text in the `description` column**.
- **GitHub Protection:** Because GitHub rejects any file larger than 100 MB, we added `data/raw/postings.csv` to `.gitignore`.
- **Precomputed Model Strategy:** We only need raw files during local preprocessing. Once ECLAT trains and exports the rule sets into `data/processed/rules.json` (~1.8 MB), the backend runs entirely from lightweight JSON files without needing 500 MB+ raw datasets on Render!

---

## 5. ECLAT Algorithm: Mathematical Justification & Defense Guide

### Why ECLAT over Apriori?
- **Apriori (Horizontal):** Repeatedly scans the full database to count candidate support. Extremely slow on large datasets.
- **ECLAT (Vertical):** Transforms transactions into **TID-lists** (Transaction ID lists). Computing co-occurrence is a simple, ultra-fast **set intersection**:
  $$t(\text{Python} \cup \text{SQL} \cup \text{Docker}) = t(\text{Python}) \cap t(\text{SQL}) \cap t(\text{Docker})$$

### Core Metrics Used in Recommendations

1. **Support:** Frequency of the skill combination in all role postings:
   $$\text{Supp}(A \cup B) = \frac{|t(A) \cap t(B)|}{|D|}$$
2. **Confidence:** Given the user has skill set $A$, how often is skill $B$ also required?
   $$\text{Conf}(A \rightarrow B) = \frac{\text{Supp}(A \cup B)}{\text{Supp}(A)}$$
3. **Lift:** How much more likely is $B$ required when $A$ is present compared to random chance?
   $$\text{Lift}(A \rightarrow B) = \frac{\text{Conf}(A \rightarrow B)}{\text{Supp}(B)}$$
   *$\text{Lift} > 1.0$ indicates true positive co-occurrence dependency, not just independent popularity.*

---

## 6. Cloud Architecture & Remote Hosting Pipeline

```
┌─────────────────────────────────┐
│       1. Local Machine          │
│   Preprocess & Test Backend     │
└──────────────┬──────────────────┘
               │ git push
               ▼
┌─────────────────────────────────┐
│     2. GitHub Repository        │
│   (Houses FastAPI + .pkl rules) │
└──────────────┬──────────────────┘
               │ Connected via Webhook
               ▼
┌─────────────────────────────────┐
│     3. Render Web Service       │  <─── Hosts the REST API
│   https://skillgap-api.onrender │       (Never sleeps if pinged,
│   .com/api/analyze              │        zero local server needed)
└──────────────▲──────────────────┘
               │ HTTPS Requests / JSON
┌──────────────┴──────────────────┐
│     4. Frontend Application     │  <─── Hosted on Vercel / Netlify
│   (React + Tailwind + D3.js)    │       (Accessible anywhere)
└─────────────────────────────────┘
```

---

## 7. Repository File Map

```
Eclatt-Skill-Gap-Analyzer/
├── 🖥️ server/                       # THE SERVER SIDE (FastAPI REST Service)
│   ├── app/
│   │   ├── main.py                  # Server entry point & CORS
│   │   ├── config.py                # Server paths & settings
│   │   ├── schemas/models.py        # Pydantic schemas
│   │   └── routes/                  # /analyze, /roles, /metrics
│   ├── requirements.txt             # Server dependencies
│   └── README.md                    # Server architecture & endpoints
├── 🧮 eclat_algorithm/              # THE ECLAT ALGORITHMS (ML Engine)
│   ├── miner.py                     # Core ECLATMiner & vertical TID-lists
│   ├── taxonomy.py                  # IT Skill taxonomy & alias normalizer
│   ├── evaluation.py                # Leakage-safe masked-skill benchmark
│   ├── builder.py                   # Role & seniority dataset preprocessor
│   ├── runner.py                    # Precomputed rule generator
│   ├── scripts/                     # Standalone CLI tools (build_asaniczka, mining, eval)
│   │   ├── build_asaniczka.py       # 1.3M dataset ingestion pipeline
│   │   ├── build_dataset.py         # Local postings.csv builder
│   │   ├── run_mining.py            # Offline rule precomputation
│   │   └── run_evaluation.py        # Hit-Rate benchmark runner
│   └── README.md                    # Algorithmic & mathematical guide
├── 🎨 frontend/                     # THE FRONTEND (React / Vite UI)
│   ├── src/pages/                   # Full tab views (Home, Explorer, Roadmaps, etc.)
│   ├── src/components/              # Reusable UI widgets
│   ├── src/api/client.js            # Multi-host failover API client
│   ├── package.json
│   └── README.md
├── 📊 data/                         # DATA LAYER (1.3M asaniczka & local raw)
│   ├── raw/                         # Raw LinkedIn CSVs (postings.csv, job_skills.csv)
│   ├── processed/                   # clean_transactions.json (44,441 items), rules.json
│   └── README.md
├── 🧪 tests/                        # AUTOMATED TESTS (test_eclat.py, test_server.py)
├── 📑 docs/                         # BLUEPRINT & RESEARCH (project-plan.md, research/)
├── eclat_colab.ipynb                # Google Colab Notebook with interactive ECLAT pipeline
├── render.yaml                      # Render cloud deployment config
├── pytest.ini                       # Pytest configuration
├── requirements.txt                 # Root Python dependencies
└── README.md                        # Master repository navigation hub
```

---

## 8. Current Status & Next Immediate Milestones

We have completed all research, dataset cleaning, loophole formulations, and environment setups.

### Immediate Next Milestone: Phase 1b — Preprocessing Pipeline
We are ready to build `backend/scripts/preprocess_pipeline.py`:
1. Parse `postings.csv` and filter by the 3 target roles (`Backend Developer`, `Frontend Developer`, `Data Analyst / Scientist`).
2. Separate into **Entry-Level** and **General** transaction buckets.
3. Extract clean technical skill sets per job posting.
4. Execute ECLAT on the vertical TID-sets.
5. Export `backend_rules.pkl`, `frontend_rules.pkl`, and `data_science_rules.pkl` into `data/processed/`.

Once exported, we immediately proceed to assembling the FastAPI backend and launching the Render deployment!
