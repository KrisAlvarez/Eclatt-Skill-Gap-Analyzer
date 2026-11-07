"""Backward-compatibility shim for backend.app.models.schemas.

Redirects directly to server.app.schemas.models.
"""

from server.app.schemas.models import (
    GapAnalysisRequest,
    GapAnalysisResponse,
    GapRecommendation,
    AssociationRule,
    RoleItem,
    RolesResponse,
    EvaluationMetricsItem,
)

__all__ = [
    "GapAnalysisRequest",
    "GapAnalysisResponse",
    "GapRecommendation",
    "AssociationRule",
    "RoleItem",
    "RolesResponse",
    "EvaluationMetricsItem",
]
