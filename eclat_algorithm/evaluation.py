"""Train/test masked-skill evaluation using the production recommendation path."""

import json
import random
from math import sqrt
from pathlib import Path
from typing import Any, Dict, List, Sequence, Tuple, TypeVar

from eclat_algorithm.recommendation import (
    MODE_PARAMETERS,
    build_mode_artifact,
    index_rules,
    recommend_from_artifact,
)

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TRANSACTIONS_FILE = PROCESSED_DIR / "clean_transactions.json"
METRICS_FILE = PROCESSED_DIR / "evaluation_metrics.json"
MAX_TEST_TRANSACTIONS = 10000
NON_TRIVIAL_FREQUENCY_LIMIT = 0.30
Record = TypeVar("Record")


def _split(records: Sequence[Record], seed: int) -> Tuple[List[Record], List[Record]]:
    shuffled = list(records)
    random.Random(seed).shuffle(shuffled)
    train_end = int(len(shuffled) * 0.80)
    return shuffled[:train_end], shuffled[train_end:]


def _ranked_popularity(
    transactions: Sequence[List[str]],
    excluded: set[str],
) -> List[str]:
    counts: Dict[str, int] = {}
    for transaction in transactions:
        for skill in set(transaction):
            counts[skill] = counts.get(skill, 0) + 1
    return [
        skill
        for skill, _ in sorted(counts.items(), key=lambda item: (-item[1], item[0]))
        if skill not in excluded
    ]


def _is_non_trivial(skill: str, training_counts: Dict[str, int], training_size: int) -> bool:
    frequency = training_counts.get(skill, 0) / max(training_size, 1)
    return frequency < NON_TRIVIAL_FREQUENCY_LIMIT


def _masked_hits(
    mode_data: Dict[str, Any],
    transactions: Sequence[List[str]],
    popularity: List[str],
    training_transactions: Sequence[List[str]],
    seed: int,
) -> Dict[str, int]:
    rng = random.Random(seed)
    result = {
        "total": 0,
        "eclat_at_3": 0,
        "eclat_at_5": 0,
        "baseline_at_3": 0,
        "baseline_at_5": 0,
        "non_trivial_total": 0,
        "non_trivial_eclat_at_5": 0,
        "non_trivial_baseline_at_5": 0,
        "rule_based_recommendations": 0,
        "popularity_fallback_recommendations": 0,
    }
    training_counts: Dict[str, int] = {}
    for transaction in training_transactions:
        for skill in set(transaction):
            training_counts[skill] = training_counts.get(skill, 0) + 1
    rules_by_antecedent = index_rules(mode_data)

    for transaction in transactions:
        if len(transaction) < 2:
            continue
        masked = rng.choice(transaction)
        input_skills = [skill for skill in transaction if skill != masked]
        recommendation_result = recommend_from_artifact(
            mode_data,
            input_skills,
            top_k=5,
            rules_by_antecedent=rules_by_antecedent,
        )
        eclat_skills = [
            item["skill"] for item in recommendation_result["recommendations"]
        ]
        baseline = [skill for skill in popularity if skill not in input_skills][:5]
        result["total"] += 1
        result["eclat_at_3"] += int(masked in eclat_skills[:3])
        result["eclat_at_5"] += int(masked in eclat_skills[:5])
        result["baseline_at_3"] += int(masked in baseline[:3])
        result["baseline_at_5"] += int(masked in baseline[:5])

        if recommendation_result["tier_used"].startswith(("Tier 1", "Tier 2")):
            result["rule_based_recommendations"] += 1
        else:
            result["popularity_fallback_recommendations"] += 1

        if _is_non_trivial(masked, training_counts, len(training_transactions)):
            result["non_trivial_total"] += 1
            result["non_trivial_eclat_at_5"] += int(masked in eclat_skills[:5])
            result["non_trivial_baseline_at_5"] += int(masked in baseline[:5])
    return result


def _rate(hits: int, total: int) -> float:
    return round(hits / total, 4) if total else 0.0


def _wilson(hits: int, total: int) -> List[float]:
    if not total:
        return [0.0, 0.0]
    p = hits / total
    z = 1.96
    denominator = 1 + z * z / total
    centre = (p + z * z / (2 * total)) / denominator
    margin = sqrt((p * (1 - p) / total) + (z * z / (4 * total * total)))
    margin *= z / denominator
    return [round(max(0.0, centre - margin), 4), round(min(1.0, centre + margin), 4)]


