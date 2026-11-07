"""CLI script to run ECLAT offline rule mining across all roles."""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from eclat_algorithm.runner import run_eclat_offline

if __name__ == "__main__":
    run_eclat_offline()
