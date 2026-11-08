"""Shim redirecting to eclat_algorithm.scripts.check_dataset2."""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import eclat_algorithm.scripts.check_dataset2
