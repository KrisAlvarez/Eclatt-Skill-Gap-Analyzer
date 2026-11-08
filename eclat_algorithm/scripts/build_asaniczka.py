"""Pipeline to process the asaniczka 1.3M dataset and align ECLAT models.

Streams linkedin_job_postings.csv and job_skills.csv from kagglehub cache,
filters by IT career tracks (Backend, Frontend, Data Analyst) and seniority (Entry vs All),
normalizes skills to canonical taxonomy, and re-mines the ECLAT rule base and evaluation benchmarks.
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Set
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from eclat_algorithm.taxonomy import SKILL_TAXONOMY, ALIAS_MAP
from eclat_algorithm.builder import classify_role, is_entry_level
from eclat_algorithm.runner import run_eclat_offline
from eclat_algorithm.evaluation import run_evaluation

PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

DATA_CACHE_DIR = Path(os.path.expanduser(r"~/.cache/kagglehub/datasets/asaniczka/1-3m-linkedin-jobs-and-skills-2024/versions/2"))


def clean_skill_token(token: str) -> str:
    """Normalize a raw skill token from job_skills.csv to canonical taxonomy."""
    s = token.strip()
    s_lower = s.lower()
    if s in SKILL_TAXONOMY:
        return s
    if s_lower in ALIAS_MAP:
        return ALIAS_MAP[s_lower]
    return None


def process_asaniczka():
    postings_path = DATA_CACHE_DIR / "linkedin_job_postings.csv"
    skills_path = DATA_CACHE_DIR / "job_skills.csv"

    if not postings_path.exists() or not skills_path.exists():
        raise FileNotFoundError(f"Missing asaniczka dataset files in {DATA_CACHE_DIR}")

    print(f"Step 1/4: Scanning {postings_path.name} to identify IT roles & seniority...")
    
    # Map job_link -> {"title": ..., "role_hint": ..., "is_entry": ...}
    matched_jobs = {}
    chunk_size = 100000
    total_postings = 0

    cols_p = ["job_link", "job_title", "job_level"]
    
    for chunk in pd.read_csv(postings_path, usecols=cols_p, chunksize=chunk_size):
        total_postings += len(chunk)
        for _, row in chunk.iterrows():
            title = str(row["job_title"]) if pd.notnull(row["job_title"]) else ""
            if len(title) < 4:
                continue

            # Quick preliminary title check to reduce memory
            title_lower = title.lower()
            if any(k in title_lower for k in [
                "backend", "back-end", "python", "java", "api", "node", "django", "spring", "golang", "c#",
                "frontend", "front-end", "ui", "react", "vue", "angular", "web", "javascript", "typescript",
                "data analyst", "bi analyst", "analytics", "sql analyst", "reporting analyst", "business intelligence",
                "software engineer", "developer", "programmer"
            ]):
                job_link = row["job_link"]
                exp_level = str(row["job_level"]) if pd.notnull(row["job_level"]) else None
                entry_flag = is_entry_level(exp_level, title, "")
                
                matched_jobs[job_link] = {
                    "title": title,
                    "exp_level": exp_level,
                    "is_entry": entry_flag,
                }

        print(f"  Scanned {total_postings} postings... Matched {len(matched_jobs)} candidate IT jobs.")

    print(f"\nStep 2/4: Scanning {skills_path.name} to extract canonical skills for candidate jobs...")
    
    matched_links = set(matched_jobs.keys())
    records_by_role_and_exp = {
        "Backend Developer": {"entry": [], "all": []},
        "Frontend Developer": {"entry": [], "all": []},
        "Data Analyst": {"entry": [], "all": []},
    }

    job_counter = 1000000
    skills_scanned = 0
    retained_transactions = 0

    cols_s = ["job_link", "job_skills"]
    for chunk in pd.read_csv(skills_path, usecols=cols_s, chunksize=chunk_size):
        skills_scanned += len(chunk)
        matched_chunk = chunk[chunk["job_link"].isin(matched_links)]
        
        for _, row in matched_chunk.iterrows():
            link = row["job_link"]
            meta = matched_jobs[link]
            raw_skills_str = str(row["job_skills"]) if pd.notnull(row["job_skills"]) else ""
            if not raw_skills_str:
                continue

            # Normalize skills
            canonical_skills = set()
            for raw_tok in raw_skills_str.split(","):
                cleaned = clean_skill_token(raw_tok)
                if cleaned:
                    canonical_skills.add(cleaned)

            # Minimum 3 skills for meaningful multi-itemset co-occurrence
            if len(canonical_skills) < 3:
                continue

            skills_list = sorted(list(canonical_skills))
            role = classify_role(meta["title"], skills_list)
            if not role:
                continue

            job_counter += 1
            item = {
                "job_id": job_counter,
                "title": meta["title"],
                "skills": skills_list,
                "is_entry": meta["is_entry"],
            }

            records_by_role_and_exp[role]["all"].append(item)
            if meta["is_entry"]:
                records_by_role_and_exp[role]["entry"].append(item)
            retained_transactions += 1

        print(f"  Processed {skills_scanned} skill records... Retained {retained_transactions} clean IT transactions.")

    print(f"\nStep 3/4: Saving clean transactions and summary...")
    output_json = PROCESSED_DIR / "clean_transactions.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(records_by_role_and_exp, f, indent=2)

    summary = {}
    print("\n=== Dataset Alignment Summary (1.3M asaniczka Dataset) ===")
    for role, modes in records_by_role_and_exp.items():
        all_count = len(modes["all"])
        entry_count = len(modes["entry"])
        summary[role] = {"all": all_count, "entry": entry_count}
        print(f"Track: {role:22s} | Entry-Level: {entry_count:5d} postings | Total Benchmark: {all_count:5d} postings")

    summary_file = PROCESSED_DIR / "clean_summary.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"Artifacts successfully written to {PROCESSED_DIR}")

    print("\nStep 4/4: Re-mining ECLAT association rules & Leave-One-Out evaluation...")
    run_eclat_offline()
    run_evaluation()
    print("\nAll ECLAT models and evaluation benchmarks successfully updated and aligned!")


if __name__ == "__main__":
    process_asaniczka()
