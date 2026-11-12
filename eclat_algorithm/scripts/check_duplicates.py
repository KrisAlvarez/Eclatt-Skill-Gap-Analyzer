"""Audit retained records and recreate evaluation splits without changing data."""

import argparse
import csv
import hashlib
import json
import platform
import random
from collections import Counter
from itertools import combinations
from pathlib import Path

from eclat_algorithm.evaluation import MAX_TEST_TRANSACTIONS, _split

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TRANSACTIONS_FILE = PROCESSED_DIR / "clean_transactions.json"
REPORT_FILE = PROCESSED_DIR / "data_audit.json"
SAMPLE_FILE = BASE_DIR / "data" / "classification_review.csv"


def file_sha256(path):
    with path.open("rb") as file:
        return hashlib.file_digest(file, "sha256").hexdigest()


def record_identity(record):
    return record.get("source_posting_id", str(record["job_id"]))


def content_signature(record):
    # Same content is a duplicate candidate, not proof of one source posting.
    return (record["title"].strip().casefold(), tuple(sorted(set(record["skills"]))))


def audit_dataset(data, seed=42):
    report = {"retained_records": 0, "entry_records": 0, "roles": {}, "cross_track_id_overlap": {}}
    role_ids = {}
    for role, modes in data.items():
        records = modes["all"]
        entry = modes["entry"]
        ids = [record_identity(record) for record in records]
        role_ids[role] = set(ids)
        entry_ids = {record_identity(record) for record in entry}
        flagged_ids = {record_identity(record) for record in records if record["is_entry"]}
        signatures = Counter(content_signature(record) for record in records)
        eligible = [record for record in records if len(set(record["skills"])) >= 3]
        report["retained_records"] += len(records)
        report["entry_records"] += len(entry)
        modes_audit = {}
        for mode in ("entry", "all"):
            eligible_mode = [record for record in modes[mode] if len(set(record["skills"])) >= 3]
            mode_train, mode_test = _split(eligible_mode, seed)
            mode_test = mode_test[:MAX_TEST_TRANSACTIONS]
            mode_train_ids = {record_identity(record) for record in mode_train}
            mode_train_signatures = {content_signature(record) for record in mode_train}
            modes_audit[mode] = {
                "train_record_ids": [record_identity(record) for record in mode_train],
                "evaluated_test_record_ids": [record_identity(record) for record in mode_test],
                "train_test_id_overlap": len(mode_train_ids & {record_identity(record) for record in mode_test}),
                "test_records_with_title_and_skill_match_in_train": sum(content_signature(record) in mode_train_signatures for record in mode_test),
            }
        report["roles"][role] = {
            "all_records": len(records),
            "entry_records": len(entry),
            "duplicate_record_ids": len(ids) - len(set(ids)),
            "duplicate_title_and_skill_excess_records": sum(count - 1 for count in signatures.values()),
            "entry_membership_mismatches": len(entry_ids ^ flagged_ids),
            "records_missing_source_identity": sum(not record.get("source_posting_id") for record in records),
            "minimum_skills": min((len(set(record["skills"])) for record in records), default=0),
            "evaluation_eligible_records": len(eligible),
            "evaluation_splits": modes_audit,
        }
    for left, right in combinations(role_ids, 2):
        report["cross_track_id_overlap"][f"{left} / {right}"] = len(role_ids[left] & role_ids[right])
    report["split_protocol"] = {
        "python_version": platform.python_version(),
        "seed": seed, "training_fraction": 0.8, "minimum_skills": 3,
        "max_test_records": MAX_TEST_TRANSACTIONS, "mask_seed": seed + 2,
        "masking": "One random skill per test posting, preserving stored canonical skill order",
        "grouping": "Randomized record split; no source-posting, employer, or temporal grouping",
    }
    report["limitations"] = [
        "Synthetic job_id uniqueness and zero track overlap do not validate role labels or source deduplication.",
        "Matching titles and skill lists are duplicate candidates; different postings can have identical content.",
        "Missing source identities prevent verifying source-posting overlap across splits.",
        "Dataset title identifies 2024; retained records do not establish collection dates or geographic coverage.",
        "Human classification results apply only to completed labels in the retained sample; see human_classification_review.",
    ]
    report["artifacts"] = {
        path.relative_to(BASE_DIR).as_posix(): {"sha256": file_sha256(path)}
        for path in [TRANSACTIONS_FILE, PROCESSED_DIR / "clean_summary.json", PROCESSED_DIR / "evaluation_metrics.json",
                     BASE_DIR / "eclat_algorithm" / "builder.py", BASE_DIR / "eclat_algorithm" / "taxonomy.py",
                     BASE_DIR / "eclat_algorithm" / "evaluation.py",
                     BASE_DIR / "eclat_algorithm" / "recommendation.py",
                     PROCESSED_DIR / "rules.json", Path(__file__)] if path.exists()
    }
    return report


