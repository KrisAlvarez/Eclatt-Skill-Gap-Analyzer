"""Audit dataset integrity, role counts, and TID-list intersections from asaniczka dataset."""

import json
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED = BASE_DIR / "data" / "processed" / "clean_transactions.json"
SUMMARY = BASE_DIR / "data" / "processed" / "clean_summary.json"

if not PROCESSED.exists():
    print("Error: clean_transactions.json not found. Run builder.py first.")
    exit(1)

print("=== Asaniczka 1.3M Mined IT Transactions Audit ===")
with open(SUMMARY, "r", encoding="utf-8") as f:
    summary = json.load(f)

for role, counts in summary.items():
    print(f"Role: {role:22s} | Entry: {counts['entry']:5d} | All: {counts['all']:5d}")

with open(PROCESSED, "r", encoding="utf-8") as f:
    data = json.load(f)

# Sample TID-list demonstration
print("\n=== TID-List Intersection Demonstration (Backend Developer) ===")
be_txs = [r["skills"] for r in data["Backend Developer"]["all"]]
tids = defaultdict(set)
for idx, tx in enumerate(be_txs):
    for s in tx:
        tids[s].add(idx)

for skill in ["Python", "SQL", "Docker"]:
    print(f"  TID({skill:7s}): count = {len(tids[skill]):4d} postings")

py_sql = tids["Python"] & tids["SQL"]
py_sql_docker = py_sql & tids["Docker"]
print(f"  TID(Python & SQL): {len(py_sql)} postings")
print(f"  TID(Python & SQL & Docker): {len(py_sql_docker)} postings")
if len(py_sql) > 0:
    conf = len(py_sql_docker) / len(py_sql)
    print(f"  Conditional P(Docker | Python, SQL): {conf:.1%}")
