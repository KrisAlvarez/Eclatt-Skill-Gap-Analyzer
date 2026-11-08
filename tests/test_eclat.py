"""Unit Tests for ECLAT Miner, Rule Generation, and Fallback Cascade."""

import pytest
from eclat_algorithm.miner import ECLATMiner
from eclat_algorithm.taxonomy import normalize_skill
from eclat_algorithm.builder import classify_role_broad


@pytest.fixture
def sample_transactions():
    """Toy market basket of IT skills for deterministic testing."""
    return [
        ["Python", "Django", "PostgreSQL", "Docker"],
        ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
        ["Python", "Django", "PostgreSQL"],
        ["JavaScript", "React", "HTML", "CSS"],
        ["JavaScript", "TypeScript", "React", "CSS"],
        ["Python", "FastAPI", "Docker", "Redis"],
        ["Python", "PostgreSQL", "Docker"],
        ["JavaScript", "React", "TypeScript", "Node.js"],
        ["Python", "Django", "Docker"],
        ["Python", "FastAPI", "PostgreSQL", "Redis"],
    ]


def test_tid_list_construction(sample_transactions):
    miner = ECLATMiner(sample_transactions, min_support=0.30)
    assert miner.n_transactions == 10
    # Python is in 7 transactions (indices 0, 1, 2, 5, 6, 8, 9)
    assert len(miner.tid_lists["Python"]) == 7
    # Docker is in 5 transactions
    assert len(miner.tid_lists["Docker"]) == 5


def test_eclat_frequent_itemsets(sample_transactions):
    miner = ECLATMiner(sample_transactions, min_support=0.30)
    frequent = miner.mine()
    
    # {Python, Docker} occurs in 5 transactions -> support 0.50 >= 0.30
    py_docker = frozenset(["Python", "Docker"])
    assert py_docker in frequent
    assert frequent[py_docker] == 5

    # {Python, PostgreSQL, Docker} occurs in 3 transactions -> support 0.30 >= 0.30
    triplet = frozenset(["Python", "PostgreSQL", "Docker"])
    assert triplet in frequent
    assert frequent[triplet] == 3


def test_rule_generation_metrics(sample_transactions):
    miner = ECLATMiner(sample_transactions, min_support=0.30)
    rules = miner.generate_rules(min_confidence=0.50, min_lift=1.0)
    assert len(rules) > 0

    for r in rules:
        assert r["confidence"] >= 0.50
        assert r["lift"] >= 1.0
        assert "antecedent" in r
        assert "consequent" in r
        assert "category" in r


def test_recommendation_tier1_exact_match(sample_transactions):
    miner = ECLATMiner(sample_transactions, min_support=0.30)
    miner.generate_rules(min_confidence=0.40, min_lift=1.0)
    
    # Exact antecedent match test
    res = miner.recommend(["Python", "PostgreSQL"], top_k=3)
    assert len(res["recommendations"]) > 0
    if res["tier_used"] == "Tier 1: Exact Match":
        assert any(r["skill"] in ["Docker", "Django", "FastAPI"] for r in res["recommendations"])


def test_recommendation_tier2_sublattice(sample_transactions):
    miner = ECLATMiner(sample_transactions, min_support=0.30)
    miner.generate_rules(min_confidence=0.40, min_lift=1.0)

    # Input has an unseen 3-skill combination: ["Python", "Docker", "Rust"]
    # "Rust" is unseen, but subset ["Python", "Docker"] should match!
    res = miner.recommend(["Python", "Docker", "Rust"], top_k=3)
    assert len(res["recommendations"]) > 0
    assert res["sub_lattice_used"] is True
    assert res["tier_used"] == "Tier 2: Sub-Lattice Complement"


def test_recommendation_tier3_cold_start(sample_transactions):
    miner = ECLATMiner(sample_transactions, min_support=0.30)
    miner.generate_rules(min_confidence=0.40, min_lift=1.0)

    # Cold start: 0 skills entered
    res = miner.recommend([], top_k=3)
    assert len(res["recommendations"]) == 3
    assert res["tier_used"] == "Tier 3: Foundational Prior"
    # Most frequent skills in sample is Python (7)
    assert res["recommendations"][0]["skill"] == "Python"


def test_skill_normalization():
    assert normalize_skill(" react.js ") == "React"
    assert normalize_skill("REST APIs") == "REST API"
    assert normalize_skill("not-a-taxonomy-skill") == ""


def test_role_assignment_is_primary_and_ambiguous_jobs_are_excluded():
    assert classify_role_broad(
        "Senior Backend Engineer",
        {"Python", "PostgreSQL", "Docker"},
    ) == ["Backend Developer"]
    assert classify_role_broad(
        "Technical Specialist",
        {"Python", "JavaScript"},
    ) == []
