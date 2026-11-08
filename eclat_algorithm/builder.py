"""Dataset Preprocessing and Broadened IT Role Classification Pipeline.

Exclusively relies on the 'asaniczka/1-3m-linkedin-jobs-and-skills-2024' dataset.
Ingests all authentic IT, software development, full-stack, cloud, and data positions
from the 1.3M LinkedIn dataset (~144K tech pool), while strictly filtering out
non-software engineering titles (mechanical, civil, chemical, healthcare, etc.).
Maps positions to Backend, Frontend, and Data Analyst domains based on stack co-occurrence,
lowers skill threshold to >= 2 canonical skills, and re-mines ECLAT models.
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Set
import pandas as pd
import kagglehub

from eclat_algorithm.taxonomy import SKILL_TAXONOMY, ALIAS_MAP

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

DATASET_NAME = "asaniczka/1-3m-linkedin-jobs-and-skills-2024"

# Non-IT Engineering keywords to strictly exclude
RE_NON_IT_EXCLUDE = re.compile(
    r"\b(civil|mechanical|chemical|structural|electrical technician|biomedical|nurse|medical|radiolog|ultrasound|surgical|aeronautical|aerospace|industrial|manufacturing|petroleum|mining|environmental|hardware|technician|hvac|maintenance)\b",
    re.IGNORECASE,
)

# Junior / Entry level signals
RE_JUNIOR_TITLE = re.compile(
    r"\b(junior|jr|associate|intern|internship|graduate|entry level|entry-level|trainee|apprentice|l1|level 1|level i|tier 1)\b",
    re.IGNORECASE,
)
RE_SENIOR_TITLE = re.compile(
    r"\b(senior|sr|lead|principal|staff|architect|director|vp|head|manager|chief)\b",
    re.IGNORECASE,
)

# Stack markers for domain attribution
BACKEND_STACK: Set[str] = {
    "Python", "Java", "Go", "C#", "C++", "PHP", "Ruby", "Rust", "Node.js", "Express.js",
    "Django", "FastAPI", "Flask", "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Microservices", "REST API", "GraphQL",
    "Kafka", "RabbitMQ", "Linux", "CI/CD", "Terraform"
}

FRONTEND_STACK: Set[str] = {
    "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Next.js", "HTML", "CSS",
    "Tailwind CSS", "Bootstrap", "Redux", "WebSockets"
}

DATA_STACK: Set[str] = {
    "SQL", "Python", "R", "Pandas", "NumPy", "Tableau", "Power BI", "Excel",
    "Snowflake", "Spark", "Airflow", "Hadoop", "Scikit-learn", "Microsoft SQL Server",
    "Elasticsearch"
}


def is_entry_level(exp_level: Optional[str], title: str) -> bool:
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
    dataset_dir = Path(kagglehub.dataset_download(DATASET_NAME))
    return dataset_dir


def classify_role_broad(title: str, skills_set: Set[str]) -> List[str]:
    """Broadened Multi-Domain Classifier for IT and Software Engineering postings.
    
    A posting can contribute to Backend, Frontend, or Data Analyst depending on
    both explicit title markers and technology stack requirements.
    """
    matched_roles = []
    t_lower = title.lower()

    # 1. Check explicit title markers
    is_explicit_be = bool(re.search(r"\b(backend|back-end|api|python developer|java developer|c# developer|golang developer|node developer|spring developer)\b", t_lower))
    is_explicit_fe = bool(re.search(r"\b(frontend|front-end|ui engineer|ui developer|react developer|vue developer|angular developer|web developer|javascript developer)\b", t_lower))
    is_explicit_da = bool(re.search(r"\b(data analyst|business intelligence|bi analyst|sql analyst|analytics|data specialist|reporting analyst|data engineer)\b", t_lower))

    # 2. Check stack intersections
    be_overlap = len(skills_set & BACKEND_STACK)
    fe_overlap = len(skills_set & FRONTEND_STACK)
    da_overlap = len(skills_set & DATA_STACK)

    # Backend Attribution
    if is_explicit_be or be_overlap >= 2 or (be_overlap >= 1 and ("software" in t_lower or "developer" in t_lower or "engineer" in t_lower or "fullstack" in t_lower)):
        matched_roles.append("Backend Developer")

    # Frontend Attribution
    if is_explicit_fe or fe_overlap >= 2 or (fe_overlap >= 1 and ("software" in t_lower or "developer" in t_lower or "web" in t_lower or "fullstack" in t_lower)):
        matched_roles.append("Frontend Developer")

    # Data Analyst Attribution
    if is_explicit_da or da_overlap >= 2 or (da_overlap >= 1 and ("analyst" in t_lower or "analytics" in t_lower or "intelligence" in t_lower or "data" in t_lower)):
        matched_roles.append("Data Analyst")

    return matched_roles


def build_clean_dataset(limit_rows: Optional[int] = None) -> Dict[str, any]:
    """Process asaniczka 1.3M dataset with broadened IT scope and save clean transactions."""
    dataset_dir = get_dataset_directory()
    postings_path = dataset_dir / "linkedin_job_postings.csv"
    skills_path = dataset_dir / "job_skills.csv"

    if not postings_path.exists() or not skills_path.exists():
        raise FileNotFoundError(f"Missing required CSV files in {dataset_dir}")

    print(f"Step 1/2: Streaming {postings_path.name} to identify all IT candidate postings...")
    matched_jobs = {}
    chunk_size = 150000
    total_postings = 0

    cols_p = ["job_link", "job_title", "job_level"]
    for chunk in pd.read_csv(postings_path, usecols=cols_p, chunksize=chunk_size):
        total_postings += len(chunk)
        for _, row in chunk.iterrows():
            title = str(row["job_title"]) if pd.notnull(row["job_title"]) else ""
            if len(title) < 4:
                continue

            # Exclude non-software engineering
            if RE_NON_IT_EXCLUDE.search(title):
                continue

            t_lower = title.lower()
            if any(k in t_lower for k in [
                "software", "developer", "engineer", "data", "web", "backend", "frontend",
                "fullstack", "full-stack", "programmer", "analyst", "devops", "cloud", "architect",
                "python", "java", "react", "angular", "sql", "node", "database", "api", "c#", "golang"
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

            # Minimum 2 canonical skills to capture realistic pairs
            if len(canonical_skills) < 2:
                continue

            skills_list = sorted(list(canonical_skills))
            matched_roles = classify_role_broad(meta["title"], canonical_skills)
            if not matched_roles:
                continue

            job_counter += 1
            item = {
                "job_id": job_counter,
                "title": meta["title"],
                "skills": skills_list,
                "is_entry": meta["is_entry"],
            }

            for r in matched_roles:
                records_by_role_and_exp[r]["all"].append(item)
                if meta["is_entry"]:
                    records_by_role_and_exp[r]["entry"].append(item)
            retained_transactions += 1

        print(f"  Processed {skills_scanned} skill records... Retained {retained_transactions} clean IT transactions.")

    # Export clean transactions to JSON
    output_json = PROCESSED_DIR / "clean_transactions.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(records_by_role_and_exp, f, indent=2)

    # Print summary statistics
    summary = {}
    print("\n=== Dataset Preprocessing Complete (Broadened IT Ingestion) ===")
    for role, modes in records_by_role_and_exp.items():
        all_count = len(modes["all"])
        entry_count = len(modes["entry"])
        summary[role] = {"all": all_count, "entry": entry_count}
        print(f"Track: {role:22s} | Entry-Level: {entry_count:6d} postings | Total Benchmark: {all_count:6d} postings")

    summary_file = PROCESSED_DIR / "clean_summary.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
        
    print(f"\nArtifacts saved to:\n  - {output_json}\n  - {summary_file}")
    return summary


if __name__ == "__main__":
    build_clean_dataset()
