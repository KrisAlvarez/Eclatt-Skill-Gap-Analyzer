"""Generate the current evaluation matrix from frozen assessment reports."""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List

BASE_DIR = Path(__file__).resolve().parents[2]
PROCESSED_DIR = BASE_DIR / "data" / "processed"

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


def load_report(path: Path) -> Dict[str, Any]:
    try:
        with path.open(encoding="utf-8") as handle:
            report = json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        raise SystemExit(f"Could not read evaluation report {path}: {exc}") from exc

    if not isinstance(report.get("groups"), list):
        raise SystemExit(f"Evaluation report has no groups list: {path}")
    return report


def build_matrix(validation: Dict[str, Any], test: Dict[str, Any]) -> List[Dict[str, Any]]:
    validation_groups = {
        (group["role"], group["experience_mode"]): group
        for group in validation["groups"]
    }
    matrix = []

    for test_group in test["groups"]:
        key = (test_group["role"], test_group["experience_mode"])
        validation_group = validation_groups.get(key)
        if validation_group is None:
            raise SystemExit(
                "Missing validation group for "
                f"{test_group['role']} ({test_group['experience_mode']})"
            )

        validation_scores = validation_group["scores"]["balanced_evidence"]
        test_scores = test_group["scores"]["balanced_evidence"]
        popularity_scores = test_group["scores"]["popularity"]
        matrix.append(
            {
                "role": test_group["role"],
                "level": test_group["experience_mode"],
                "cv_hit_at_10": validation_scores["hit_at_10"],
                "test_n": test_scores["total"],
                "test_hit_at_10": test_scores["hit_at_10"],
                "test_precision_at_10": test_scores["precision_at_10"],
                "test_recall_at_10": test_scores["recall_at_10"],
                "popularity_test_hit_at_10": popularity_scores["hit_at_10"],
            }
        )

    return matrix


def percent(value: float) -> str:
    return f"{value:.2%}"


def markdown(matrix: Iterable[Dict[str, Any]]) -> str:
    rows = [
        "| Role | Level | CV Hit@10 | Test n | Test Hit@10 | "
        "Test Precision@10 | Test Recall@10 | Popularity Test Hit@10 |",
        "|---|---|---:|---:|---:|---:|---:|---:|",
    ]
    for row in matrix:
        rows.append(
            f"| {row['role']} | {row['level']} | "
            f"{percent(row['cv_hit_at_10'])} | {row['test_n']} | "
            f"{percent(row['test_hit_at_10'])} | "
            f"{percent(row['test_precision_at_10'])} | "
            f"{percent(row['test_recall_at_10'])} | "
            f"{percent(row['popularity_test_hit_at_10'])} |"
        )
    return "\n".join(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--validation",
        type=Path,
        default=PROCESSED_DIR / "multiple_hidden_validation.json",
        help="Frozen validation report JSON",
    )
    parser.add_argument(
        "--test",
        type=Path,
        default=PROCESSED_DIR / "multiple_hidden_test.json",
        help="Frozen held-out test report JSON",
    )
    parser.add_argument(
        "--format",
        choices=("markdown", "json"),
        default="markdown",
        help="Output format",
    )
    args = parser.parse_args()

    matrix = build_matrix(load_report(args.validation), load_report(args.test))
    if args.format == "json":
        print(json.dumps(matrix, indent=2))
    else:
        print(markdown(matrix))


if __name__ == "__main__":
    main()
