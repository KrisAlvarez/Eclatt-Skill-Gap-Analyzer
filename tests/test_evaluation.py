"""Focused checks for masked-skill evaluation methodology."""

import pytest

from eclat_algorithm.evaluation import _masked_hits, evaluate_role_mode


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


@pytest.mark.parametrize("rank", [1, 3, 5, 6, 10, 11, 20, 21])
def test_hit_rate_cutoffs_for_both_methods(rank):
    ranked = [f"Candidate {i}" for i in range(20)]
    ranked.insert(rank - 1, "Docker")
    artifact = {
        "total_transactions": 100,
        "rules": [],
        "top_1_itemsets": [
            {"skill": skill, "category": "DevOps & Cloud", "support": 0.5, "count": 50}
            for skill in ranked[:20]
        ],
    }
    result = _masked_hits(artifact, [["Docker", "SQL", "Git"]], ranked,
                          [["Docker", "SQL", "Git"]], seed=1)
    assert result["total"] == 1
    for method in ("eclat", "baseline"):
        for cutoff in (3, 5, 10, 20):
            assert result[f"{method}_at_{cutoff}"] == int(rank <= cutoff)


@pytest.mark.parametrize("cutoff", [10, 20])
def test_insufficient_training_data_has_zero_rates(cutoff):
    result = evaluate_role_mode([], "Backend Developer", "entry")
    for method in ("eclat", "baseline"):
        assert result[f"{method}_hr_at_{cutoff}"] == 0.0
        assert result[f"{method}_hr_at_{cutoff}_ci95"] == [0.0, 0.0]
