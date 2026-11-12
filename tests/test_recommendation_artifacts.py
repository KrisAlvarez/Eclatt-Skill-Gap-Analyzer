"""Contracts for A2 settings and incomplete-comparison selection."""
from eclat_algorithm.recommendation import build_mode_artifact

def test_artifact_defaults_and_cap_overrides():
    rows = [['Python','SQL','Git']]*10 + [['Docker','Git']]*10
    original = build_mode_artifact(rows,'entry')
    explicit = build_mode_artifact(rows,'entry',parameters=(.05,.35,1.15),max_rules=2000,max_rules_per_antecedent=25)
    assert original == explicit
    capped = build_mode_artifact(rows,'entry',max_rules=1,max_rules_per_antecedent=1)
    assert len(capped['rules']) <= 1
    assert original['top_1_itemsets'] == capped['top_1_itemsets']

def test_lower_support_exposes_rare_training_skill_without_changing_defaults():
    rows = [['Git','SQL']]*97 + [['Git','Python']]*3
    original = build_mode_artifact(rows,'entry')
    relaxed = build_mode_artifact(rows,'entry',parameters=(.01,.35,1.15))
    assert 'Python' not in {r['skill'] for r in original['top_1_itemsets']}
    assert 'Python' in {r['skill'] for r in relaxed['top_1_itemsets']}
    assert build_mode_artifact(rows,'entry') == original
