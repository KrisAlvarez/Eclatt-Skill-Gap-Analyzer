"""Offline frozen assessment; separate from production recommendation serving."""
import hashlib
import json
import math
import random
from collections import Counter,defaultdict
from itertools import combinations
from pathlib import Path
from eclat_algorithm.evaluation import _split
from eclat_algorithm.recommendation import build_mode_artifact,index_rules,MAX_RULE_ANTECEDENT_SIZE
from eclat_algorithm.scripts.check_duplicates import record_identity,content_signature
BASE=Path(__file__).resolve().parent.parent
PROCESSED=BASE/'data/processed'
PROTOCOL=PROCESSED/'assessment_protocol.json'
VALIDATION=PROCESSED/'multiple_hidden_validation.json'
TEST=PROCESSED/'multiple_hidden_test.json'

def mask_two(skills, rng):
    unique = list(dict.fromkeys(skills))
    if len(unique) < 3:
        raise ValueError('Two hidden skills require at least three unique skills')
    hidden = set(rng.sample(unique, 2))
    return ([s for s in unique if s not in hidden], hidden)

def score_predictions(predictions, hidden, maximum=10):
    if len(set(hidden)) != 2:
        raise ValueError('This experiment requires exactly two distinct hidden skills')
    unique = list(dict.fromkeys(predictions))[:maximum]
    recovered = len(set(unique[:10]) & set(hidden))
    recovered_at_5 = len(set(unique[:5]) & set(hidden))
    counts = Counter(total=1, hit_cases=int(recovered > 0), recovered_skills=recovered, returned_count=len(unique[:10]), hit_cases_at_5=int(recovered_at_5 > 0), recovered_skills_at_5=recovered_at_5)
    if maximum >= 15:
        recovered_at_15 = len(set(unique[:15]) & set(hidden))
        counts.update(hit_cases_at_15=int(recovered_at_15 > 0), recovered_skills_at_15=recovered_at_15, returned_count_at_15=len(unique[:15]))
    if maximum >= 12:
        recovered_at_12 = len(set(unique[:12]) & set(hidden))
        counts.update(hit_cases_at_12=int(recovered_at_12 > 0), recovered_skills_at_12=recovered_at_12, returned_count_at_12=len(unique[:12]))
    return counts

def summarize(counts):
    return {m: {**dict(c), 'hit_at_5': c['hit_cases_at_5'] / c['total'], 'precision_at_5': c['recovered_skills_at_5'] / (5 * c['total']), 'recall_at_5': c['recovered_skills_at_5'] / (2 * c['total']), 'hit_at_10': c['hit_cases'] / c['total'], 'precision_at_10': c['recovered_skills'] / (10 * c['total']), 'recall_at_10': c['recovered_skills'] / (2 * c['total']), **({'hit_at_12': c['hit_cases_at_12'] / c['total'], 'precision_at_12': c['recovered_skills_at_12'] / (12 * c['total']), 'recall_at_12': c['recovered_skills_at_12'] / (2 * c['total']), 'mean_returned_count_at_12': c['returned_count_at_12'] / c['total']} if 'hit_cases_at_12' in c else {}), **({'hit_at_15': c['hit_cases_at_15'] / c['total'], 'precision_at_15': c['recovered_skills_at_15'] / (15 * c['total']), 'recall_at_15': c['recovered_skills_at_15'] / (2 * c['total']), 'mean_returned_count_at_15': c['returned_count_at_15'] / c['total']} if 'hit_cases_at_15' in c else {}), 'mean_returned_count': c['returned_count'] / c['total']} for m, c in counts.items()}

def fit_similarity(transactions):
    frequencies = Counter()
    pairs = Counter()
    for row in transactions:
        skills = sorted(set(row))
        frequencies.update(skills)
        pairs.update(combinations(skills, 2))
    similarity = defaultdict(dict)
    for (a, b), count in pairs.items():
        score = count / math.sqrt(frequencies[a] * frequencies[b])
        similarity[a][b] = similarity[b][a] = score
    return (frequencies, similarity)

def rank_similarity(rule_index, frequencies, similarity, inputs, top_k=20):
    possessed = set(inputs)
    candidates = sorted(set(frequencies) - possessed)
    evidence = defaultdict(float)
    for size in range(1, min(len(possessed), MAX_RULE_ANTECEDENT_SIZE) + 1):
        for subset in combinations(sorted(possessed), size):
            for rule in rule_index.get(subset, []):
                target = rule['consequent'][0]
                if target not in possessed:
                    evidence[target] += rule['support'] * rule['confidence'] * max(rule['lift'] - 1, 0)
    related = {s: sum((similarity.get(s, {}).get(i, 0) for i in possessed)) / max(len(possessed), 1) for s in candidates}
    maxima = (max((evidence[s] for s in candidates), default=0) or 1, max(related.values(), default=0) or 1, max((frequencies[s] for s in candidates), default=0) or 1)
    results = {'similarity': sorted(candidates, key=lambda s: (-related[s], s))[:top_k]}
    for method, (rw, sw, pw) in WEIGHTS.items():
        scores = {s: rw * evidence[s] / maxima[0] + sw * related[s] / maxima[1] + pw * frequencies[s] / maxima[2] for s in candidates}
        results[method] = sorted(candidates, key=lambda s: (-scores[s], s))[:top_k]
    return results

WEIGHTS={"balanced_evidence":(.25,.5,.25)}