def evaluate_role_mode(
    records: List[Dict[str, Any]],
    role: str,
    mode: str,
    seed: int = 42,
) -> Dict[str, Any]:
    transactions = [
        list(dict.fromkeys(record["skills"]))
        for record in records
        if len(set(record["skills"])) >= 3
    ]
    train, test = _split(transactions, seed)
    production_support, production_confidence, production_lift = MODE_PARAMETERS.get(
        mode, MODE_PARAMETERS["all"]
    )

    if len(train) < 20 or not test:
        return {
            "role": role,
            "experience_mode": mode,
            "evaluation_protocol": "train_test_masked_skill",
            "train_transactions_count": len(train),
            "validation_transactions_count": 0,
            "test_transactions_count": 0,
            "production_min_support": production_support,
            "production_min_confidence": production_confidence,
            "production_min_lift": production_lift,
            "eclat_hr_at_3": 0.0,
            "baseline_hr_at_3": 0.0,
            "eclat_hr_at_5": 0.0,
            "baseline_hr_at_5": 0.0,
            "non_trivial_eclat_hr_at_5": 0.0,
            "non_trivial_baseline_hr_at_5": 0.0,
            "non_trivial_test_transactions_count": 0,
            "non_trivial_eclat_hr_at_5_ci95": [0.0, 0.0],
            "non_trivial_baseline_hr_at_5_ci95": [0.0, 0.0],
            "rule_based_recommendation_transactions_count": 0,
            "popularity_fallback_transactions_count": 0,
            "lift_over_baseline_pct": 0.0,
            "eclat_hr_at_5_ci95": [0.0, 0.0],
            "baseline_hr_at_5_ci95": [0.0, 0.0],
        }

    test_sample = test[:MAX_TEST_TRANSACTIONS]
    mode_data = build_mode_artifact(train, mode)
    popularity = _ranked_popularity(train, set())
    result = _masked_hits(mode_data, test_sample, popularity, train, seed + 2)
    total = result["total"]
    non_trivial_total = result["non_trivial_total"]
    eclat_hr_5 = _rate(result["eclat_at_5"], total)
    baseline_hr_5 = _rate(result["baseline_at_5"], total)

    return {
        "role": role,
        "experience_mode": mode,
        "evaluation_protocol": "train_test_masked_skill",
        "train_transactions_count": len(train),
        "validation_transactions_count": 0,
        "test_transactions_count": total,
        "production_min_support": production_support,
        "production_min_confidence": production_confidence,
        "production_min_lift": production_lift,
        "eclat_hr_at_3": _rate(result["eclat_at_3"], total),
        "baseline_hr_at_3": _rate(result["baseline_at_3"], total),
        "eclat_hr_at_5": eclat_hr_5,
        "baseline_hr_at_5": baseline_hr_5,
        "non_trivial_eclat_hr_at_5": _rate(
            result["non_trivial_eclat_at_5"], non_trivial_total
        ),
        "non_trivial_baseline_hr_at_5": _rate(
            result["non_trivial_baseline_at_5"], non_trivial_total
        ),
        "non_trivial_test_transactions_count": non_trivial_total,
        "non_trivial_eclat_hr_at_5_ci95": _wilson(
            result["non_trivial_eclat_at_5"], non_trivial_total
        ),
        "non_trivial_baseline_hr_at_5_ci95": _wilson(
            result["non_trivial_baseline_at_5"], non_trivial_total
        ),
        "rule_based_recommendation_transactions_count": result[
            "rule_based_recommendations"
        ],
        "popularity_fallback_transactions_count": result[
            "popularity_fallback_recommendations"
        ],
        "lift_over_baseline_pct": round(
            ((eclat_hr_5 - baseline_hr_5) / baseline_hr_5) * 100,
            1,
        ) if baseline_hr_5 else 0.0,
        "eclat_hr_at_5_ci95": _wilson(result["eclat_at_5"], total),
        "baseline_hr_at_5_ci95": _wilson(result["baseline_at_5"], total),
    }


def run_evaluation() -> List[Dict[str, Any]]:
    if not TRANSACTIONS_FILE.exists():
        raise FileNotFoundError(f"Missing {TRANSACTIONS_FILE}")

    with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    results = []
    for role, modes in data.items():
        for mode in ("entry", "all"):
            result = evaluate_role_mode(modes.get(mode, []), role, mode)
            results.append(result)
            print(
                f"[{role} - {mode.upper()}] "
                f"ECLAT HR@5={result['eclat_hr_at_5']:.1%}, "
                f"baseline HR@5={result['baseline_hr_at_5']:.1%}"
            )

    with open(METRICS_FILE, "w", encoding="utf-8") as file:
        json.dump(results, file, indent=2)
    return results


if __name__ == "__main__":
    run_evaluation()
