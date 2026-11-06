import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
raw = BASE_DIR / "data" / "raw"

print("--- Checking job_skills.csv ---")
js = pd.read_csv(raw / "job_skills.csv")
total_js = len(js)
dups_js = js.duplicated().sum()
print(f"Total rows: {total_js}")
print(f"Exact duplicate rows (job_id + skill_abr): {dups_js}")
print(f"Unique job_ids: {js['job_id'].nunique()}")

print("\n--- Checking skills.csv ---")
sk = pd.read_csv(raw / "skills.csv")
print(f"Total rows: {len(sk)}")
print(f"Exact duplicate rows: {sk.duplicated().sum()}")
print(f"Unique skill_abr: {sk['skill_abr'].nunique()}")

print("\n--- Checking postings.csv (chunked check for duplicates) ---")
chunk_size = 100000
seen_ids = set()
dup_ids_count = 0
total_postings = 0

for chunk in pd.read_csv(raw / "postings.csv", usecols=["job_id"], chunksize=chunk_size):
    total_postings += len(chunk)
    for jid in chunk["job_id"]:
        if jid in seen_ids:
            dup_ids_count += 1
        else:
            seen_ids.add(jid)

print(f"Total postings rows: {total_postings}")
print(f"Duplicate job_id rows: {dup_ids_count}")
print(f"Unique postings: {len(seen_ids)}")
