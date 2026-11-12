"""Two-hidden-skill masking and metric denominators."""
import random
import pytest
from eclat_algorithm.assessment import mask_two,score_predictions,summarize

def test_masking_is_distinct_deterministic_and_leaves_input():
    inputs,hidden=mask_two(['SQL','SQL','Git','Python'],random.Random(44))
    assert len(hidden)==2 and len(inputs)==1
    assert not set(inputs)&hidden
    assert set(inputs)|hidden=={'SQL','Git','Python'}
    assert (inputs,hidden)==mask_two(['SQL','SQL','Git','Python'],random.Random(44))
    with pytest.raises(ValueError):mask_two(['SQL','SQL','Git'],random.Random(44))

@pytest.mark.parametrize('predictions,hits,precision,recall',[
    ([],0,0,0),(['A'],1,.1,.5),(['A','A','B'],1,.2,1),(['C'],0,0,0)])
def test_exact_metric_denominators(predictions,hits,precision,recall):
    scores=summarize({'model':score_predictions(predictions,{'A','B'})})['model']
    assert scores['hit_at_10']==hits
    assert scores['precision_at_10']==precision
    assert scores['recall_at_10']==recall

def test_ranks_beyond_ten_do_not_count():
    count=score_predictions([str(i) for i in range(10)]+['A','B'],{'A','B'})
    assert count['recovered_skills']==0
    assert count['returned_count']==10


def test_five_item_cutoff_differs_from_ten():
    scores=summarize({'m':score_predictions(['0','1','2','3','4','A','B'],{'A','B'})})['m']
    assert scores['hit_at_5']==scores['precision_at_5']==scores['recall_at_5']==0
    assert scores['hit_at_10']==1
    assert scores['precision_at_10']==.2
    assert scores['recall_at_10']==1
    scores=summarize({'m':score_predictions(['A'],{'A','B'})})['m']
    assert scores['hit_at_5']==1
    assert scores['precision_at_5']==.2
    assert scores['recall_at_5']==.5


def test_fifteen_cutoff_preserves_ten_and_uses_fifteen_denominator():
    predictions=[str(i) for i in range(10)]+['A','B']
    old=summarize({'m':score_predictions(predictions,{'A','B'})})['m']
    new=summarize({'m':score_predictions(predictions,{'A','B'},maximum=15)})['m']
    assert all(new[k]==v for k,v in old.items())
    assert new['hit_at_15']==1
    assert new['precision_at_15']==2/15
    assert new['recall_at_15']==1
    assert new['mean_returned_count_at_15']==12
    outside=summarize({'m':score_predictions([str(i) for i in range(15)]+['A'],{'A','B'},maximum=15)})['m']
    assert outside['hit_at_15']==0


def test_twelve_cutoff_and_fixed_denominator():
    predictions=[str(i) for i in range(10)]+['A','B']
    old=summarize({'m':score_predictions(predictions,{'A','B'},maximum=10)})['m']
    scores=summarize({'m':score_predictions(predictions,{'A','B'},maximum=15)})['m']
    assert all(scores[k]==v for k,v in old.items())
    assert scores['hit_at_12']==1
    assert scores['precision_at_12']==2/12
    assert scores['recall_at_12']==1
    outside=summarize({'m':score_predictions([str(i) for i in range(12)]+['A'],{'A','B'},maximum=15)})['m']
    assert outside['hit_at_12']==0 and outside['hit_at_15']==1
