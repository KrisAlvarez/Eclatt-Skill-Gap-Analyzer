"""Evaluation and Benchmark Metrics Endpoint."""

import json
from typing import Any, List
from fastapi import APIRouter, HTTPException
from server.app.config import CV_METRICS_FILE, METRICS_FILE
from server.app.schemas import EvaluationMetricsItem

router = APIRouter(prefix="/api/v1", tags=["Evaluation Metrics"])


@router.get("/metrics", response_model=List[EvaluationMetricsItem])
def get_evaluation_metrics():
    """Return held-out masked-skill metrics and baseline comparisons."""
    if not METRICS_FILE.exists():
        raise HTTPException(
            status_code=503,
            detail="Evaluation metrics not computed. Run run_evaluation.py first.",
        )

    with open(METRICS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    return [EvaluationMetricsItem(**item) for item in data]


@router.get("/metrics/cross-validation")
def get_cross_validation_metrics():
    """Return five-fold masked-skill cross-validation metrics."""
    if not CV_METRICS_FILE.exists():
        raise HTTPException(
            status_code=503,
            detail="Cross-validation metrics not computed. Run run_cross_validation.py first.",
        )
    with open(CV_METRICS_FILE, "r", encoding="utf-8") as f:
        data: List[dict[str, Any]] = json.load(f)

    for item in data:
        target_value = item.get("metrics", {}).get(
            "eclat_category_hr_at_4", {}
        ).get("mean", 0.0)
        item.setdefault("target_metric", "eclat_category_hr_at_4")
        item.setdefault("target_threshold", 0.90)
        item.setdefault("target_achieved", target_value >= item["target_threshold"])
        item.setdefault("target_gap", round(target_value - item["target_threshold"], 4))
    return data
