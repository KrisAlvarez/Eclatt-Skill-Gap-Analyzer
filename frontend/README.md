# 🎨 The Frontend (`frontend`)

Single-page application built with **React** and **Vite**, delivering an interactive interface for skill gap analysis, association rule inspection, seniority-filtered market exploration, and academic evaluation metrics.

---

## 📁 Module Organization

```
frontend/
├── public/                 # Static assets (favicons, manifest)
├── src/
│   ├── api/
│   │   └── client.js       # API client connecting to the FastAPI Server
│   ├── assets/             # Global stylesheets and icons
│   ├── components/         # Reusable UI widgets:
│   │   ├── Navbar.jsx              # Navigation header with system status badge
│   │   ├── RoleSelector.jsx        # Track switcher (Backend, Frontend, Data Analyst)
│   │   ├── SkillSelector.jsx       # Category-grouped multi-select skill chips
│   │   ├── AnalysisResults.jsx     # Recommended skills, Lift/Confidence badges, explanations
│   │   ├── EvaluationDashboard.jsx # Hit-Rate@K vs Naive Baseline benchmark visualizer
│   │   └── DefenseModal.jsx        # Defense Q&A and loophole resolution modal
│   ├── App.jsx             # Root layout & reactive state orchestrator
│   ├── index.css           # Tailwind / custom CSS design system
│   └── main.jsx            # React 18 DOM mount point
├── package.json            # Node.js dependencies & scripts
├── vite.config.js          # Vite configuration
└── README.md               # This document
```

---

## 💻 Running the Frontend Locally

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

## 🔗 Connecting to the Server

The frontend reads the server base URL from `VITE_API_BASE_URL`:
- **Local Development:** Default fallback is `http://localhost:8000`
- **Production (Vercel):** Set environment variable `VITE_API_BASE_URL=https://<your-render-app>.onrender.com`
