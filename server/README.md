# 🖥️ The Server Side (`server`)

Production REST API service built with **FastAPI** for serving ECLAT association rules, 3-tier skill recommendations, role catalogs, and empirical validation benchmarks.

---

## 📁 Module Organization

```
server/
├── app/
│   ├── __init__.py         # Package root
│   ├── main.py             # FastAPI entry point, CORS middleware, route mounting
│   ├── config.py           # Server paths, thresholds, and Pydantic settings
│   ├── schemas/            # Pydantic Request & Response models
│   │   ├── __init__.py
│   │   └── models.py       # GapAnalysisRequest, GapRecommendation, RolesResponse, etc.
│   └── routes/             # API Endpoints
│       ├── __init__.py
│       ├── analyze.py      # POST /api/v1/analyze (3-Tier recommendation engine)
│       ├── roles.py        # GET /api/v1/roles (Roles & taxonomy catalog)
│       └── metrics.py      # GET /api/v1/metrics (Hit-Rate@K benchmark metrics)
├── requirements.txt        # Server dependencies
└── README.md               # This document
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Cloud healthcheck endpoint (used to detect Render cold starts) |
| `GET` | `/docs` | Interactive Swagger API documentation |
| `GET` | `/api/v1/roles` | Retrieves all 3 IT tracks, posting counts, and skills grouped by category |
| `POST` | `/api/v1/analyze` | Executes 3-tier gap analysis given target role and user's possessed skills |
| `GET` | `/api/v1/metrics` | Returns masked-skill Hit-Rate@K metrics vs naive baseline |

---

## 🏃 Running the Server Locally

```bash
# Run server using Uvicorn with hot reload on port 8000
uvicorn server.app.main:app --reload --port 8000
```

Once running:
- **API Base:** `http://localhost:8000`
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc UI:** `http://localhost:8000/redoc`

---

## ☁️ Cloud Deployment (Render)

This service is preconfigured for deployment on Render's free tier via [`render.yaml`](../render.yaml):
- **Start Command:** `uvicorn server.app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/health`
- **Memory Footprint:** Precomputed `rules.json` uses <40 MB RAM (well within the 512 MB limit).
