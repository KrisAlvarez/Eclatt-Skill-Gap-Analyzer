"""Pydantic Request and Response Schemas for SkillGap API."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class GapAnalysisRequest(BaseModel):
    role: str = Field(..., description="Target IT role track")
    possessed_skills: List[str] = Field(default_factory=list, description="Skills currently possessed")
    experience_mode: str = Field(default="entry", description="'entry' (Junior market) or 'all' (General market)")
    top_k: int = Field(default=5, ge=1, le=20, description="Max recommendations to return")


class AssociationRule(BaseModel):
    antecedent: List[str]
    consequent: List[str]
    support: float
    confidence: float
    lift: float
    category: str


class GapRecommendation(BaseModel):
    skill: str
    category: str
    confidence: float
    lift: float
    support: float
    evidence_jobs_count: int
    tier: str
    explanation: str


class GapAnalysisResponse(BaseModel):
    role: str
    experience_mode: str
    total_market_jobs: int
    user_skills: List[str]
    recommendations: List[GapRecommendation]
    popular_skills: List[GapRecommendation] = Field(default_factory=list)
    active_rules: List[AssociationRule]
    sub_lattice_fallback_used: bool
    matched_subset: Optional[List[str]] = None
    note: str


class RoleItem(BaseModel):
    role_name: str
    all_postings_count: int
    entry_postings_count: int
    top_1_itemsets: List[Dict[str, Any]]


class RolesResponse(BaseModel):
    roles: List[RoleItem]
    skills_by_category: Dict[str, List[str]]


class EvaluationMetricsItem(BaseModel):
    role: str
    experience_mode: str
    test_transactions_count: int
    eclat_hr_at_3: float
    baseline_hr_at_3: float
    eclat_hr_at_5: float
    baseline_hr_at_5: float
    non_trivial_eclat_hr_at_5: float
    non_trivial_baseline_hr_at_5: float
    lift_over_baseline_pct: float
    evaluation_protocol: str = "train_test_masked_skill"
    train_transactions_count: int = 0
    validation_transactions_count: int = 0
    non_trivial_test_transactions_count: int = 0
    eclat_hr_at_5_ci95: List[float] = Field(default_factory=list)
    baseline_hr_at_5_ci95: List[float] = Field(default_factory=list)
    non_trivial_eclat_hr_at_5_ci95: List[float] = Field(default_factory=list)
    non_trivial_baseline_hr_at_5_ci95: List[float] = Field(default_factory=list)
    rule_based_recommendation_transactions_count: int = 0
    popularity_fallback_transactions_count: int = 0
    production_min_support: float = 0.0
    production_min_confidence: float = 0.0
    production_min_lift: float = 0.0
