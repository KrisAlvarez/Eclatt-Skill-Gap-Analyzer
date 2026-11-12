"""Validation-tuned train/validation/test masked-skill evaluation."""

import json
import random
from math import sqrt
from pathlib import Path
from statistics import mean, stdev
from typing import Any, Dict, List, Sequence, Tuple

from eclat_algorithm.recommendation import (
    MODE_PARAMETERS,
    build_mode_artifact,
    index_rules,
    recommend_from_artifact,
)
from eclat_algorithm.taxonomy import get_category

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TRANSACTIONS_FILE = PROCESSED_DIR / "clean_transactions.json"
METRICS_FILE = PROCESSED_DIR / "evaluation_metrics.json"
CV_METRICS_FILE = PROCESSED_DIR / "cross_validation_metrics.json"
MAX_TEST_TRANSACTIONS = 10000
NON_TRIVIAL_FREQUENCY_LIMIT = 0.30
TARGET_METRIC = "eclat_category_hr_at_4"
TARGET_THRESHOLD = 0.90
PARAMETER_GRID = (
    (0.03, 0.25, 1.05),
    (0.05, 0.30, 1.10),
    (0.05, 0.35, 1.15),
    (0.08, 0.30, 1.10),
)


def _split(
    records: Sequence[List[str]], seed: int
) -> Tuple[List[List[str]], List[List[str]], List[List[str]]]:
    shuffled = list(records)
    random.Random(seed).shuffle(shuffled)
    train_end = int(len(shuffled) * 0.60)
    validation_end = int(len(shuffled) * 0.80)
    return (
        shuffled[:train_end],
        shuffled[train_end:validation_end],
        shuffled[validation_end:],
    )


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
        "eclat_at_4": 0,
        "eclat_at_5": 0,
        "eclat_at_10": 0,
        "eclat_at_20": 0,
        "eclat_category_at_3": 0,
        "eclat_category_at_4": 0,
        "eclat_category_at_5": 0,
        "eclat_category_at_10": 0,
        "eclat_category_at_20": 0,
        "baseline_at_3": 0,
        "baseline_at_5": 0,
        "baseline_at_10": 0,
        "baseline_at_20": 0,
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
            top_k=20,
            rules_by_antecedent=rules_by_antecedent,
        )
        eclat_skills = [
            item["skill"] for item in recommendation_result["recommendations"]
        ]
        hidden_category = get_category(masked)
        baseline = [skill for skill in popularity if skill not in input_skills][:20]
        result["total"] += 1
        result["eclat_at_3"] += int(masked in eclat_skills[:3])
        result["eclat_at_4"] += int(masked in eclat_skills[:4])
        result["eclat_at_5"] += int(masked in eclat_skills[:5])
        result["eclat_at_10"] += int(masked in eclat_skills[:10])
        result["eclat_at_20"] += int(masked in eclat_skills[:20])
        result["eclat_category_at_3"] += int(
            any(get_category(skill) == hidden_category for skill in eclat_skills[:3])
        )
        result["eclat_category_at_4"] += int(
            any(get_category(skill) == hidden_category for skill in eclat_skills[:4])
        )
        result["eclat_category_at_5"] += int(
            any(get_category(skill) == hidden_category for skill in eclat_skills[:5])
        )
        result["eclat_category_at_10"] += int(
            any(get_category(skill) == hidden_category for skill in eclat_skills[:10])
        )
        result["eclat_category_at_20"] += int(
            any(get_category(skill) == hidden_category for skill in eclat_skills[:20])
        )
        result["baseline_at_3"] += int(masked in baseline[:3])
        result["baseline_at_5"] += int(masked in baseline[:5])
        result["baseline_at_10"] += int(masked in baseline[:10])
        result["baseline_at_20"] += int(masked in baseline[:20])

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