def write_review_sample(data, path, seed=42):
    """Prepare five entry and five other retained records per role for human review."""
    if path.exists():
        raise FileExistsError(f"Review sheet exists; preserving labels in {path}")
    rng = random.Random(seed)
    selected = []
    for role, modes in data.items():
        for is_entry in (True, False):
            candidates = [record for record in modes["all"] if record["is_entry"] == is_entry]
            selected.extend(rng.sample(candidates, min(5, len(candidates))))
    rng.shuffle(selected)
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["record_id", "title", "skills", "human_role", "human_entry_level", "reviewer", "reason"])
        writer.writeheader()
        for record in selected:
            writer.writerow({"record_id": record_identity(record), "title": record["title"], "skills": "; ".join(record["skills"])})


def review_results(data, path):
    """Compare only completed human labels; never substitute generated labels."""
    records = {
        record_identity(record): (role, record["is_entry"])
        for role, modes in data.items() for record in modes["all"]
    }
    results = {"status": "pending_human_review", "sample_records": 0, "reviewed_records": 0,
               "role_agreements": 0, "entry_level_agreements": 0, "disagreements": []}
    if not path.exists():
        return results
    with path.open(encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            results["sample_records"] += 1
            human_role = row["human_role"].strip()
            human_entry = row["human_entry_level"].strip().lower()
            if not human_role or not human_entry or not row["reviewer"].strip():
                continue
            if human_role not in {*data, "Other", "Uncertain"}:
                raise ValueError(f"Invalid human_role for {row['record_id']}: {human_role}")
            if human_entry not in {"true", "false", "uncertain"}:
                raise ValueError(f"Invalid human_entry_level for {row['record_id']}: {human_entry}")
            predicted_role, predicted_entry = records[row["record_id"]]
            results["reviewed_records"] += 1
            results["role_agreements"] += int(predicted_role == human_role)
            entry_agrees = human_entry == str(predicted_entry).lower()
            results["entry_level_agreements"] += int(entry_agrees)
            if predicted_role != human_role or not entry_agrees:
                results["disagreements"].append({
                    "record_id": row["record_id"], "predicted_role": predicted_role,
                    "human_role": human_role, "predicted_entry_level": predicted_entry,
                    "human_entry_level": human_entry, "reviewer": row["reviewer"],
                    "reason": row["reason"],
                })
    if results["reviewed_records"]:
        results["status"] = "partially_reviewed"
        if results["reviewed_records"] == results["sample_records"]:
            results["status"] = "reviewed_retained_sample_only"
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-report", action="store_true", help="Write data_audit.json and prepare a review CSV if absent")
    args = parser.parse_args()
    data = json.loads(TRANSACTIONS_FILE.read_text(encoding="utf-8"))
    report = audit_dataset(data)
    if args.write_report and not SAMPLE_FILE.exists():
        write_review_sample(data, SAMPLE_FILE)
    report["human_classification_review"] = review_results(data, SAMPLE_FILE)
    for role, result in report["roles"].items():
        print(f"{role}: all={result['all_records']}, entry={result['entry_records']}, duplicate IDs={result['duplicate_record_ids']}, identical title/skill excess={result['duplicate_title_and_skill_excess_records']}")
        for mode, split in result["evaluation_splits"].items():
            print(f"  {mode}: train={len(split['train_record_ids'])}, test={len(split['evaluated_test_record_ids'])}, matching title/skills across split={split['test_records_with_title_and_skill_match_in_train']}")
    if args.write_report:
        REPORT_FILE.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print(f"Saved {REPORT_FILE.relative_to(BASE_DIR)}; review sheet at {SAMPLE_FILE.relative_to(BASE_DIR)} (existing labels preserved)")


if __name__ == "__main__":
    main()
