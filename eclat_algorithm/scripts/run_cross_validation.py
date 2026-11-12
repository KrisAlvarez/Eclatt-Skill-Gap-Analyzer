"""CLI script to run the five-fold masked-skill cross-validation."""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from eclat_algorithm.evaluation import run_cross_validation

if __name__ == "__main__":
    run_cross_validation()
