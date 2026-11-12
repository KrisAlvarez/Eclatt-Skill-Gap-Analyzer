# HR@10 validation and held-out assessment

Fixed experimental model: balanced evidence (25% ECLAT, 50% cosine similarity, 25% popularity), selected A2 mining settings. Exactly two hidden skills per posting; precision denominator ten and recall denominator two. Original 80/20 split seed 42, test masking seed 44.

| Role | Level | CV Hit@10 | Test n | Test Hit@10 | Test Precision@10 | Test Recall@10 | Popularity Test Hit@10 |
|---|---|---:|---:|---:|---:|---:|---:|
| Backend Developer | entry | 82.71% | 275 | 79.27% | 11.89% | 59.45% | 70.91% |
| Backend Developer | all | 79.85% | 4,760 | 80.55% | 11.69% | 58.46% | 66.20% |
| Frontend Developer | entry | 95.48% | 50 | 92.00% | 15.60% | 78.00% | 94.00% |
| Frontend Developer | all | 94.37% | 466 | 93.35% | 15.09% | 75.43% | 92.70% |
| Data Analyst | entry | 96.20% | 172 | 95.35% | 17.15% | 85.76% | 94.19% |
| Data Analyst | all | 96.66% | 1,839 | 96.68% | 16.80% | 84.01% | 92.93% |

Four groups exceed 85% Test Hit@10; both Backend groups fall short. This result does not meet the every-group condition. The original single-hidden-skill benchmark is separate and unchanged. Instructor acceptance of the two-hidden-skill protocol remains pending.

The original test partition was excluded from inner validation/model fitting, but its earlier single-hidden-skill metrics were already inspected. It is not fresh independent data. Original random-split duplicate candidates remain: matching title/skill counts are recorded per group in the raw test report. These are not proof of identical source vacancies. Entry and all-level populations overlap. No model retuning or source cleanup was applied after these test results.

Sources: [validation report](../data/processed/multiple_hidden_validation.json), [held-out report](../data/processed/multiple_hidden_test.json), [original benchmark](../data/processed/evaluation_metrics.json). Production still serves its original cascade; experimental scores do not describe a deployed model.

Reproduce the saved assessment without overwriting it:

```powershell
.venv\Scripts\python.exe eclat_algorithm/scripts/evaluate_heldout_skills.py --verify
```

Without `--verify`, the script refuses to overwrite an existing assessment. Read the saved JSON to display results without recomputing. No test cutoff above ten is selected here.

Final implementation: [assessment.py](../eclat_algorithm/assessment.py), with [frozen protocol](../data/processed/assessment_protocol.json). All retained validation and held-out metrics reproduced exactly after consolidation.