def _target_summary(metric_value: float) -> Dict[str, Any]:
    return {
        "target_metric": TARGET_METRIC,
        "target_threshold": TARGET_THRESHOLD,
        "target_achieved": metric_value >= TARGET_THRESHOLD,
        "target_gap": round(metric_value - TARGET_THRESHOLD, 4),
    }


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
    train, validation, test = _split(transactions, seed)
    production_support, production_confidence, production_lift = MODE_PARAMETERS.get(
        mode, MODE_PARAMETERS["all"]
    )

    if len(train) < 20 or not test:
        result_payload = {
            "role": role,
            "experience_mode": mode,
            "evaluation_protocol": "train_validation_test_masked_skill",
            "train_transactions_count": len(train),
            "validation_transactions_count": len(validation),
            "test_transactions_count": 0,
            "production_min_support": production_support,
            "production_min_confidence": production_confidence,
            "production_min_lift": production_lift,
            "eclat_hr_at_3": 0.0,
            "baseline_hr_at_3": 0.0,
            "eclat_hr_at_5": 0.0,
            "baseline_hr_at_5": 0.0,
            "eclat_hr_at_10": 0.0,
            "baseline_hr_at_10": 0.0,
            "eclat_hr_at_20": 0.0,
            "baseline_hr_at_20": 0.0,
            "eclat_category_hr_at_3": 0.0,
            "eclat_category_hr_at_5": 0.0,
            "eclat_category_hr_at_10": 0.0,
            "eclat_category_hr_at_20": 0.0,
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
        result_payload.update(_target_summary(0.0))
        return result_payload

    validation_sample = validation[:MAX_TEST_TRANSACTIONS]
    best_parameters = PARAMETER_GRID[0]
    best_score = -1.0
    validation_popularity = _ranked_popularity(train, set())
    for parameters in PARAMETER_GRID:
        candidate = build_mode_artifact(train, mode, parameters)
        validation_result = _masked_hits(
            candidate,
            validation_sample,
            validation_popularity,
            train,
            seed + 1,
        )
        score = _rate(validation_result["eclat_at_5"], validation_result["total"])
        if score > best_score:
            best_score = score
            best_parameters = parameters

    test_sample = test[:MAX_TEST_TRANSACTIONS]
    mode_data = build_mode_artifact(train, mode, best_parameters)
    popularity = _ranked_popularity(train, set())
    result = _masked_hits(mode_data, test_sample, popularity, train, seed + 2)
    total = result["total"]
    non_trivial_total = result["non_trivial_total"]
    eclat_hr_5 = _rate(result["eclat_at_5"], total)
    baseline_hr_5 = _rate(result["baseline_at_5"], total)

    result_payload = {
        "role": role,
        "experience_mode": mode,
        "evaluation_protocol": "train_validation_test_masked_skill",
        "train_transactions_count": len(train),
        "validation_transactions_count": len(validation),
        "test_transactions_count": total,
        "production_min_support": production_support,
        "production_min_confidence": production_confidence,
        "production_min_lift": production_lift,
        "eclat_hr_at_3": _rate(result["eclat_at_3"], total),
        "eclat_hr_at_4": _rate(result["eclat_at_4"], total),
        "baseline_hr_at_3": _rate(result["baseline_at_3"], total),
        "eclat_hr_at_5": eclat_hr_5,
        "baseline_hr_at_5": baseline_hr_5,
        "eclat_hr_at_10": _rate(result["eclat_at_10"], total),
        "baseline_hr_at_10": _rate(result["baseline_at_10"], total),
        "eclat_hr_at_20": _rate(result["eclat_at_20"], total),
        "baseline_hr_at_20": _rate(result["baseline_at_20"], total),
        "eclat_category_hr_at_3": _rate(result["eclat_category_at_3"], total),
        "eclat_category_hr_at_4": _rate(result["eclat_category_at_4"], total),
        "eclat_category_hr_at_5": _rate(result["eclat_category_at_5"], total),
        "eclat_category_hr_at_10": _rate(result["eclat_category_at_10"], total),
        "eclat_category_hr_at_20": _rate(result["eclat_category_at_20"], total),
        "selected_min_support": best_parameters[0],
        "selected_min_confidence": best_parameters[1],
        "selected_min_lift": best_parameters[2],
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
    result_payload.update(_target_summary(result_payload[TARGET_METRIC]))
    return result_payload


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


def _cross_validation_folds(
    transactions: Sequence[List[str]], folds: int, seed: int
) -> List[Tuple[List[List[str]], List[List[str]]]]:
    shuffled = list(transactions)
    random.Random(seed).shuffle(shuffled)
    if not shuffled or folds < 1:
        return []
    fold_count = min(folds, len(shuffled))
    base_size, remainder = divmod(len(shuffled), fold_count)
    chunks = []
    start = 0
    for fold_number in range(fold_count):
        size = base_size + int(fold_number < remainder)
        chunks.append(shuffled[start : start + size])
        start += size
    return [
        (
            [item for chunk in chunks if chunk is not test_chunk for item in chunk],
            test_chunk,
        )
        for test_chunk in chunks
    ]


def _mean_std(values: List[float]) -> Dict[str, float]:
    return {
        "mean": round(mean(values), 4) if values else 0.0,
        "std": round(stdev(values), 4) if len(values) > 1 else 0.0,
    }


def evaluate_cross_validation(
    records: List[Dict[str, Any]],
    role: str,
    mode: str,
    folds: int = 5,
    seed: int = 42,
) -> Dict[str, Any]:
    transactions = [
        list(dict.fromkeys(record["skills"]))
        for record in records
        if len(set(record["skills"])) >= 3
    ]
    fold_results = []
    for fold_number, (train, test) in enumerate(
        _cross_validation_folds(transactions, folds, seed), start=1
    ):
        if len(train) < 20 or not test:
            continue
        mode_data = build_mode_artifact(train, mode)
        result = _masked_hits(
            mode_data,
            test,
            _ranked_popularity(train, set()),
            train,
            seed + fold_number,
        )
        total = result["total"]
        fold_results.append({
            "fold": fold_number,
            "train_transactions_count": len(train),
            "test_transactions_count": total,
            "eclat_hr_at_3": _rate(result["eclat_at_3"], total),
            "eclat_hr_at_5": _rate(result["eclat_at_5"], total),
            "eclat_hr_at_10": _rate(result["eclat_at_10"], total),
            "eclat_hr_at_20": _rate(result["eclat_at_20"], total),
            "baseline_hr_at_3": _rate(result["baseline_at_3"], total),
            "baseline_hr_at_5": _rate(result["baseline_at_5"], total),
            "baseline_hr_at_10": _rate(result["baseline_at_10"], total),
            "baseline_hr_at_20": _rate(result["baseline_at_20"], total),
            "eclat_category_hr_at_3": _rate(result["eclat_category_at_3"], total),
            "eclat_category_hr_at_4": _rate(result["eclat_category_at_4"], total),
            "eclat_category_hr_at_5": _rate(result["eclat_category_at_5"], total),
            "eclat_category_hr_at_10": _rate(result["eclat_category_at_10"], total),
            "eclat_category_hr_at_20": _rate(result["eclat_category_at_20"], total),
        })

    metric_names = (
        "eclat_hr_at_3", "eclat_hr_at_5", "eclat_hr_at_10", "eclat_hr_at_20",
        "eclat_category_hr_at_3", "eclat_category_hr_at_4", "eclat_category_hr_at_5",
        "eclat_category_hr_at_10", "eclat_category_hr_at_20",
        "baseline_hr_at_3", "baseline_hr_at_5", "baseline_hr_at_10", "baseline_hr_at_20",
    )
    aggregate = {
        "role": role,
        "experience_mode": mode,
        "evaluation_protocol": "five_fold_cross_validation_masked_skill",
        "folds": len(fold_results),
        "eligible_transactions_count": len(transactions),
        "fold_results": fold_results,
        "metrics": {
            name: _mean_std([fold[name] for fold in fold_results])
            for name in metric_names
        },
    }
    aggregate.update(_target_summary(
        aggregate["metrics"][TARGET_METRIC]["mean"]
    ))
    return aggregate


def run_cross_validation() -> List[Dict[str, Any]]:
    if not TRANSACTIONS_FILE.exists():
        raise FileNotFoundError(f"Missing {TRANSACTIONS_FILE}")
    with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    results = [
        evaluate_cross_validation(modes.get(mode, []), role, mode)
        for role, modes in data.items()
        for mode in ("entry", "all")
    ]
    with open(CV_METRICS_FILE, "w", encoding="utf-8") as file:
        json.dump(results, file, indent=2)
    return results


if __name__ == "__main__":
    run_evaluation()
