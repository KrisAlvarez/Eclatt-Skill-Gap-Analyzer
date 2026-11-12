"""Held-out report shape and overwrite protection."""
import json
import pytest
from eclat_algorithm import assessment

def test_existing_test_assessment_cannot_be_overwritten():
    assert assessment.TEST.exists()
    with pytest.raises(FileExistsError):
        assessment.assess("test",write=True)

def test_saved_assessment_has_separate_test_denominators():
    report=json.loads(assessment.TEST.read_text(encoding="utf-8"))
    assert len(report["groups"])==6
    assert report["protocol"]["independent_fresh_data"] is False
    for group in report["groups"]:
        for scores in group["scores"].values():
            assert scores["total"]==group["test_count"]
            assert scores["precision_at_10"]==scores["recovered_skills"]/(10*scores["total"])
            assert scores["recall_at_10"]==scores["recovered_skills"]/(2*scores["total"])


def test_frozen_validation_memberships_exclude_test_and_matching_content():
    from collections import Counter
    from eclat_algorithm.scripts.check_duplicates import record_identity,content_signature
    protocol=json.loads(assessment.PROTOCOL.read_text(encoding="utf-8"))
    data=json.loads((assessment.PROCESSED/"clean_transactions.json").read_text(encoding="utf-8"))
    tests=json.loads(assessment.TEST.read_text(encoding="utf-8"))["groups"]
    for group,test in zip(protocol["groups"],tests):
        by_id={record_identity(r):r for r in data[group["role"]][group["experience_mode"]]}
        train=set(group["outer_train_record_ids"])
        assert not train & set(test["test_record_ids"])
        assert Counter(rid for fold in group["folds"] for rid in fold["validation_record_ids"])==Counter(group["outer_train_record_ids"])
        for fold in group["folds"]:
            val=set(fold["validation_record_ids"])
            assert not {content_signature(by_id[rid]) for rid in val} & {content_signature(by_id[rid]) for rid in train-val}
