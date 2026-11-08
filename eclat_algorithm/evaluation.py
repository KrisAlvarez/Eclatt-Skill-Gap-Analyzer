"""Leakage-safe masked-skill evaluation for the ECLAT recommendation engine.

The evaluator uses disjoint train, validation, and test partitions. Thresholds
are selected on validation data and are never tuned against the final test set.
Results retain the legacy fields consumed by the API while adding protocol and
uncertainty metadata.
"""

import json
import random
from math import sqrt
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

from eclat_algorithm.miner import ECLATMiner

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TRANSACTIONS_FILE = PROCESSED_DIR / "clean_transactions.json"
METRICS_FILE = PROCESSED_DIR / "evaluation_metrics.json"

PARAMETER_GRID = (
    (0.03, 0.25, 1.05),
    (0.05, 0.30, 1.10),
    (0.05, 0.35, 1.15),
    (0.08, 0.30, 1.10),
)
MIN_SUPPORT_ABSOLUTE_COUNT = 3
MAX_VALIDATION_TRANSACTIONS = 3000
MAX_TEST_TRANSACTIONS = 10000


def _split(records: Sequence[List[str]], seed: int) -> Tuple[List[List[str]], ...]:
    shuffled = list(records)
    random.Random(seed).shuffle(shuffled)
    n = len(shuffled)
    train_end = int(n * 0.60)
    validation_end = int(n * 0.80)
    return (
        shuffled[:train_end],
        shuffled[train_end:validation_end],
        shuffled[validation_end:],
    )


def _build_miner(
    transactions: List[List[str]],
    parameters: Tuple[float, float, float],
) -> ECLATMiner:
    miner = ECLATMiner(
        transactions,
        min_support=parameters[0],
        min_absolute_count=MIN_SUPPORT_ABSOLUTE_COUNT,
        max_itemset_size=4,
    )
    miner.mine()
    miner.generate_rules(
        min_confidence=parameters[1],
        min_lift=parameters[2],
    )
    return miner


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


def _masked_hits(
    miner: ECLATMiner,
    transactions: Sequence[List[str]],
    popularity: List[str],
    reference_transactions: Sequence[List[str]],
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
    }
    counts = {skill: 0 for skill in popularity}
    for transaction in reference_transactions:
        for skill in set(transaction):
            counts[skill] = counts.get(skill, 0) + 1

    for transaction in transactions:
        if len(transaction) < 2:
            continue
        masked = rng.choice(transaction)
        input_skills = [skill for skill in transaction if skill != masked]
        eclat_skills = [
            item["skill"]
            for item in miner.recommend(input_skills, top_k=5)["recommendations"]
        ]
        baseline = [skill for skill in popularity if skill not in input_skills][:5]
        result["total"] += 1
        result["eclat_at_3"] += int(masked in eclat_skills[:3])
        result["eclat_at_5"] += int(masked in eclat_skills[:5])
        result["baseline_at_3"] += int(masked in baseline[:3])
        result["baseline_at_5"] += int(masked in baseline[:5])

        marginal = counts.get(masked, 0) / max(len(transactions), 1)
        if marginal < 0.30:
            result["non_trivial_total"] += 1
            result["non_trivial_eclat_at_5"] += int(masked in eclat_skills[:5])
            result["non_trivial_baseline_at_5"] += int(masked in baseline[:5])
    return result


def _score(result: Dict[str, int]) -> float:
    if not result["total"]:
        return 0.0
    return result["eclat_at_5"] / result["total"]


def _rate(hits: int, total: int) -> float:
    return round(hits / total, 4) if total else 0.0


def _wilson(hits: int, total: int) -> List[float]:
    if not total:
        return [0.0, 0.0]
    p = hits / total
    z = 1.96
    denominator = 1 + z * z / total
    centre = (p + z * z / (2 * total)) / denominator
    margin = z * sqrt((p * (1 - p) / total) + z * z / (4 * total * total)) / denominator
    return [round(max(0.0, centre - margin), 4), round(min(1.0, centre + margin), 4)]


def evaluate_role_mode(
    records: List[Dict[str, any]],
    role: str,
    mode: str,
    seed: int = 42,
) -> Dict[str, any]:
    transactions = [
        list(dict.fromkeys(record["skills"]))
        for record in records
        if len(set(record["skills"])) >= 3
    ]
    train, validation, test = _split(transactions, seed)
    if len(train) < 20 or not validation or not test:
        return {
            "role": role,
            "experience_mode": mode,
            "evaluation_protocol": "train_validation_test_masked_skill",
            "test_transactions_count": 0,
            "eclat_hr_at_3": 0.0,
            "baseline_hr_at_3": 0.0,
            "eclat_hr_at_5": 0.0,
            "baseline_hr_at_5": 0.0,
            "non_trivial_eclat_hr_at_5": 0.0,
            "non_trivial_baseline_hr_at_5": 0.0,
            "lift_over_baseline_pct": 0.0,
            "eclat_hr_at_5_ci95": [0.0, 0.0],
        }

    validation_sample = validation[:MAX_VALIDATION_TRANSACTIONS]
    best_parameters = PARAMETER_GRID[0]
    best_score = -1.0
    for parameters in PARAMETER_GRID:
        candidate = _build_miner(train, parameters)
        candidate_popularity = _ranked_popularity(train, set())
        validation_result = _masked_hits(
            candidate,
            validation_sample,
            candidate_popularity,
            train,
            seed + 1,
        )
        score = _score(validation_result)
        if score > best_score:
            best_score = score
            best_parameters = parameters

    miner = _build_miner(train, best_parameters)
    popularity = _ranked_popularity(train, set())
    test_sample = test[:MAX_TEST_TRANSACTIONS]
    result = _masked_hits(miner, test_sample, popularity, train, seed + 2)
    total = result["total"]
    non_trivial_total = result["non_trivial_total"]
    eclat_hr_5 = _rate(result["eclat_at_5"], total)
    baseline_hr_5 = _rate(result["baseline_at_5"], total)

    return {
        "role": role,
        "experience_mode": mode,
        "evaluation_protocol": "train_validation_test_masked_skill",
        "train_transactions_count": len(train),
        "validation_transactions_count": len(validation),
        "test_transactions_count": total,
        "selected_min_support": best_parameters[0],
        "selected_min_confidence": best_parameters[1],
        "selected_min_lift": best_parameters[2],
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
        "lift_over_baseline_pct": round(
            ((eclat_hr_5 - baseline_hr_5) / baseline_hr_5) * 100,
            1,
        ) if baseline_hr_5 else 0.0,
        "eclat_hr_at_5_ci95": _wilson(result["eclat_at_5"], total),
        "baseline_hr_at_5_ci95": _wilson(result["baseline_at_5"], total),
    }


def run_evaluation() -> List[Dict[str, any]]:
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
