"""Build production-compatible rule artifacts and rank their recommendations."""

from itertools import combinations
from typing import Any, Dict, List, Optional, Sequence

from eclat_algorithm.miner import ECLATMiner
from eclat_algorithm.taxonomy import get_category

MIN_SUPPORT_ABSOLUTE_COUNT = 3
MAX_RULES_STORED_PER_MODE = 2000
MAX_RULES_PER_ANTECEDENT = 25
MAX_TOP_ITEMSETS_STORED = 20
MAX_RULE_ANTECEDENT_SIZE = 3
MODE_PARAMETERS = {
    "entry": (0.05, 0.35, 1.15),
    "all": (0.05, 0.35, 1.15),
}


def build_mode_artifact(transactions: List[List[str]], mode: str) -> Dict[str, Any]:
    """Create the same capped, serialized rule data used by production."""
    n = len(transactions)
    if n < 5:
        return {"total_transactions": n, "top_1_itemsets": [], "rules": []}

    min_support, min_confidence, min_lift = MODE_PARAMETERS.get(
        mode, MODE_PARAMETERS["all"]
    )

    miner = ECLATMiner(
        transactions,
        min_support=min_support,
        min_absolute_count=MIN_SUPPORT_ABSOLUTE_COUNT,
        max_itemset_size=4,
    )
    miner.mine()
    rules = miner.generate_rules(
        min_confidence=min_confidence,
        min_lift=min_lift,
    )

    rules_by_antecedent: Dict[tuple[str, ...], List[Dict[str, Any]]] = {}
    for rule in rules:
        key = tuple(rule["antecedent"])
        bucket = rules_by_antecedent.setdefault(key, [])
        if len(bucket) < MAX_RULES_PER_ANTECEDENT:
            bucket.append(rule)
    capped_rules = [rule for bucket in rules_by_antecedent.values() for rule in bucket]
    capped_rules.sort(
        key=lambda rule: -(
            rule["lift"] * rule["confidence"] * max(rule["support"], 1e-9)
        )
    )

    top_1 = []
    for itemset, count in miner.frequent_itemsets.items():
        if len(itemset) == 1:
            skill = next(iter(itemset))
            top_1.append({
                "skill": skill,
                "category": get_category(skill),
                "count": count,
                "support": round(count / n, 4),
            })
    top_1.sort(key=lambda item: -item["count"])

    return {
        "total_transactions": n,
        "top_1_itemsets": top_1[:MAX_TOP_ITEMSETS_STORED],
        "rules": capped_rules[:MAX_RULES_STORED_PER_MODE],
    }


def index_rules(mode_data: Dict[str, Any]) -> Dict[tuple[str, ...], List[Dict[str, Any]]]:
    """Index stored rules by sorted antecedent for repeated recommendations."""
    indexed: Dict[tuple[str, ...], List[Dict[str, Any]]] = {}
    for rule in mode_data.get("rules", []):
        key = tuple(sorted(rule["antecedent"]))
        indexed.setdefault(key, []).append(rule)
    return indexed