def assess(partition, write=False):
    """Reproduce a frozen result; never tune settings from held-out outcomes."""
    if partition not in ('validation','test'):
        raise ValueError('Partition must be validation or test')
    output = VALIDATION if partition == 'validation' else TEST
    if write and output.exists():
        raise FileExistsError('Assessment exists; use verification mode to preserve its result')
    protocol=json.loads(PROTOCOL.read_text(encoding='utf-8'))
    if protocol['cutoff']!=10 or protocol['hidden_skills']!=2:
        raise ValueError('Final protocol requires HR@10 and two hidden skills')
    if tuple(protocol['model']['weights'][k] for k in ('eclat','similarity','popularity'))!=WEIGHTS['balanced_evidence']:
        raise ValueError('Frozen model weights changed')
    hashes=protocol['protected_artifact_sha256']
    for path,expected in hashes.items():
        if hashlib.sha256((BASE/path).read_bytes()).hexdigest()!=expected:
            raise ValueError(f'Protected artifact changed: {path}')
    data=json.loads((PROCESSED/'clean_transactions.json').read_text(encoding='utf-8'))
    groups=[]
    for group in protocol['groups']:
        records=[r for r in data[group['role']][group['experience_mode']] if len(set(r['skills']))>=3]
        outer_train,outer_test=_split(records,42)
        if [record_identity(r) for r in outer_train]!=group['outer_train_record_ids']:
            raise ValueError('Frozen outer training membership changed')
        jobs=group['folds'] if partition=='validation' else [{'fold':0,'mask_seed':44,'validation_record_ids':[record_identity(r) for r in outer_test]}]
        by_id={record_identity(r):r for r in records}
        totals={m:Counter() for m in ('balanced_evidence','popularity')}
        folds=[]
        for job in jobs:
            val_ids=job['validation_record_ids'];val=set(val_ids)
            train_ids=[rid for rid in group['outer_train_record_ids'] if rid not in val]
            if val & set(train_ids):raise ValueError('Training/evaluation ID overlap')
            if partition=='validation':
                train_content={content_signature(by_id[rid]) for rid in train_ids}
                val_content={content_signature(by_id[rid]) for rid in val_ids}
                if train_content & val_content:raise ValueError('Validation content overlap')
                train_source={by_id[rid]['source_posting_id'] for rid in train_ids if by_id[rid].get('source_posting_id')}
                val_source={by_id[rid]['source_posting_id'] for rid in val_ids if by_id[rid].get('source_posting_id')}
                if train_source & val_source:raise ValueError('Validation source overlap')
            train=[list(dict.fromkeys(by_id[rid]['skills'])) for rid in train_ids]
            config=protocol['model']
            artifact=build_mode_artifact(train,group['experience_mode'],parameters=(config['support'],config['confidence'],config['lift']),max_rules=config['max_rules'],max_rules_per_antecedent=config['max_rules_per_antecedent'])
            frequencies,cosine=fit_similarity(train)
            rule_index=index_rules(artifact)
            rng=random.Random(job['mask_seed']);masks=[]
            counts={m:Counter() for m in totals}
            for rid in val_ids:
                inputs,hidden=mask_two(by_id[rid]['skills'],rng)
                masks.append((rid,sorted(hidden)))
                predictions=rank_similarity(rule_index,frequencies,cosine,inputs,top_k=10)['balanced_evidence']
                popular=sorted((s for s in frequencies if s not in inputs),key=lambda s:(-frequencies[s],s))[:10]
                for method,skills in [('balanced_evidence',predictions),('popularity',popular)]:
                    if set(inputs)&set(skills):raise ValueError('Input recommended')
                    counts[method].update(score_predictions(skills,hidden))
            mask_hash=hashlib.sha256(json.dumps(masks).encode()).hexdigest()
            if partition=='validation' and mask_hash!=job['masked_pairs_sha256']:
                raise ValueError('Frozen validation masks changed')
            for method in totals:totals[method].update(counts[method])
            folds.append({'fold':job['fold'],'mask_seed':job['mask_seed'],'scores':summarize(counts),'masked_pairs_sha256':mask_hash})
        result={'role':group['role'],'experience_mode':group['experience_mode'],'scores':summarize(totals)}
        if partition=='validation':result['folds']=folds
        else:
            signatures={content_signature(r) for r in outer_train}
            result.update(train_count=len(outer_train),test_count=len(outer_test),test_record_ids=[record_identity(r) for r in outer_test],masked_pairs_sha256=folds[0]['masked_pairs_sha256'],test_records_matching_training_content=sum(content_signature(r) in signatures for r in outer_test))
        groups.append(result)
        print(group['role'],group['experience_mode'],result['scores']['balanced_evidence']['hit_at_10'],flush=True)
    report={'protocol':{'partition':partition,'hidden_skills':2,'cutoff':10,'independent_fresh_data':False,'assessment_replacement_approved':False,'model':protocol['model']},'groups':groups,'limitations':['Experimental offline model differs from current production cascade.','Existing test benchmark was previously inspected; original random split can contain duplicate candidates.','Entry and all-level populations overlap; source identities are incomplete.','Two-hidden-skill acceptance remains subject to instructor approval.'],'protected_artifact_sha256':hashes,'pipeline_sha256':{'eclat_algorithm/assessment.py':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}}
    if output.exists():
        saved=json.loads(output.read_text(encoding='utf-8'))
        for current,prior in zip(groups,saved['groups']):
            for method in totals:
                for key,value in current['scores'][method].items():
                    if prior['scores'][method][key]!=value:raise ValueError('Stored metric did not reproduce')
            if partition=='test' and current['masked_pairs_sha256']!=prior['masked_pairs_sha256']:raise ValueError('Test masks changed')
    for path,expected in hashes.items():
        if hashlib.sha256((BASE/path).read_bytes()).hexdigest()!=expected:raise ValueError('Protected file changed')
    if write:output.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    return report
