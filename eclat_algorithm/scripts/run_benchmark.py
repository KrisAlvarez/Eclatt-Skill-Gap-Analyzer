"""Run the reproducible production benchmark pipeline.

This command rebuilds the production rule artifact, runs the holdout report,
runs five-fold validation, and prints the configured category HR@4 target.
"""

import argparse
import sys
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from eclat_algorithm.evaluation import (
    TARGET_METRIC,
    TARGET_THRESHOLD,
    run_cross_validation,
    run_evaluation,
)
from eclat_algorithm.runner import run_eclat_offline


def _print_summary(results: List[Dict[str, Any]]) -> None:
    print("\nCategory recovery target")
    print(f"Metric: {TARGET_METRIC}")
    print(f"Threshold: {TARGET_THRESHOLD:.0%}")
    print("-" * 72)
    for result in results:
        metric = result["metrics"][TARGET_METRIC]["mean"]
        status = "PASS" if result["target_achieved"] else "FAIL"
        print(
            f"{result['role']:<22} {result['experience_mode']:<5} "
            f"{metric:>6.1%}  {status}"
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Rebuild rules and run the complete HR@4 benchmark."
    )
    parser.add_argument(
        "--skip-mining",
        action="store_true",
        help="Use the existing rules.json instead of rebuilding it.",
    )
    args = parser.parse_args()

    if not args.skip_mining:
        run_eclat_offline()
    run_evaluation()
    validation_results = run_cross_validation()
    _print_summary(validation_results)


if __name__ == "__main__":
    main()
