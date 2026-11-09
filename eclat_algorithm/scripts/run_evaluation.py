"""CLI script to run the held-out masked-skill evaluation."""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from eclat_algorithm.evaluation import run_evaluation

if __name__ == "__main__":
    run_evaluation()
