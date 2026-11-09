"""Focused checks for masked-skill evaluation methodology."""

from eclat_algorithm.evaluation import _masked_hits


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
