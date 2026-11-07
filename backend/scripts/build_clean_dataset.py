"""Backward-compatibility shim for backend.scripts.build_clean_dataset.

Redirects directly to eclat_algorithm.builder.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from eclat_algorithm.builder import build_clean_dataset

if __name__ == "__main__":
    build_clean_dataset()
