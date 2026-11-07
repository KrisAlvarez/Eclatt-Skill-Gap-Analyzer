# 🖥️ The Frontend (`frontend/`)

Single-page application built with **React** and **Vite**, delivering an interactive interface for skill gap analysis, association rule inspection, seniority-filtered market exploration, and academic evaluation metrics.

---

## 📂 Module Organization

```
frontend/
├── public/                   # Static assets (favicons, manifest)
├── src/
│   ├── api/
│   │   └── client.js         # API client connecting to the FastAPI server
│   ├── assets/               # Global stylesheets and icons
│   ├── pages/                # Full-page tab views (routed by activeTab in App.jsx):
│   │   ├── HomeTab.jsx           # Landing / hero page with CTAs
│   │   ├── ExplorerTab.jsx       # Main skill gap analysis explorer
│   │   ├── RoadmapsTab.jsx       # Learning roadmap builder
│   │   ├── HowToUseTab.jsx       # Guide / walkthrough page
│   │   └── AboutTab.jsx          # Project info and academic context
│   ├── components/           # Reusable UI widgets:
│   │   ├── Navbar.jsx            # Navigation header with system status badge
│   │   ├── RoleSelector.jsx      # Track switcher (Backend, Frontend, Data Analyst)
│   │   ├── SkillSelector.jsx     # Category-grouped multi-select skill chips
│   │   ├── AnalysisResults.jsx   # Recommended skills, Lift/Confidence badges
│   │   ├── EvaluationDashboard.jsx  # Hit-Rate@K vs Naive Baseline benchmark
│   │   ├── LearningRoadmap.jsx   # Skill roadmap timeline renderer
│   │   ├── TechnicalDeepDive.jsx # Algorithm explainer panel
│   │   └── DefenseModal.jsx      # Defense Q&A and loophole resolution modal
│   ├── utils/                # Shared utility functions (helpers, formatters)
│   ├── App.jsx               # Root layout & reactive state orchestrator
│   ├── index.css             # Tailwind / custom CSS design system
│   └── main.jsx              # React 18 DOM mount point
├── .env                      # Local dev env (VITE_API_BASE_URL=http://localhost:8000)
├── .env.production           # Production env (VITE_API_BASE_URL=Render URL)
├── index.html                # HTML entry point
├── package.json              # Node.js dependencies & scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── README.md                 # This document
```

> **Note:** `vercel.json` lives at the **project root** (not inside `frontend/`) and sets `"rootDirectory": "frontend"` for Vercel deployments.

---

## 🏗️ Page vs Component Split

| Type | Location | What lives here |
|------|----------|-----------------|
| **Pages** | `src/pages/` | Full-screen tab views swapped by `App.jsx` based on `activeTab` state |
| **Components** | `src/components/` | Reusable UI pieces shared across pages |

---

## 🚀 Running the Frontend Locally

```bash
# Navigate to frontend/
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```

The app will run at: `http://localhost:5173`

---

## 🔌 Connecting to the Server

The frontend reads the server base URL from `VITE_API_BASE_URL`:
- **Local Development (`.env`):** `http://localhost:8000` → hits your local `uvicorn` server
- **Production (`.env.production`):** Render cloud URL → used by Vercel on deploy

```bash
# Start the backend locally first:
uvicorn server.app.main:app --reload --port 8000
```
