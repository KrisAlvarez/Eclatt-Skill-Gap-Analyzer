"""SkillGap FastAPI REST Service.

Production backend serving ECLAT association rules, cold-start fallback recommendations,
and empirical evaluation metrics.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.config import settings
from server.app.routes import analyze, roles, metrics

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="ECLAT-Based IT Skill Co-occurrence Pattern Mining and Gap Analysis System",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for local Vite development and production Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route controllers
app.include_router(roles.router)
app.include_router(analyze.router)
app.include_router(metrics.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Healthcheck endpoint for Render / cloud monitoring."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.app.main:app", host="0.0.0.0", port=8000, reload=True)
