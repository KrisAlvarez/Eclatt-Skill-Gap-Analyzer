"""CLI script to build clean transactions from raw postings.csv."""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from eclat_algorithm.builder import build_clean_dataset

if __name__ == "__main__":
    build_clean_dataset()
