"""Checks for provenance reporting without claiming source deduplication."""

import csv
import hashlib
import json

import pytest

from eclat_algorithm.scripts.check_duplicates import (
    audit_dataset,
    review_results,
    write_review_sample,
)


def sample_data():
    return {
        "Backend Developer": {
            "all": [
                {"job_id": index, "title": "Developer", "skills": ["Python", "SQL", "Git"], "is_entry": index < 5}
                for index in range(10)
            ],
            "entry": [
                {"job_id": index, "title": "Developer", "skills": ["Python", "SQL", "Git"], "is_entry": True}
                for index in range(5)
            ],
        }
    }


def test_audit_distinguishes_synthetic_identity_from_matching_content():
    report = audit_dataset(sample_data())
    role = report["roles"]["Backend Developer"]

    assert role["duplicate_record_ids"] == 0
    assert role["duplicate_title_and_skill_excess_records"] == 9
    assert role["records_missing_source_identity"] == 10
    assert role["entry_membership_mismatches"] == 0
    assert role["evaluation_splits"]["all"]["train_test_id_overlap"] == 0
    assert role["evaluation_splits"]["all"]["test_records_with_title_and_skill_match_in_train"] == 2


def test_review_sample_requires_human_labels_and_preserves_existing_sheet(tmp_path):
    data = sample_data()
    path = tmp_path / "review.csv"
    write_review_sample(data, path)
    before = path.read_bytes()
    review = review_results(data, path)
    assert review["sample_records"] == 10
    assert review["reviewed_records"] == 0
    assert review["status"] == "pending_human_review"
    with pytest.raises(FileExistsError):
        write_review_sample(data, path)
    assert path.read_bytes() == before

    with path.open(newline="", encoding="utf-8") as file:
        rows = list(csv.DictReader(file))
    rows[0].update(human_role="Other", human_entry_level="uncertain", reviewer="Test reviewer")
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=rows[0])
        writer.writeheader()
        writer.writerows(rows)
    review = review_results(data, path)
    assert review["reviewed_records"] == 1
    assert review["status"] == "partially_reviewed"
    assert len(review["disagreements"]) == 1


def test_future_build_captures_source_identity_and_manifest(tmp_path, monkeypatch):
    from eclat_algorithm import builder

    source = tmp_path / "source"
    output = tmp_path / "processed"
    source.mkdir()
    output.mkdir()
    link = "https://example.com/jobs/123"
    (source / "linkedin_job_postings.csv").write_text(
        f"job_link,job_title,job_level\n{link},Junior Backend Developer,Entry level\n",
        encoding="utf-8",
    )
    (source / "job_skills.csv").write_text(
        f'job_link,job_skills\n{link},"Python, SQL, Git"\n', encoding="utf-8"
    )
    monkeypatch.setattr(builder, "get_dataset_directory", lambda: source)
    monkeypatch.setattr(builder, "PROCESSED_DIR", output)

    builder.build_clean_dataset()

    data = json.loads((output / "clean_transactions.json").read_text())
    record = data["Backend Developer"]["all"][0]
    assert record["source_posting_id"] == hashlib.sha256(link.encode()).hexdigest()
    assert record["source_job_level"] == "Entry level"
    provenance = json.loads((output / "dataset_provenance.json").read_text())
    assert provenance["postings_rows_scanned"] == 1
    assert provenance["skills_rows_scanned"] == 1
    assert provenance["retained_records"] == 1
    assert len(provenance["source_files"]) == 2
    assert all(len(file["sha256"]) == 64 for file in provenance["source_files"])
