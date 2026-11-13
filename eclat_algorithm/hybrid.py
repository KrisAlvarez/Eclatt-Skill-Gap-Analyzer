"""Serving implementation of the frozen two-hidden-skill hybrid ranker."""
import json
from collections import Counter
from functools import lru_cache
from itertools import combinations
from pathlib import Path

from eclat_algorithm.assessment import fit_similarity, rank_similarity
from eclat_algorithm.recommendation import build_mode_artifact, index_rules
from eclat_algorithm.taxonomy import get_category

BASE = Path(__file__).resolve().parent.parent
TRANSACTIONS_FILE = BASE / "data" / "processed" / "clean_transactions.json"
PROTOCOL_FILE = BASE / "data" / "processed" / "assessment_protocol.json"


@lru_cache(maxsize=6)
def _load_hybrid_mode(role, mode):
    data = json.loads(TRANSACTIONS_FILE.read_text(encoding="utf-8"))
    transactions = [list(dict.fromkeys(row["skills"])) for row in data[role][mode]]
    protocol = json.loads(PROTOCOL_FILE.read_text(encoding="utf-8"))
    settings = protocol["model"]
    artifact = build_mode_artifact(
        transactions,
        mode,
        parameters=(settings["support"], settings["confidence"], settings["lift"]),
        max_rules=settings["max_rules"],
        max_rules_per_antecedent=settings["max_rules_per_antecedent"],
    )
    frequencies, similarity = fit_similarity(transactions)
    rules = index_rules(artifact)
    return artifact, frequencies, similarity, rules


def recommend_hybrid(role, mode, inputs, top_k=10):
    """Rank suggestions using frozen rule/similarity/popularity weights."""
    artifact, frequencies, similarity, rule_index = _load_hybrid_mode(role, mode)
    ranked = rank_similarity(rule_index, frequencies, similarity, inputs, top_k=top_k)
    rules_by_skill = {}
    for size in range(1, min(len(set(inputs)), 3) + 1):
        for subset in combinations(sorted(set(inputs)), size):
            for rule in rule_index.get(subset, []):
                skill = rule["consequent"][0]
                if skill not in inputs:
                    previous = rules_by_skill.get(skill)
                    if previous is None or rule["support"] > previous["support"]:
                        rules_by_skill[skill] = rule

    recommendations = []
    active_rules = []
    total = artifact["total_transactions"]
    for skill in ranked["balanced_evidence"]:
        rule = rules_by_skill.get(skill)
        support = rule["support"] if rule else frequencies[skill] / max(total, 1)
        confidence = rule["confidence"] if rule else support
        lift = rule["lift"] if rule else 1.0
        evidence_count = rule.get("joint_count", round(support * total)) if rule else frequencies[skill]
        recommendations.append({
            "skill": skill,
            "category": get_category(skill),
            "confidence": confidence,
            "lift": lift,
            "support": support,
            "evidence_jobs_count": evidence_count,
            "tier": "Hybrid evidence ranking",
            "explanation": (
                "Ranked from a blend of skill co-occurrence rules, similarity to your selected skills, "
                "and frequency in this posting group. These are observed posting patterns, not requirements."
            ),
        })
        if rule:
            active_rules.append(rule)

    excluded = set(inputs) | {item["skill"] for item in recommendations}
    popular = sorted(
        (skill for skill in frequencies if skill not in excluded),
        key=lambda skill: (-frequencies[skill], skill),
    )[:top_k]
    popular_items = [{
        "skill": skill,
        "category": get_category(skill),
        "confidence": frequencies[skill] / max(total, 1),
        "lift": 1.0,
        "support": frequencies[skill] / max(total, 1),
        "evidence_jobs_count": frequencies[skill],
        "tier": "Popularity comparison",
        "explanation": "Frequently mentioned in this posting group; this is an observed pattern, not a requirement.",
    } for skill in popular]
    return {
        "recommendations": recommendations,
        "popular_skills": popular_items,
        "active_rules": active_rules,
        "sub_lattice_fallback_used": False,
        "matched_subset": None,
        "note": "Suggestions blend posting co-occurrence, skill similarity, and popularity. They are exploratory patterns, not a checklist of requirements.",
    }
