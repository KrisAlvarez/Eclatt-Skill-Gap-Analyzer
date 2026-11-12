"""Skill Gap Analysis and Recommendation Controller."""

import json
from typing import Dict, List, Optional, Tuple
from fastapi import APIRouter, HTTPException
from server.app.config import RULES_FILE
from server.app.schemas import (
    GapAnalysisRequest,
    GapAnalysisResponse,
    GapRecommendation,
    AssociationRule,
)
from eclat_algorithm.recommendation import index_rules, recommend_from_artifact
from eclat_algorithm.taxonomy import normalize_skill

router = APIRouter(prefix="/api/v1", tags=["Analysis"])

# In-memory rule cache for sub-millisecond response times
_RULES_CACHE: Optional[Dict[str, any]] = None
_RULE_INDEX_CACHE: Dict[Tuple[str, str], Dict[Tuple[str, ...], List[Dict[str, any]]]] = {}


def get_rules_db() -> Dict[str, any]:
    global _RULES_CACHE
    if _RULES_CACHE is None:
        if not RULES_FILE.exists():
            raise HTTPException(
                status_code=503,
                detail="Rule base not initialized. Run run_mining.py first.",
            )
        with open(RULES_FILE, "r", encoding="utf-8") as f:
            _RULES_CACHE = json.load(f)
    return _RULES_CACHE


@router.post("/analyze", response_model=GapAnalysisResponse)
def analyze_skill_gap(payload: GapAnalysisRequest):
    """Analyzes candidate's possessed skills against ECLAT mined association rules."""
    rules_db = get_rules_db()

    role = payload.role
    if role not in rules_db:
        raise HTTPException(
            status_code=400,
            detail=f"Role '{role}' not found. Supported roles: {list(rules_db.keys())}",
        )

    mode = payload.experience_mode if payload.experience_mode in ["entry", "all"] else "entry"
    mode_data = rules_db[role].get(mode, {})
    total_jobs = mode_data.get("total_transactions", 0)
    user_skills = sorted({
        normalized
        for raw_skill in payload.possessed_skills
        if (normalized := normalize_skill(raw_skill))
    })
    unknown_skills = sorted({
        raw_skill.strip()
        for raw_skill in payload.possessed_skills
        if raw_skill.strip() and not normalize_skill(raw_skill)
    })
    if unknown_skills:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "One or more skills are not in the supported taxonomy.",
                "unknown_skills": unknown_skills,
            },
        )
    index_key = (role, mode)
    rules_by_antecedent = _RULE_INDEX_CACHE.get(index_key)
    if rules_by_antecedent is None:
        rules_by_antecedent = index_rules(mode_data)
        _RULE_INDEX_CACHE[index_key] = rules_by_antecedent
    result = recommend_from_artifact(
        mode_data,
        user_skills,
        payload.top_k,
        rules_by_antecedent,
    )
    excluded_skills = set(user_skills) | {
        item["skill"] for item in result["recommendations"]
    }
    popular_skills = [
        item for item in recommend_from_artifact(mode_data, [], top_k=20)["recommendations"]
        if item["skill"] not in excluded_skills
    ][:payload.top_k]
    return GapAnalysisResponse(
        role=role,
        experience_mode=mode,
        total_market_jobs=total_jobs,
        user_skills=user_skills,
        recommendations=[
            GapRecommendation(**item) for item in result["recommendations"]
        ],
        popular_skills=[GapRecommendation(**item) for item in popular_skills],
        active_rules=[AssociationRule(**item) for item in result["active_rules"]],
        sub_lattice_fallback_used=result["sub_lattice_fallback_used"],
        matched_subset=result["matched_subset"],
        note=result["note"],
    )
