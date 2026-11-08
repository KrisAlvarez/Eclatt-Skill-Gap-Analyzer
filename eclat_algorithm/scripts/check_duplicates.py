"""Audit clean transactions for duplicate job IDs, identical skill signatures, and track overlap."""

import json
from collections import Counter
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED = BASE_DIR / "data" / "processed" / "clean_transactions.json"

if not PROCESSED.exists():
    print(f"Error: {PROCESSED} not found. Run builder.py first.")
    exit(1)

print("=== Transaction Deduplication & Overlap Audit ===")
with open(PROCESSED, "r", encoding="utf-8") as f:
    data = json.load(f)

all_job_ids = []
role_job_sets = {}

for role, modes in data.items():
    job_ids = [t["job_id"] for t in modes["all"]]
    role_job_sets[role] = set(job_ids)
    all_job_ids.extend(job_ids)
    
    # Check duplicate job_ids within role
    dup_ids = len(job_ids) - len(set(job_ids))
    print(f"Role: {role:22s} | Postings: {len(job_ids):6d} | Duplicate IDs within track: {dup_ids}")
    
    # Check unique skill sets
    skill_signatures = [tuple(sorted(t["skills"])) for t in modes["all"]]
    unique_signatures = len(set(skill_signatures))
    print(f"  Unique Skill Profiles: {unique_signatures:6d} ({unique_signatures / len(job_ids):.1%} variety)")

# Total unique postings across all roles
unique_total_jobs = len(set(all_job_ids))
print(f"\nTotal Track Assignments across all 3 roles: {len(all_job_ids):,}")
print(f"Unique Individual Job Postings:             {unique_total_jobs:,}")

# Cross-role multi-label overlap
be_fe = len(role_job_sets["Backend Developer"] & role_job_sets["Frontend Developer"])
be_da = len(role_job_sets["Backend Developer"] & role_job_sets["Data Analyst"])
fe_da = len(role_job_sets["Frontend Developer"] & role_job_sets["Data Analyst"])
print(f"\nMulti-Track Overlap (Full-Stack / Hybrid Roles):")
print(f"  Backend & Frontend:     {be_fe:5d} postings")
print(f"  Backend & Data Analyst:  {be_da:5d} postings")
print(f"  Frontend & Data Analyst: {fe_da:5d} postings")
