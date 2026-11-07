import os
import pandas as pd
from collections import defaultdict
from pathlib import Path

# Resolve data path relative to this script: ../../data/raw
BASE_DIR = Path(__file__).resolve().parent.parent.parent
raw = BASE_DIR / "data" / "raw"

# Load files
skills_path = raw / "skills.csv"
job_skills_path = raw / "job_skills.csv"

skills_df = pd.read_csv(skills_path)
job_skills_df = pd.read_csv(job_skills_path)

print("=== skills.csv ===")
print(f"Shape: {skills_df.shape}")
print(f"Columns: {list(skills_df.columns)}")
print(skills_df.to_string())

print("\n=== job_skills.csv ===")
print(f"Shape: {job_skills_df.shape}")
print(f"Columns: {list(job_skills_df.columns)}")
print("Null values:")
print(job_skills_df.isnull().sum())
print(f"Unique job_ids: {job_skills_df['job_id'].nunique()}")
print(f"Unique skill_abrs: {job_skills_df['skill_abr'].nunique()}")

print("\n=== Skill frequency (top 15) ===")
skill_counts = job_skills_df['skill_abr'].value_counts().head(15).reset_index()
skill_counts.columns = ['skill_abr', 'count']
skill_counts = skill_counts.merge(skills_df, on='skill_abr', how='left')
print(skill_counts.to_string(index=False))

print("\n=== Skills per job (transaction size stats) ===")
skills_per_job = job_skills_df.groupby('job_id')['skill_abr'].count()
print(f"Min skills per job:    {skills_per_job.min()}")
print(f"Max skills per job:    {skills_per_job.max()}")
print(f"Mean skills per job:   {skills_per_job.mean():.2f}")
print(f"Median skills per job: {skills_per_job.median():.1f}")

print("\n=== Sample transactions (5 jobs) ===")
merged_all = job_skills_df.merge(skills_df, on='skill_abr', how='left')
sample_jobs = job_skills_df['job_id'].unique()[:5]
for jid in sample_jobs:
    skills_list = merged_all[merged_all['job_id'] == jid]['skill_name'].tolist()
    print(f"  Job {jid}: {skills_list}")

print("\n=== Build ECLAT Transaction List ===")
transactions = merged_all.groupby('job_id')['skill_name'].apply(list).tolist()
print(f"Total transactions (jobs with skills): {len(transactions)}")

print("\n=== TID-list construction (ECLAT vertical format) ===")
skill_tidlists = defaultdict(set)
for tid, row in enumerate(transactions):
    for skill in row:
        skill_tidlists[skill].add(tid)

n = len(transactions)
print(f"Total transactions: {n}")
print(f"Unique skills indexed: {len(skill_tidlists)}")

print("\nTop 10 skills by support:")
supports = {s: len(tids)/n for s, tids in skill_tidlists.items()}
for s, sup in sorted(supports.items(), key=lambda x: -x[1])[:10]:
    print(f"  {s:35s} support={sup:.3f} ({sup*100:.1f}%)")

print("\n=== Pair intersection example (ECLAT core op) ===")
skill_a = "Sales"
skill_b = "Business Development"
if skill_a in skill_tidlists and skill_b in skill_tidlists:
    pair_tids = skill_tidlists[skill_a] & skill_tidlists[skill_b]
    pair_support = len(pair_tids) / n
    print(f"  {{{skill_a}}} support:                   {len(skill_tidlists[skill_a])/n:.3f}")
    print(f"  {{{skill_b}}} support:                   {len(skill_tidlists[skill_b])/n:.3f}")
    print(f"  {{{skill_a}, {skill_b}}} co-support:    {pair_support:.3f} ({pair_support*100:.1f}%)")
    conf = pair_support / (len(skill_tidlists[skill_a]) / n)
    print(f"  Confidence ({skill_a} -> {skill_b}):     {conf:.3f}")
