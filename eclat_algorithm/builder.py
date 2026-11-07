"""Dataset Preprocessing and Hybrid Role Classification Pipeline.

Reads data/raw/postings.csv in memory-efficient chunks, classifies postings
into 3 core IT roles (Backend, Frontend, Data Analyst) using a hybrid
title+stack classifier, extracts canonical technical skills, and exports
sanitized transaction databases to data/processed/.
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional
import pandas as pd

from eclat_algorithm.taxonomy import extract_skills

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

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
RE_JUNIOR_DESC = re.compile(
    r"\b(0-2 years|0 to 2 years|1-2 years|1 to 2 years|recent graduate|no experience required|entry level|entry-level)\b",
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


def is_entry_level(exp_level: Optional[str], title: str, description: str) -> bool:
    """Multi-signal check to detect Entry-Level / Junior postings."""
    # 1. Metadata field check
    if isinstance(exp_level, str):
        if exp_level.strip() in ["Entry level", "Associate", "Internship"]:
            return True
            
    # 2. Title regex check
    if isinstance(title, str) and RE_JUNIOR_TITLE.search(title):
        return True
        
    # 3. Description regex check
    if isinstance(description, str) and RE_JUNIOR_DESC.search(description):
        return True
        
    return False


def build_clean_dataset(limit_rows: Optional[int] = None) -> Dict[str, any]:
    """Stream postings.csv, extract skills, categorize roles, and save clean transactions."""
    postings_path = RAW_DIR / "postings.csv"
    if not postings_path.exists():
        raise FileNotFoundError(f"Missing {postings_path}")

    print(f"Streaming and processing {postings_path.name}...")
    
    records_by_role_and_exp = {
        "Backend Developer": {"entry": [], "all": []},
        "Frontend Developer": {"entry": [], "all": []},
        "Data Analyst": {"entry": [], "all": []},
    }

    chunk_size = 25000
    total_scanned = 0
    total_retained = 0

    cols = ["job_id", "title", "formatted_experience_level", "description"]
    
    for chunk in pd.read_csv(postings_path, usecols=cols, chunksize=chunk_size):
        for _, row in chunk.iterrows():
            total_scanned += 1
            if limit_rows and total_scanned > limit_rows:
                break
                
            desc = str(row["description"]) if pd.notnull(row["description"]) else ""
            if len(desc) < 40:
                continue
                
            skills = extract_skills(desc)
            # Minimum 3 skills to support multi-itemset association mining
            if len(skills) < 3:
                continue
                
            title = str(row["title"]) if pd.notnull(row["title"]) else ""
            role = classify_role(title, skills)
            if not role:
                continue
                
            exp_level = str(row["formatted_experience_level"]) if pd.notnull(row["formatted_experience_level"]) else None
            entry_flag = is_entry_level(exp_level, title, desc)
            
            item = {
                "job_id": int(row["job_id"]),
                "title": title,
                "skills": skills,
                "is_entry": entry_flag,
            }
            
            records_by_role_and_exp[role]["all"].append(item)
            if entry_flag:
                records_by_role_and_exp[role]["entry"].append(item)
            total_retained += 1

        print(f"  Scanned {total_scanned} postings... Retained {total_retained} clean IT transactions.")
        if limit_rows and total_scanned > limit_rows:
            break

    # Export clean transactions to JSON
    output_json = PROCESSED_DIR / "clean_transactions.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(records_by_role_and_exp, f, indent=2)

    # Print summary statistics
    summary = {}
    print("\n=== Dataset Preprocessing Complete ===")
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
