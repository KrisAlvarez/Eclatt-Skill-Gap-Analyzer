"""Audit title distributions and skill co-occurrence counts from clean transactions."""

import json
from collections import Counter
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED = BASE_DIR / "data" / "processed" / "clean_transactions.json"

if not PROCESSED.exists():
    print(f"Error: {PROCESSED} not found. Run builder.py first.")
    exit(1)

print("=== Clean Transactions Title & Skill Distribution Audit ===")
with open(PROCESSED, "r", encoding="utf-8") as f:
    data = json.load(f)

for role, modes in data.items():
    print(f"\n--- {role} ---")
    all_txs = modes["all"]
    titles = [t["title"] for t in all_txs]
    skills_counts = [len(t["skills"]) for t in all_txs]
    avg_skills = sum(skills_counts) / len(skills_counts) if skills_counts else 0
    print(f"Total Transactions: {len(all_txs)} | Avg Skills per Job: {avg_skills:.1f}")

    print("Top 5 Job Titles:")
    for title, cnt in Counter(titles).most_common(5):
        print(f"  {cnt:5d}  {title}")

    print("Top 5 Most Frequent Skills:")
    all_skills = [s for t in all_txs for s in t["skills"]]
    for skill, cnt in Counter(all_skills).most_common(5):
        freq = cnt / len(all_txs) if all_txs else 0
        print(f"  {cnt:5d}  {skill:20s} ({freq:.1%})")
