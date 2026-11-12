"""Dataset Preprocessing and Broadened IT Role Classification Pipeline.

Exclusively relies on the 'asaniczka/1-3m-linkedin-jobs-and-skills-2024' dataset.
Ingests all authentic IT, software development, full-stack, cloud, and data positions
from the 1.3M LinkedIn dataset (~144K tech pool), while strictly filtering out
non-software engineering titles (mechanical, civil, chemical, healthcare, etc.).
Maps positions to Backend, Frontend, and Data Analyst domains based on stack co-occurrence,
lowers skill threshold to >= 2 canonical skills, and re-mines ECLAT models.
"""

import json
import hashlib
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Set
import pandas as pd

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
    "NestJS", "Django", "FastAPI", "Flask", "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB",
    "BigQuery", "NoSQL", "MariaDB", "Supabase", "Neo4j", "Firebase",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Microservices", "REST API", "GraphQL",
    "Kafka", "RabbitMQ", "Celery", "Linux", "CI/CD", "Terraform", "Ansible", "Jenkins",
    "Git", "GitHub Actions", "GitLab CI", "Nginx", "Apache", "Helm", "DevOps", "Cloud Computing",
    "OpenShift", "Prometheus", "Grafana", "Swagger", "Postman", "Testing & QA", "Automation",
    "Jira", "Agile", "Cybersecurity", "Networking", "Bash", "PowerShell"
}

FRONTEND_STACK: Set[str] = {
    "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Redux", "WebSockets", "jQuery",
    "React Native", "Flutter", "Electron", "Testing & QA", "Automation", "Git", "Jira", "Agile"
}

DATA_STACK: Set[str] = {
    "SQL", "Python", "R", "Pandas", "NumPy", "Tableau", "Power BI", "Excel",
    "Snowflake", "Spark", "Airflow", "Hadoop", "Scikit-learn", "Microsoft SQL Server",
    "Elasticsearch", "BigQuery", "NoSQL", "Machine Learning", "Data Visualization",
    "PyTorch", "TensorFlow", "Keras"
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
    import kagglehub

    dataset_dir = Path(kagglehub.dataset_download(DATASET_NAME))
    return dataset_dir


def classify_role_broad(title: str, skills_set: Set[str]) -> List[str]:
    """Assign one defensible primary track instead of duplicating a posting."""
    t_lower = title.lower()
    scores = {
        "Backend Developer": len(skills_set & BACKEND_STACK),
        "Frontend Developer": len(skills_set & FRONTEND_STACK),
        "Data Analyst": len(skills_set & DATA_STACK),
    }

    explicit = {
        "Backend Developer": bool(re.search(
            r"\b(backend|back-end|api|cloud engineer|devops|software engineer|"
            r"software developer|systems engineer|platform engineer)\b", t_lower
        )),
        "Frontend Developer": bool(re.search(
            r"\b(frontend|front-end|ui engineer|ui developer|react developer|"
            r"vue developer|angular developer|web developer|javascript developer|"
            r"mobile developer)\b", t_lower
        )),
        "Data Analyst": bool(re.search(
            r"\b(data analyst|business intelligence|bi analyst|sql analyst|"
            r"analytics|data specialist|reporting analyst|data engineer|"
            r"data scientist|machine learning)\b", t_lower
        )),
    }

    for role, matched in explicit.items():
        if matched:
            scores[role] += 4

    # Generic software titles need a stack signal, otherwise they are not
    # assigned to a specialized track merely because they mention "software".
    ranked = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    best_role, best_score = ranked[0]
    second_score = ranked[1][1]
    if best_score < 2 or best_score == second_score:
        return []
    return [best_role]


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
                "source_posting_id": hashlib.sha256(str(link).encode("utf-8")).hexdigest(),
                "source_job_level": meta["exp_level"],
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

    # Capture the actual resolved download and input hashes; do not infer them
    # later from the dataset title or the processed row count.
    def fingerprint(path):
        digest = hashlib.sha256()
        with path.open("rb") as file:
            for block in iter(lambda: file.read(1024 * 1024), b""):
                digest.update(block)
        return {"name": path.name, "sha256": digest.hexdigest(), "bytes": path.stat().st_size}

    provenance = {
        "dataset": DATASET_NAME,
        "resolved_directory": str(dataset_dir),
        "source_files": [fingerprint(postings_path), fingerprint(skills_path)],
        "pipeline_files": [fingerprint(Path(__file__)), fingerprint(Path(__file__).with_name("taxonomy.py"))],
        "postings_rows_scanned": total_postings,
        "candidate_posting_links": len(matched_jobs),
        "skills_rows_scanned": skills_scanned,
        "retained_records": retained_transactions,
        "limit_rows": limit_rows,
        "output": fingerprint(output_json),
        "source_identity": "SHA-256 of exact source job_link; synthetic job_id retained for compatibility",
        "deduplication": "Posting metadata keyed by job_link; repeated skill rows are not deduplicated",
        "classification": "One primary role or excluded tie; entry flag uses job_level/title with senior title veto",
        "geographic_coverage": "Not established; locations not retained",
        "collection_dates": "Not established from processed records",
    }
    with (PROCESSED_DIR / "dataset_provenance.json").open("w", encoding="utf-8") as file:
        json.dump(provenance, file, indent=2)
        
    print(f"\nArtifacts saved to:\n  - {output_json}\n  - {summary_file}")
    return summary


if __name__ == "__main__":
    build_clean_dataset()
