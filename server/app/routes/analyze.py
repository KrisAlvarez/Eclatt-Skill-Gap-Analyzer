"""Skill Gap Analysis and Recommendation Controller."""

import json
from itertools import combinations
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from server.app.config import RULES_FILE
from server.app.schemas import (
    GapAnalysisRequest,
    GapAnalysisResponse,
    GapRecommendation,
    AssociationRule,
)
from eclat_algorithm.taxonomy import get_category

router = APIRouter(prefix="/api/v1", tags=["Analysis"])

# In-memory rule cache for sub-millisecond response times
_RULES_CACHE: Optional[Dict[str, any]] = None


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
    all_rules = mode_data.get("rules", [])
    top_1_itemsets = mode_data.get("top_1_itemsets", [])

    user_skills = sorted(list(set(payload.possessed_skills)))
    user_set = set(user_skills)
    top_k = payload.top_k

    recommendations: List[GapRecommendation] = []
    active_rules: List[AssociationRule] = []
    matched_subset: Optional[List[str]] = None
    sub_lattice_used = False
    tier_note = ""

    # Tier 1: Exact Antecedent Match
    exact_matches = [
        r for r in all_rules
        if set(r["antecedent"]) == user_set and r["consequent"][0] not in user_set
    ]

    if exact_matches:
        tier_note = "Exact rule match found for your complete technology stack."
        for r in exact_matches[:top_k]:
            active_rules.append(AssociationRule(**r))
            skill = r["consequent"][0]
            recommendations.append(
                GapRecommendation(
                    skill=skill,
                    category=r["category"],
                    confidence=r["confidence"],
                    lift=r["lift"],
                    support=r["support"],
                    evidence_jobs_count=r.get("joint_count", int(r["support"] * total_jobs)),
                    tier="Tier 1: Exact Match",
                    explanation=f"Direct conditional rule: Postings requiring {r['antecedent']} also require {skill} {int(r['confidence']*100)}% of the time (Lift: {r['lift']}x).",
                )
            )

    # Tier 2: Sub-Lattice Step-Down
    if not recommendations and len(user_set) > 0:
        for sub_len in range(len(user_set) - 1, 0, -1):
            best_sub_rules = []
            best_sub_support = -1

            for sub in combinations(sorted(user_set), sub_len):
                sub_fset = set(sub)
                sub_matches = [
                    r for r in all_rules
                    if set(r["antecedent"]) == sub_fset and r["consequent"][0] not in user_set
                ]
                if sub_matches:
                    sub_supp = max(r["support"] for r in sub_matches)
                    if sub_supp > best_sub_support:
                        best_sub_support = sub_supp
                        best_sub_rules = sub_matches
                        matched_subset = list(sub)

            if best_sub_rules:
                sub_lattice_used = True
                tier_note = f"No exact match for all {len(user_set)} skills. Recommendations derived from strongest sub-lattice: {matched_subset}."
                for r in best_sub_rules[:top_k]:
                    active_rules.append(AssociationRule(**r))
                    skill = r["consequent"][0]
                    recommendations.append(
                        GapRecommendation(
                            skill=skill,
                            category=r["category"],
                            confidence=r["confidence"],
                            lift=r["lift"],
                            support=r["support"],
                            evidence_jobs_count=r.get("joint_count", int(r["support"] * total_jobs)),
                            tier="Tier 2: Sub-Lattice Complement",
                            explanation=f"Associated with subset {matched_subset} ({int(r['confidence']*100)}% confidence, {r['lift']}x Lift).",
                        )
                    )
                break

    # Tier 3: Unconditional 1-Itemset Prior (Cold-Start)
    if not recommendations:
        sub_lattice_used = False
        tier_note = "Cold-start fallback: Recommending foundational technical competencies for this role."
        for item in top_1_itemsets:
            skill = item["skill"]
            if skill not in user_set:
                supp = item["support"]
                count = item["count"]
                recommendations.append(
                    GapRecommendation(
                        skill=skill,
                        category=item.get("category", get_category(skill)),
                        confidence=supp,
                        lift=1.0,
                        support=supp,
                        evidence_jobs_count=count,
                        tier="Tier 3: Foundational Prior",
                        explanation=f"Core industry requirement: mentioned in {int(supp * 100)}% of postings for {role} ({mode.upper()}).",
                    )
                )
            if len(recommendations) >= top_k:
                break

    # Deduplicate while preserving rank
    deduped = []
    seen = set()
    for rec in recommendations:
        if rec.skill not in seen:
            seen.add(rec.skill)
            deduped.append(rec)

    return GapAnalysisResponse(
        role=role,
        experience_mode=mode,
        total_market_jobs=total_jobs,
        user_skills=user_skills,
        recommendations=deduped[:top_k],
        active_rules=active_rules[:top_k],
        sub_lattice_fallback_used=sub_lattice_used,
        matched_subset=matched_subset,
        note=tier_note,
    )
