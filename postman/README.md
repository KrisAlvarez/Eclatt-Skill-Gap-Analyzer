# 📮 Postman Workspace

API testing workspace for the **Eclatt Skill Gap Analyzer** FastAPI server.

---

## 📂 Folder Structure

```
postman/
├── collections/     # Saved Postman collections (.json) for endpoint groups
├── documents/       # Postman documentation exports
├── environments/    # Environment variable sets (local, production)
├── flows/           # Postman Flows for multi-step API workflows
├── globals/
│   └── workspace.globals.yaml   # Shared global variables
├── mocks/           # Mock server configurations
└── specs/           # OpenAPI / Swagger spec exports
```

---

## 🔗 API Endpoints to Test

| Method | Endpoint                | Description                            |
|--------|-------------------------|----------------------------------------|
| GET    | `/health`               | Server health check                    |
| GET    | `/api/v1/roles`         | List all supported roles + skills      |
| POST   | `/api/v1/analyze`       | Skill gap analysis (3-tier ECLAT)      |
| GET    | `/api/v1/metrics`       | Evaluation metrics (Hit-Rate@K)        |

---

## 🚀 Quick Start

1. Import collections from `collections/` into Postman
2. Set environment to `environments/local.json` for `http://localhost:8000`
3. Set environment to `environments/production.json` for the Render URL

> **Global variables** are stored in `globals/workspace.globals.yaml` and sync automatically with the Postman workspace.
