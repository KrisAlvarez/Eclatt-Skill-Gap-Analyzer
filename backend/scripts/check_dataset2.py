import os
import pandas as pd
from collections import Counter
from itertools import combinations
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
raw = BASE_DIR / "data" / "raw"

# Read samples
postings = pd.read_csv(
    raw / "postings.csv",
    nrows=50000,
    usecols=['job_id', 'title', 'formatted_experience_level', 'formatted_work_type']
)
job_skills = pd.read_csv(raw / "job_skills.csv")
skills = pd.read_csv(raw / "skills.csv")

# Merge all three
merged = job_skills.merge(postings, on='job_id', how='inner').merge(skills, on='skill_abr', how='left')
print(f"Merged rows (job_skills JOIN postings JOIN skills): {len(merged)}")
print(f"Unique job_ids after merge: {merged['job_id'].nunique()}")
print()

print("=== Top 15 job titles in dataset ===")
top_titles = postings['title'].value_counts().head(15)
for t, c in top_titles.items():
    print(f"  {c:6d}  {t}")
print()

# Group by job_id and get skills per job
skill_by_job = merged.groupby('job_id').agg({
    'skill_name': list,
    'title': 'first'
}).reset_index()

print("=== Sample skill transactions by job title ===")
print(skill_by_job[['title', 'skill_name']].head(10).to_string(index=False))
print()

print("=== Top 10 skill pairs by co-occurrence ===")
cooccur = Counter()
for skills_list in skill_by_job['skill_name']:
    for pair in combinations(sorted(skills_list), 2):
        cooccur[pair] += 1
n_jobs = len(skill_by_job)
for pair, count in cooccur.most_common(10):
    print(f"  {pair[0]:30s} + {pair[1]:30s}  count={count}  support={count/n_jobs:.3f}")
