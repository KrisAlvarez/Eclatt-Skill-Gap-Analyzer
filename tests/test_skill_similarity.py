"""Training-only cosine and A3 ranking contracts."""
import math
from eclat_algorithm.assessment import fit_similarity,rank_similarity

def test_cosine_counts_unique_postings_and_is_symmetric():
    counts,similarity = fit_similarity([['A','A','B'],['A','C']])
    assert counts['A']==2 and counts['B']==1
    assert math.isclose(similarity['A']['B'],1/math.sqrt(2))
    assert similarity['A']['B']==similarity['B']['A']
    assert similarity.get('B',{}).get('C',0)==0
    assert 'ValidationOnly' not in counts

def test_similarity_excludes_inputs_and_returns_unique_training_candidates():
    counts,similarity = fit_similarity([['SQL','Python'],['SQL','Python'],['Git','Docker']])
    result = rank_similarity({},counts,similarity,['SQL','Unseen'])
    assert result['similarity'][0]=='Python'
    for ranking in result.values():
        assert set(ranking)<=set(counts)-{'SQL'}
        assert len(ranking)==len(set(ranking))
    assert result==rank_similarity({},counts,similarity,['SQL','Unseen'])

def test_empty_training_and_alphabetical_ties():
    assert all(not r for r in rank_similarity({}, {}, {}, ['SQL']).values())
    counts,similarity = fit_similarity([['B'],['A']])
    assert all(r==['A','B'] for r in rank_similarity({},counts,similarity,[]).values())
