"""Offline Rule Precomputation and Serialization.

Executes ECLAT frequent itemset mining and association rule generation
across all 3 roles and 2 market modes (Entry vs All).
Serializes the resulting rule base into data/processed/rules.json,
allowing the FastAPI backend to run within Render's 512 MB memory limit.
"""

import json
from pathlib import Path
from typing import Dict

from eclat_algorithm.miner import ECLATMiner
from eclat_algorithm.taxonomy import get_category

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TRANSACTIONS_FILE = PROCESSED_DIR / "clean_transactions.json"
RULES_FILE = PROCESSED_DIR / "rules.json"

DEFAULT_MIN_SUPPORT = 0.05
DEFAULT_MIN_CONFIDENCE = 0.35
DEFAULT_MIN_LIFT = 1.15
ENTRY_MIN_SUPPORT = 0.05
ENTRY_MIN_CONFIDENCE = 0.35
ENTRY_MIN_LIFT = 1.15
MIN_SUPPORT_ABSOLUTE_COUNT = 3
MAX_RULES_STORED_PER_MODE = 2000


def run_eclat_offline() -> Dict[str, any]:
    if not TRANSACTIONS_FILE.exists():
        raise FileNotFoundError(f"Missing {TRANSACTIONS_FILE}. Run builder.py first.")

    print(f"Loading clean transactions from {TRANSACTIONS_FILE.name}...")
    with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    precomputed = {}

    for role, modes in data.items():
        precomputed[role] = {}
        for mode, records in modes.items():
            transactions = [r["skills"] for r in records]
            n = len(transactions)
            print(f"\nMining [{role}] - Mode: [{mode}] (Transactions: {n})...")

            if n < 5:
                print(f"  Warning: Insufficient transactions ({n}) for {role} [{mode}]. Skipping.")
                precomputed[role][mode] = {
                    "total_transactions": n,
                    "top_1_itemsets": [],
                    "rules": []
                }
                continue

            minsup = ENTRY_MIN_SUPPORT if mode == "entry" else DEFAULT_MIN_SUPPORT
            minconf = ENTRY_MIN_CONFIDENCE if mode == "entry" else DEFAULT_MIN_CONFIDENCE
            minlift = ENTRY_MIN_LIFT if mode == "entry" else DEFAULT_MIN_LIFT

            miner = ECLATMiner(
                transactions,
                min_support=minsup,
                min_absolute_count=MIN_SUPPORT_ABSOLUTE_COUNT,
                max_itemset_size=4,
            )
            miner.mine()
            rules = miner.generate_rules(min_confidence=minconf, min_lift=minlift)
            rules = rules[:MAX_RULES_STORED_PER_MODE]

            # Top 1-itemsets for baseline priors
            top_1 = []
            for itemset, count in miner.frequent_itemsets.items():
                if len(itemset) == 1:
                    skill = list(itemset)[0]
                    top_1.append({
                        "skill": skill,
                        "category": get_category(skill),
                        "count": count,
                        "support": round(count / n, 4),
                    })
            top_1.sort(key=lambda x: -x["count"])

            precomputed[role][mode] = {
                "total_transactions": n,
                "top_1_itemsets": top_1[:20],
                "rules": rules,
            }

            print(f"  Frequent Itemsets Mined: {len(miner.frequent_itemsets)}")
            print(f"  Association Rules Derived: {len(rules)}")
            if rules:
                print(f"  Sample Top Rule: {rules[0]['antecedent']} -> {rules[0]['consequent']} (Conf: {rules[0]['confidence']}, Lift: {rules[0]['lift']})")

    # Serialize precomputed rules
    with open(RULES_FILE, "w", encoding="utf-8") as f:
        json.dump(precomputed, f, indent=2)

    print(f"\nSuccessfully serialized precomputed rule base to:\n  {RULES_FILE}")
    print(f"File Size: {RULES_FILE.stat().st_size / 1024:.2f} KB (Safe for 512 MB Render Free Tier)")
    return precomputed


if __name__ == "__main__":
    run_eclat_offline()
