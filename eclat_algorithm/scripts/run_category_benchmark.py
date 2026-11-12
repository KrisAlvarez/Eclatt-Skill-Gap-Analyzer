"""Run category-only HR@3 and HR@4 reports for test and cross-validation data."""

import sys
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from eclat_algorithm.evaluation import run_cross_validation, run_evaluation


def _print_holdout(results: List[Dict[str, Any]]) -> None:
    print("\nHeld-out test category recovery")
    print("-" * 72)
    for result in results:
        print(
            f"{result['role']:<22} {result['experience_mode']:<5} "
            f"HR@3={result['eclat_category_hr_at_3']:.1%} "
            f"HR@4={result['eclat_category_hr_at_4']:.1%} "
            f"test={result['test_transactions_count']}"
        )


def _print_cross_validation(results: List[Dict[str, Any]]) -> None:
    print("\nFive-fold cross-validation category recovery")
    print("-" * 72)
    for result in results:
        metrics = result["metrics"]
        print(
            f"{result['role']:<22} {result['experience_mode']:<5} "
            f"HR@3={metrics['eclat_category_hr_at_3']['mean']:.1%} "
            f"HR@4={metrics['eclat_category_hr_at_4']['mean']:.1%} "
            f"folds={result['folds']}"
        )


def main() -> None:
    _print_holdout(run_evaluation())
    _print_cross_validation(run_cross_validation())


if __name__ == "__main__":
    main()
