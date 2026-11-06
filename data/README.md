# Data Layer & Transaction Storage

This directory manages both raw job datasets and sanitized, preprocessed IT transactions for the **SkillGap** ECLAT mining engine.

---

## Directory Layout

```
data/
├── raw/                          # Source datasets
│   ├── postings.csv              # Full job postings metadata (title, description, experience level)
│   ├── job_skills.csv            # Legacy raw LinkedIn department mappings
│   └── skills.csv                # Legacy raw abbreviations
├── processed/                    # Cleaned, role-segmented transactions & precomputed rules
│   ├── clean_transactions.json   # Validated IT transactions with canonical skills (>= 3 skills)
│   ├── clean_summary.json        # Role & seniority segment counts
│   ├── rules.json                # Precomputed ECLAT association rules (Render production cache)
│   └── evaluation_metrics.json   # Offline Leave-One-Out Hit-Rate@K validation benchmarks
└── README.md
```

---

## Preprocessing & Data Rectification Protocol

1. **Extraction**: Raw job descriptions in `postings.csv` are parsed using a curated taxonomy of ~300 technical IT competencies (`backend/app/core/taxonomy.py`).
2. **Hybrid Role Classification**: Positions are categorized into **Backend Developer**, **Frontend Developer**, and **Data Analyst** via a hybrid title + technology stack matcher, eliminating title ambiguity and resolving data sparsity.
3. **Multi-Signal Junior Filtering**: Positions are tagged as `entry` using both explicit experience level metadata and title/description junior keyword patterns.
4. **Density Filtering**: Transactions with fewer than 3 verified technical skills are pruned to guarantee valid multi-item rule antecedents and consequents.
