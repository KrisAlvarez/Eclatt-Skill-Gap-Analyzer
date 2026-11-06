# SkillGap Frontend

Single-page application (React / Vite) for interactive skill gap analysis, association rule inspection, and career track visualization.

## Folder Structure

```
frontend/
├── public/                 # Static assets, favicons, robots.txt
│   └── .gitkeep
├── src/
│   ├── api/                # API client definitions, Axios/fetch connectors
│   │   └── .gitkeep
│   ├── assets/             # Images, SVGs, global stylesheets
│   │   └── .gitkeep
│   ├── components/         # Reusable UI widgets (SkillSelector, RuleCard, MetricBadge)
│   │   └── .gitkeep
│   └── pages/              # High-level route views (Dashboard, Analysis, Evaluation, Benchmark)
│       └── .gitkeep
└── README.md               # Frontend documentation
```

## Features

- **Interactive Role Selector**: Choose between Backend Developer, Frontend Developer, and Data Analyst.
- **Experience Level Filter**: Toggle between "Entry & Junior Market" vs "General Market" to counteract seniority bias.
- **Live Skill Co-occurrence Explorer**: Select possessed skills to view conditional recommendations sorted by Lift and Confidence.
- **Model Evaluation Dashboard**: Real-time display of Leave-One-Out Hit-Rate@K metrics compared against naive frequency baselines.
