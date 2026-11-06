"""Evaluation and Benchmark Metrics Endpoint."""

import json
from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.core.config import METRICS_FILE
from backend.app.models.schemas import EvaluationMetricsItem

router = APIRouter(prefix="/api/v1", tags=["Evaluation Metrics"])


@router.get("/metrics", response_model=List[EvaluationMetricsItem])
def get_evaluation_metrics():
    """Returns offline Leave-One-Out Hit-Rate@K and Baseline comparison metrics."""
    if not METRICS_FILE.exists():
        raise HTTPException(
            status_code=503,
            detail="Evaluation metrics not computed. Run run_evaluation.py first.",
        )

    with open(METRICS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    return [EvaluationMetricsItem(**item) for item in data]