def recommend_from_artifact(
    mode_data: Dict[str, Any],
    user_skills: Sequence[str],
    top_k: int = 5,
    rules_by_antecedent: Optional[Dict[tuple[str, ...], List[Dict[str, Any]]]] = None,
) -> Dict[str, Any]:
    """Apply production's exact, subset, and popularity recommendation tiers."""
    user_set = set(user_skills)
    if rules_by_antecedent is None:
        rules_by_antecedent = index_rules(mode_data)
    total_jobs = mode_data.get("total_transactions", 0)
    recommendations: List[Dict[str, Any]] = []
    active_rules: List[Dict[str, Any]] = []
    matched_subset: Optional[List[str]] = None
    sub_lattice_used = False
    tier_note = ""

    exact_matches = [
        rule for rule in rules_by_antecedent.get(tuple(sorted(user_set)), [])
        if rule["consequent"][0] not in user_set
    ]
    if exact_matches:
        tier_note = "A pattern was found for the selected skill combination."
        for rule in exact_matches[:top_k]:
            active_rules.append(rule)
            skill = rule["consequent"][0]
            recommendations.append({
                "skill": skill,
                "category": rule["category"],
                "confidence": rule["confidence"],
                "lift": rule["lift"],
                "support": rule["support"],
                "evidence_jobs_count": rule.get(
                    "joint_count", int(rule["support"] * total_jobs)
                ),
                "tier": "Tier 1: Exact Match",
                "explanation": (
                    f"In this dataset, postings mentioning {rule['antecedent']} also "
                    f"mention {skill} {int(rule['confidence'] * 100)}% of the time "
                    f"(Lift: {rule['lift']}x). This is an observed pattern, not a requirement."
                ),
            })

    if not recommendations and user_set:
        max_subset_size = min(MAX_RULE_ANTECEDENT_SIZE, len(user_set) - 1)
        for subset_size in range(max_subset_size, 0, -1):
            best_subset_rules: List[Dict[str, Any]] = []
            best_subset_support = -1.0
            for subset in combinations(sorted(user_set), subset_size):
                subset_rules = [
                    rule for rule in rules_by_antecedent.get(tuple(subset), [])
                    if rule["consequent"][0] not in user_set
                ]
                if subset_rules:
                    subset_support = max(rule["support"] for rule in subset_rules)
                    if subset_support > best_subset_support:
                        best_subset_support = subset_support
                        best_subset_rules = subset_rules
                        matched_subset = list(subset)

            if best_subset_rules:
                sub_lattice_used = True
                tier_note = (
                    f"No close pattern was found for the complete skill selection. "
                    f"These suggestions match the selected subset {matched_subset}."
                )
                for rule in best_subset_rules[:top_k]:
                    active_rules.append(rule)
                    skill = rule["consequent"][0]
                    recommendations.append({
                        "skill": skill,
                        "category": rule["category"],
                        "confidence": rule["confidence"],
                        "lift": rule["lift"],
                        "support": rule["support"],
                        "evidence_jobs_count": rule.get(
                            "joint_count", int(rule["support"] * total_jobs)
                        ),
                        "tier": "Tier 2: Sub-Lattice Complement",
                        "explanation": (
                            f"In this dataset, {skill} appeared with the selected skills "
                            f"{matched_subset} in {int(rule['confidence'] * 100)}% of "
                            f"matching postings ({rule['lift']}x Lift). This is an "
                            "observed pattern, not a requirement."
                        ),
                    })
                break

    if not recommendations:
        tier_note = (
            "No close skill-combination pattern was found. These are skills frequently "
            "mentioned in the selected role and experience-level postings, offered as ideas to explore."
        )
        for item in mode_data.get("top_1_itemsets", []):
            skill = item["skill"]
            if skill in user_set:
                continue
            support = item["support"]
            recommendations.append({
                "skill": skill,
                "category": item.get("category", get_category(skill)),
                "confidence": support,
                "lift": 1.0,
                "support": support,
                "evidence_jobs_count": item["count"],
                "tier": "Tier 3: Foundational Prior",
                "explanation": (
                    f"Mentioned in {int(support * 100)}% of postings in this dataset "
                    "for the selected role and experience level. This describes the "
                    "sample; it does not establish a requirement."
                ),
            })
            if len(recommendations) >= top_k:
                break

    deduplicated = []
    seen_skills = set()
    for recommendation in recommendations:
        if recommendation["skill"] not in seen_skills:
            seen_skills.add(recommendation["skill"])
            deduplicated.append(recommendation)

    return {
        "recommendations": deduplicated[:top_k],
        "tier_used": deduplicated[0]["tier"] if deduplicated else "Tier 3: Foundational Prior",
        "active_rules": active_rules[:top_k],
        "sub_lattice_fallback_used": sub_lattice_used,
        "matched_subset": matched_subset,
        "note": tier_note,
    }
