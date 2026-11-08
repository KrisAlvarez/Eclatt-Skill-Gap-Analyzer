"""Dataset Preprocessing and Hybrid Role Classification Pipeline.

Exclusively relies on the 'asaniczka/1-3m-linkedin-jobs-and-skills-2024' dataset.
Downloads/resolves dataset location via kagglehub, streams linkedin_job_postings.csv
and job_skills.csv, classifies postings into 3 core IT roles (Backend, Frontend, Data Analyst),
normalizes skills against canonical IT taxonomy, filters for seniority (Junior/Entry vs All),
and exports sanitized transaction databases to data/processed/.
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional
import pandas as pd
import kagglehub

from eclat_algorithm.taxonomy import SKILL_TAXONOMY, ALIAS_MAP

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

DATASET_NAME = "asaniczka/1-3m-linkedin-jobs-and-skills-2024"

# Regex Patterns for Role Classification
RE_BACKEND_TITLE = re.compile(
    r"\b(backend|back-end|api engineer|python developer|java developer|golang developer|c# developer|node developer|django developer|spring developer)\b",
    re.IGNORECASE,
)
RE_FRONTEND_TITLE = re.compile(
    r"\b(frontend|front-end|ui engineer|ui developer|react developer|vue developer|angular developer|web developer|javascript developer)\b",
    re.IGNORECASE,
)
RE_DATA_TITLE = re.compile(
    r"\b(data analyst|business intelligence analyst|bi analyst|sql analyst|analytics engineer|data specialist|reporting analyst)\b",
    re.IGNORECASE,
)
RE_GENERIC_SWE_TITLE = re.compile(
    r"\b(software engineer|software developer|application developer|programmer)\b",
    re.IGNORECASE,
)

# Junior / Entry level signals
RE_JUNIOR_TITLE = re.compile(
    r"\b(junior|jr|associate|intern|internship|graduate|entry level|entry-level|trainee|apprentice|l1)\b",
    re.IGNORECASE,
)
RE_SENIOR_TITLE = re.compile(
    r"\b(senior|sr|lead|principal|staff|architect|director|vp|head|manager)\b",
    re.IGNORECASE,
)


def classify_role(title: str, skills: List[str]) -> Optional[str]:
    """Hybrid Classifier: Combines job title with extracted stack to assign track."""
    if not isinstance(title, str):
        return None
    
    t_clean = title.strip()
    skills_set = set(skills)
    
    # 1. Direct explicit title matches
    if RE_BACKEND_TITLE.search(t_clean) and not RE_FRONTEND_TITLE.search(t_clean):
        return "Backend Developer"
    if RE_FRONTEND_TITLE.search(t_clean) and not RE_BACKEND_TITLE.search(t_clean):
        return "Frontend Developer"
    if RE_DATA_TITLE.search(t_clean):
        return "Data Analyst"
        
    # 2. Hybrid Disambiguation for Generic SWE/Dev titles
    if RE_GENERIC_SWE_TITLE.search(t_clean):
        backend_markers = {"Django", "FastAPI", "Flask", "Spring Boot", "ASP.NET", "PostgreSQL", "MySQL", "Redis", "Microservices", "REST API", "Docker", "Go", "Java"}
        frontend_markers = {"React", "Vue.js", "Angular", "Next.js", "CSS", "HTML", "Tailwind CSS", "Redux", "TypeScript"}
        data_markers = {"Pandas", "NumPy", "Tableau", "Power BI", "SQL", "Excel", "Airflow", "Snowflake"}

        be_score = len(skills_set & backend_markers)
        fe_score = len(skills_set & frontend_markers)
        da_score = len(skills_set & data_markers)

        if be_score >= 2 and be_score > fe_score and be_score > da_score:
            return "Backend Developer"
        if fe_score >= 2 and fe_score > be_score:
            return "Frontend Developer"
        if da_score >= 2 and da_score > be_score:
            return "Data Analyst"

    return None


def is_entry_level(exp_level: Optional[str], title: str, description: str = "") -> bool:
    """Multi-signal check to detect Entry-Level / Junior postings and filter out senior roles."""
    if isinstance(title, str) and RE_SENIOR_TITLE.search(title):
        return False

    # 1. Metadata check in asaniczka dataset
    if isinstance(exp_level, str):
        if exp_level.strip().lower() in ["associate", "entry level", "internship"]:
            return True
            
    # 2. Title regex check
    if isinstance(title, str) and RE_JUNIOR_TITLE.search(title):
        return True
        
    return False


def clean_skill_token(token: str) -> Optional[str]:
    """Normalize a raw skill token from job_skills.csv to canonical taxonomy."""
    s = token.strip()
    s_lower = s.lower()
    if s in SKILL_TAXONOMY:
        return s
    if s_lower in ALIAS_MAP:
        return ALIAS_MAP[s_lower]
    return None


def get_dataset_directory() -> Path:
    """Download or retrieve cached asaniczka dataset directory using kagglehub."""
    print(f"Resolving dataset: {DATASET_NAME} via kagglehub...")
    dataset_dir = Path(kagglehub.dataset_download(DATASET_NAME))
    print(f"Dataset path: {dataset_dir}")
    return dataset_dir


def build_clean_dataset(limit_rows: Optional[int] = None) -> Dict[str, any]:
    """Process asaniczka 1.3M dataset, extract IT skills and roles, and save clean transactions."""
    dataset_dir = get_dataset_directory()
    postings_path = dataset_dir / "linkedin_job_postings.csv"
    skills_path = dataset_dir / "job_skills.csv"

    if not postings_path.exists() or not skills_path.exists():
        raise FileNotFoundError(f"Missing required CSV files in {dataset_dir}")

    print(f"Step 1/2: Streaming {postings_path.name} to identify IT candidate postings...")
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

            title_lower = title.lower()
            if any(k in title_lower for k in [
                "backend", "back-end", "python", "java", "api", "node", "django", "spring", "golang", "c#",
                "frontend", "front-end", "ui", "react", "vue", "angular", "web", "javascript", "typescript",
                "data analyst", "bi analyst", "analytics", "sql analyst", "reporting analyst", "business intelligence",
                "software engineer", "developer", "programmer"
            ]):
                job_link = row["job_link"]
                exp_level = str(row["job_level"]) if pd.notnull(row["job_level"]) else None
                entry_flag = is_entry_level(exp_level, title)
                matched_jobs[job_link] = {
                    "title": title,
                    "exp_level": exp_level,
                    "is_entry": entry_flag,
                }

        if limit_rows and total_postings >= limit_rows:
            break
        print(f"  Scanned {total_postings} postings... Matched {len(matched_jobs)} candidate IT jobs.")

    print(f"\nStep 2/2: Streaming {skills_path.name} to extract canonical skills for candidate jobs...")
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

            canonical_skills = set()
            for raw_tok in raw_skills_str.split(","):
                cleaned = clean_skill_token(raw_tok)
                if cleaned:
                    canonical_skills.add(cleaned)

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

    # Export clean transactions to JSON
    output_json = PROCESSED_DIR / "clean_transactions.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(records_by_role_and_exp, f, indent=2)

    # Print summary statistics
    summary = {}
    print("\n=== Dataset Preprocessing Complete (asaniczka 1.3M Dataset) ===")
    for role, modes in records_by_role_and_exp.items():
        all_count = len(modes["all"])
        entry_count = len(modes["entry"])
        summary[role] = {"all": all_count, "entry": entry_count}
        print(f"Track: {role:22s} | Entry-Level: {entry_count:5d} postings | Total Benchmark: {all_count:5d} postings")

    summary_file = PROCESSED_DIR / "clean_summary.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
        
    print(f"\nArtifacts saved to:\n  - {output_json}\n  - {summary_file}")
    return summary


if __name__ == "__main__":
    build_clean_dataset()
