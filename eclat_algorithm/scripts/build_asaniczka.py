"""Pipeline to process the asaniczka 1.3M dataset and align ECLAT models.

Streams linkedin_job_postings.csv and job_skills.csv from kagglehub cache,
filters by IT career tracks (Backend, Frontend, Data Analyst) and seniority (Entry vs All),
normalizes skills to canonical taxonomy, and re-mines the ECLAT rule base and evaluation benchmarks.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from eclat_algorithm.builder import build_clean_dataset
from eclat_algorithm.runner import run_eclat_offline
from eclat_algorithm.evaluation import run_evaluation

def process_asaniczka():
    print("=== Processing asaniczka 1.3M dataset ===")
    build_clean_dataset()
    print("\n=== Re-mining ECLAT rules & train/test evaluation ===")
    run_eclat_offline()
    run_evaluation()
    print("\nAll ECLAT models and evaluation benchmarks successfully updated and aligned!")

if __name__ == "__main__":
    process_asaniczka()
