# 📊 Data Layer & Transaction Storage

This directory manages sanitized, preprocessed IT transactions for the **SkillGap** ECLAT mining engine, relying exclusively on the **1.3M LinkedIn Jobs & Skills 2024** benchmark by `asaniczka`.

---

## 📂 Directory Layout

```
data/
├── raw/                          # Managed via kagglehub ("asaniczka/1-3m-linkedin-jobs-and-skills-2024")
│   └── README.md                 # Dataset instructions
├── processed/                    # Cleaned, role-segmented transactions & precomputed rules
│   ├── clean_transactions.json   # Validated IT transactions with canonical skills (>= 3 skills)
│   ├── clean_summary.json        # Role & seniority segment counts
│   ├── rules.json                # Precomputed ECLAT association rules (Render production cache)
│   └── evaluation_metrics.json   # Offline Leave-One-Out Hit-Rate@K validation benchmarks
└── README.md                     # This document
```

---

## 🌐 Dataset Overview

The ECLAT models are aligned with the comprehensive **1.3M+ LinkedIn Jobs & Skills 2024 Dataset** ([asaniczka Kaggle benchmark](https://www.kaggle.com/datasets/asaniczka/1-3m-linkedin-jobs-and-skills-2024)):

### Production Transaction Counts (`clean_summary.json`)

| IT Career Track | Total Transactions (`all`) | Entry-Level Segment (`entry`) |
|-----------------|----------------------------|-------------------------------|
| **Backend Developer** | 39,801 | 2,804 |
| **Frontend Developer** | 23,617 | 1,705 |
| **Data Analyst** | 25,080 | 2,321 |
| **Total Role Assignments** | **88,498** | **6,830** |
*(Representing **50,266** unique, verified IT transactions matching $\ge 2$ canonical skills from the 1.3M dataset).*

---

## 🔄 Preprocessing & Data Ingestion Protocol

1. **Ingestion Pipeline**:
   - `python -m eclat_algorithm.builder`: Automatically resolves and streams `linkedin_job_postings.csv` and `job_skills.csv` directly from `kagglehub` cache, extracting canonical skills, categorizing into IT roles, and generating `data/processed/clean_transactions.json`.
2. **Canonical Skill Normalization**: Raw skill strings are mapped to canonical technical entities using `eclat_algorithm.taxonomy.SKILL_TAXONOMY` and `ALIAS_MAP`.
3. **Hybrid Role Classification**: Positions are mapped into **Backend Developer**, **Frontend Developer**, and **Data Analyst** using a hybrid title regex + technology stack disambiguation algorithm (`eclat_algorithm.builder.classify_role`).
4. **Multi-Signal Seniority Filtering**: Positions are tagged as `entry` using both explicit `job_level` metadata and title junior keyword matching (`is_entry_level`).
5. **Density Constraint**: Transactions with fewer than 2 verified skills are pruned to ensure valid multi-item rule antecedents and consequents ($A \rightarrow B$).
