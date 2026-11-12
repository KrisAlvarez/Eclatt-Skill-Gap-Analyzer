"""Focused checks for masked-skill evaluation methodology."""

from eclat_algorithm.evaluation import (
    TARGET_METRIC,
    TARGET_THRESHOLD,
    _cross_validation_folds,
    _masked_hits,
    evaluate_role_mode,
)
from eclat_algorithm.recommendation import recommend_from_artifact


def test_non_trivial_frequency_uses_training_population_denominator():
    training = [
        ["Docker", "SQL"],
        ["SQL", "Git"],
        ["SQL", "Git"],
        ["SQL", "Git"],
    ]
    mode_data = {
        "total_transactions": 4,
        "rules": [],
        "top_1_itemsets": [
            {"skill": "Git", "category": "DevOps & Cloud", "support": 0.75, "count": 3}
        ],
    }

    # Docker appears in 25% of training postings but 100% of this one-row test
    # sample. Seed 1 masks Docker, so the training denominator must classify it
    # as non-trivial despite its frequency in the test sample.
    result = _masked_hits(
        mode_data,
        [["Docker", "SQL"]],
        ["SQL", "Git", "Docker"],
        training,
        seed=1,
    )

    assert result["non_trivial_total"] == 1


def test_target_is_explicit_in_evaluation_results():
    result = evaluate_role_mode([], "Backend Developer", "entry")

    assert result["target_metric"] == "eclat_category_hr_at_4"
    assert result["target_threshold"] == TARGET_THRESHOLD
    assert result["target_achieved"] is False
    assert result["target_gap"] == -TARGET_THRESHOLD


def test_cross_validation_handles_empty_input():
    assert _cross_validation_folds([], folds=5, seed=42) == []


def test_recommendations_cover_available_categories_before_repeating_one():
    result = recommend_from_artifact(
        {
            "total_transactions": 100,
            "rules": [],
            "top_1_itemsets": [
                {"skill": "Python", "category": "Programming Languages", "support": 0.8, "count": 80},
                {"skill": "React", "category": "Frameworks & Libraries", "support": 0.7, "count": 70},
                {"skill": "PostgreSQL", "category": "Databases & Storage", "support": 0.6, "count": 60},
                {"skill": "Docker", "category": "Cloud & DevOps", "support": 0.5, "count": 50},
            ],
        },
        [],
        top_k=4,
    )

    assert {item["category"] for item in result["recommendations"]} == {
        "Programming Languages",
        "Frameworks & Libraries",
        "Databases & Storage",
        "Cloud & DevOps",
    }
