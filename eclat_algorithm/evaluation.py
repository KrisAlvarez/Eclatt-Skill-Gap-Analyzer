"""Masked Skill Recovery (Leave-One-Out) Offline Evaluation Engine.

Splits clean IT transactions into an 80% Training Set and 20% Held-Out Test Set.
Evaluates ECLAT Hit-Rate@3 and Hit-Rate@5 against a Naive Popularity Baseline (COUNT(*)).
Stratifies results to evaluate Non-Trivial / Long-Tail skills (<30% marginal frequency)
to mathematically prove that ECLAT captures context rather than just common words.
"""

import json
import random
from pathlib import Path
from typing import Dict, List

from eclat_algorithm.miner import ECLATMiner

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TRANSACTIONS_FILE = PROCESSED_DIR / "clean_transactions.json"
METRICS_FILE = PROCESSED_DIR / "evaluation_metrics.json"

DEFAULT_MIN_SUPPORT = 0.05
DEFAULT_MIN_CONFIDENCE = 0.35
DEFAULT_MIN_LIFT = 1.15
ENTRY_MIN_SUPPORT = 0.05
ENTRY_MIN_CONFIDENCE = 0.35
ENTRY_MIN_LIFT = 1.15
MIN_SUPPORT_ABSOLUTE_COUNT = 3


def evaluate_role_mode(
    records: List[Dict[str, any]],
    role: str,
    mode: str,
    seed: int = 42
) -> Dict[str, any]:
    """Runs Leave-One-Out cross validation on a single role and experience segment."""
    random.seed(seed)
    
    # Filter for transactions with at least 3 skills
    valid_transactions = [r["skills"] for r in records if len(r["skills"]) >= 3]
    n_total = len(valid_transactions)
    
    if n_total < 20:
        return {
            "role": role,
            "experience_mode": mode,
            "test_transactions_count": 0,
            "eclat_hr_at_3": 0.0,
            "baseline_hr_at_3": 0.0,
            "eclat_hr_at_5": 0.0,
            "baseline_hr_at_5": 0.0,
            "non_trivial_eclat_hr_at_5": 0.0,
            "non_trivial_baseline_hr_at_5": 0.0,
            "lift_over_baseline_pct": 0.0,
        }

    # 80/20 train/test split
    shuffled = valid_transactions.copy()
    random.shuffle(shuffled)
    split_idx = int(0.80 * n_total)
    train_txs = shuffled[:split_idx]
    test_txs = shuffled[split_idx:]

    minsup = ENTRY_MIN_SUPPORT if mode == "entry" else DEFAULT_MIN_SUPPORT
    minconf = ENTRY_MIN_CONFIDENCE if mode == "entry" else DEFAULT_MIN_CONFIDENCE
    minlift = ENTRY_MIN_LIFT if mode == "entry" else DEFAULT_MIN_LIFT

    # Train ECLAT strictly on training set
    miner = ECLATMiner(
        train_txs,
        min_support=minsup,
        min_absolute_count=MIN_SUPPORT_ABSOLUTE_COUNT,
        max_itemset_size=4,
    )
    miner.mine()
    miner.generate_rules(min_confidence=minconf, min_lift=minlift)

    # Compute marginal skill frequency on training set for baseline & triviality filter
    train_counts = {}
    for tx in train_txs:
        for s in tx:
            train_counts[s] = train_counts.get(s, 0) + 1
    
    n_train = len(train_txs)
    ranked_baseline_skills = sorted(train_counts.keys(), key=lambda s: -train_counts[s])

    # Leave-One-Out Evaluation on Test Set
    eclat_hits_at_3 = 0
    eclat_hits_at_5 = 0
    baseline_hits_at_3 = 0
    baseline_hits_at_5 = 0

    non_trivial_total = 0
    non_trivial_eclat_hits_5 = 0
    non_trivial_baseline_hits_5 = 0

    for tx in test_txs:
        # Uniformly mask 1 skill
        masked_skill = random.choice(tx)
        input_skills = [s for s in tx if s != masked_skill]

        # 1. ECLAT Recommendations
        eclat_res = miner.recommend(input_skills, top_k=5)
        eclat_rec_skills = [r["skill"] for r in eclat_res["recommendations"]]
        eclat_top_3 = eclat_rec_skills[:3]
        eclat_top_5 = eclat_rec_skills[:5]

        # 2. Naive Baseline: Top most popular skills not in input
        baseline_candidates = [s for s in ranked_baseline_skills if s not in input_skills]
        baseline_top_3 = baseline_candidates[:3]
        baseline_top_5 = baseline_candidates[:5]

        if masked_skill in eclat_top_3:
            eclat_hits_at_3 += 1
        if masked_skill in eclat_top_5:
            eclat_hits_at_5 += 1

        if masked_skill in baseline_top_3:
            baseline_hits_at_3 += 1
        if masked_skill in baseline_top_5:
            baseline_hits_at_5 += 1

        # Check triviality (marginal frequency < 30%)
        marginal_freq = train_counts.get(masked_skill, 0) / n_train
        if marginal_freq < 0.30:
            non_trivial_total += 1
            if masked_skill in eclat_top_5:
                non_trivial_eclat_hits_5 += 1
            if masked_skill in baseline_top_5:
                non_trivial_baseline_hits_5 += 1

    n_test = len(test_txs)
    eclat_hr_3 = round(eclat_hits_at_3 / n_test, 4) if n_test > 0 else 0.0
    eclat_hr_5 = round(eclat_hits_at_5 / n_test, 4) if n_test > 0 else 0.0
    base_hr_3 = round(baseline_hits_at_3 / n_test, 4) if n_test > 0 else 0.0
    base_hr_5 = round(baseline_hits_at_5 / n_test, 4) if n_test > 0 else 0.0

    nt_eclat_5 = round(non_trivial_eclat_hits_5 / non_trivial_total, 4) if non_trivial_total > 0 else 0.0
    nt_base_5 = round(non_trivial_baseline_hits_5 / non_trivial_total, 4) if non_trivial_total > 0 else 0.0

    lift_pct = round(((eclat_hr_5 - base_hr_5) / base_hr_5) * 100, 1) if base_hr_5 > 0 else 0.0

    return {
        "role": role,
        "experience_mode": mode,
        "test_transactions_count": n_test,
        "eclat_hr_at_3": eclat_hr_3,
        "baseline_hr_at_3": base_hr_3,
        "eclat_hr_at_5": eclat_hr_5,
        "baseline_hr_at_5": base_hr_5,
        "non_trivial_eclat_hr_at_5": nt_eclat_5,
        "non_trivial_baseline_hr_at_5": nt_base_5,
        "lift_over_baseline_pct": lift_pct,
    }


