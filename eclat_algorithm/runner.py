"""Offline Rule Precomputation and Serialization.

Executes ECLAT frequent itemset mining and association rule generation
across all 3 roles and 2 market modes (Entry vs All).
Serializes the resulting rule base into data/processed/rules.json,
allowing the FastAPI backend to run within Render's 512 MB memory limit.
"""

import json
from pathlib import Path
from typing import Dict

from eclat_algorithm.recommendation import build_mode_artifact

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TRANSACTIONS_FILE = PROCESSED_DIR / "clean_transactions.json"
RULES_FILE = PROCESSED_DIR / "rules.json"

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

            artifact = build_mode_artifact(transactions, mode)
            precomputed[role][mode] = artifact

            print(f"  Production-compatible rule artifact: {len(artifact['rules'])} rules")
            if artifact["rules"]:
                rule = artifact["rules"][0]
                print(f"  Sample Top Rule: {rule['antecedent']} -> {rule['consequent']} (Conf: {rule['confidence']}, Lift: {rule['lift']})")

    # Serialize precomputed rules
    with open(RULES_FILE, "w", encoding="utf-8") as f:
        json.dump(precomputed, f, indent=2)

    print(f"\nSuccessfully serialized precomputed rule base to:\n  {RULES_FILE}")
    print(f"File Size: {RULES_FILE.stat().st_size / 1024:.2f} KB (Safe for 512 MB Render Free Tier)")
    return precomputed


if __name__ == "__main__":
    run_eclat_offline()