def run_evaluation() -> List[Dict[str, any]]:
    if not TRANSACTIONS_FILE.exists():
        raise FileNotFoundError(f"Missing {TRANSACTIONS_FILE}")

    print(f"Loading transactions for evaluation from {TRANSACTIONS_FILE.name}...")
    with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    results = []
    print("\n=== Running Masked Skill Recovery (Leave-One-Out) Evaluation ===")
    for role, modes in data.items():
        for mode in ["entry", "all"]:
            records = modes.get(mode, [])
            res = evaluate_role_mode(records, role, mode)
            results.append(res)
            print(f"[{role} - {mode.upper()}] Test Size: {res['test_transactions_count']}")
            print(f"  Hit-Rate@3: ECLAT {res['eclat_hr_at_3']*100:.1f}% vs Naive Baseline {res['baseline_hr_at_3']*100:.1f}%")
            print(f"  Hit-Rate@5: ECLAT {res['eclat_hr_at_5']*100:.1f}% vs Naive Baseline {res['baseline_hr_at_5']*100:.1f}% (Lift: +{res['lift_over_baseline_pct']}%)")
            print(f"  Non-Trivial (<30% freq) HR@5: ECLAT {res['non_trivial_eclat_hr_at_5']*100:.1f}% vs Baseline {res['non_trivial_baseline_hr_at_5']*100:.1f}%\n")

    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"Evaluation metrics serialized to: {METRICS_FILE}")
    return results


if __name__ == "__main__":
    run_evaluation()
