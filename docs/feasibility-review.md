> Cleanup update: historical raw experiment outputs were consolidated into [experiment_summary.json](../data/processed/experiment_summary.json). Final runnable model/protocol are in `eclat_algorithm/assessment.py` and `data/processed/assessment_protocol.json`. Earlier source hashes below identify historical artifacts, not the current compact package.

# Plan B - Feasibility review and instructor decision brief

Prepared: 2026-11-13. Decision status: **Awaiting instructor decision**.

## Finding

The current evidence does not support HR@10 >= 85% in every role/experience group. Controlled ranking, mining and similarity experiments improved recovery, but the selected ECLAT-centered method passes only the two Data groups. This does not prove the target is impossible for every model or dataset; it establishes that the tested approaches have not met it. ECLAT remains central and the production application has not adopted the experimental methods.

The requirement remains single-hidden-skill recovery within ten suggestions, with at least 85% separately in all six groups. An overall average, classification accuracy, rule confidence, or a different cutoff is not a substitute.

## Strongest observations and remaining gaps

| Group | Level | Best observed validation HR@10, including baselines | Method | Shortfall below 85% (percentage points) |
|---|---|---:|---|---:|
| Backend Developer | entry | 63.24% | A3 similarity | 21.76 |
| Backend Developer | all | 62.03% | A3 similarity | 22.97 |
| Frontend Developer | entry | 82.91% | A3 eclat_heavy | 2.09 |
| Frontend Developer | all | 78.22% | A3 similarity | 6.78 |
| Data Analyst | entry | 88.03% | A3 similarity | 0.00 |
| Data Analyst | all | 86.96% | A3 similarity | 0.00 |

These are descriptive per-group maxima across repeated validation comparisons, not one selected deployable model or an independent test result. Similarity alone is a comparison baseline and cannot be relabeled ECLAT. The single selected ECLAT-centered method remains A3 balanced evidence (25% ECLAT / 50% similarity / 25% popularity):

| Group | Level | Selected method HR@10 | Shortfall (percentage points) |
|---|---|---:|---:|
| Backend Developer | entry | 61.69% | 23.31 |
| Backend Developer | all | 60.10% | 24.90 |
| Frontend Developer | entry | 82.41% | 2.59 |
| Frontend Developer | all | 77.63% | 7.37 |
| Data Analyst | entry | 87.01% | 0.00 |
| Data Analyst | all | 86.39% | 0.00 |

Numerical sources: [initial validation](../data/processed/experiment_summary.json), [A2 mining results](../data/processed/experiment_summary.json), and [A3 similarity results](../data/processed/experiment_summary.json). A2 completed all 16 configurations and 288 workers; A3 used the same 18 frozen folds. The original [test benchmark](../data/processed/evaluation_metrics.json) is preserved and separate.

## Evidence-backed limitations

| Finding | Evidence | Interpretation |
|---|---|---|
| Mixed role scope | [builder.py](../eclat_algorithm/builder.py), `classify_role_broad`, explicitly includes data engineer/scientist titles in the Data bucket; [classification scope review](classification-review.md) contains examples. | Narrow occupation names can overstate the precision of broad skill groups. This is a scope issue, not a measured population error rate. |
| Missing original identity/metadata | Current [transactions](../data/processed/clean_transactions.json) contain 44,441 all-level records; all lack `source_posting_id`. Original source job-level metadata is not retained in these legacy records. [Data documentation](../data/README.md) describes provenance limits. | Current source deduplication and original seniority decisions cannot be fully replayed. Future builder support does not retroactively restore evidence. |
| Duplicate candidates | [Data audit](../data/processed/data_audit.json): repeated title/skill excess is 4,875 Backend, 260 Frontend, and 2,559 Data. All-level test records matching training content number 997, 59, and 423 respectively. | Matching content is not proof of the same vacancy, but the old outer split is not independent by that content grouping. Inner validation groups these records together. |
| Recovery/ranking limits | [Failure analysis](final-evaluation.md) found short lists and missing artifact candidates; A2/A3 expanded candidates cover over 98% of hidden validation skills in each group. | The remaining shortfall is not merely an absent-vocabulary problem. Availability does not establish that the answer can be ranked in ten positions. |
| Coverage is not established | [Data documentation](../data/README.md) and [source notes](../data/raw/README.md). | Source version, precise collection window and geographic coverage cannot be inferred from the retained file or dataset title. Insufficient relevant coverage is a hypothesis to investigate, not a proven cause of the scores. |

Entry subsets are nested in all-level data, so groups are not independent datasets. Original data totals of 44,441 retained postings and 3,454 entry-flagged postings are not confirmed employer requirements or beginner suitability. Repeated validation-based model selection may overfit the folds. These results do not measure learner usefulness or hiring outcomes.

## Proposal for better data - approval required

1. **Define the cohort before scoring.** Retain the six groups and the existing task. Specify inclusion rules for role duties, mixed occupations and seniority. Use original title, duties and seniority metadata; leave unresolved cases explicitly unresolved. Do not remove hard cases because the model misses them.
2. **Identify a reproducible source.** Record dataset identifier/version, retrieval date, file hashes, source documentation, collection window and geographic coverage when supported. Identify the available source before committing to counts or a collection schedule. No source download or scraping is included in this phase.
3. **Preserve audit fields.** Retain hashed original posting identity, original title and seniority, available duties/description, source dates/location, raw-to-canonical skill mapping, classifier version and inclusion/exclusion reason. Never invent missing fields.
4. **Audit duplicate candidates.** Resolve exact source identities and group matching title/skill content. Record uncertain duplicates. Assign connected groups to partitions globally before creating nested entry/all subsets, so one posting does not migrate between development and assessment.
5. **Prepare independent assessment data.** Keep training/validation separate from newly obtained assessment records. Exclude known overlaps with existing development data. Fix cohort definitions, masking seed, cutoff and selection rules before assessment. Data volumes and timing remain dependent on source availability and instructor approval.
6. **Rebuild in versioned outputs only after approval.** Preserve current data, mining artifacts and benchmark; produce a separate versioned dataset and audit. First verify cohort composition, mappings and identity/group separation, then rerun training/validation. Stronger data hygiene may lower apparent scores.
7. **Assess the frozen candidate once.** Report exact hits/denominators, HR@10 and uncertainty per group, plus popularity and ECLAT comparisons. Require the agreed 85% point estimate in each group; do not introduce a confidence-bound acceptance rule without separate agreement. More or cleaner data does not guarantee the target.

## Instructor discussion brief

Suggested statement:

> Our project must recover one hidden skill within ten suggestions for at least 85% of cases in each of six groups. We preserved the original benchmark and tested ranking, mining limits, and skill similarity using grouped validation within training data. The selected ECLAT-centered model reaches 61.69%, 60.10%, 82.41%, 77.63%, 87.01%, and 86.39%. It therefore does not meet the full requirement. We request a decision on a separate data-provenance/cohort improvement phase, with ECLAT retained and the current results preserved. We cannot promise that a new dataset will reach 85%.

Discuss these choices with the instructor; none is presumed approved:

| Decision | Consequence |
|---|---|
| Approve a better-data/cohort investigation while retaining the current requirement | Identify a source and review a concrete collection/rebuild proposal before modifying data. The target remains unmet until assessed. |
| Approve an academically justified scope or assessment change | Record exactly what changes and why, keep earlier results visible, and design the new protocol before experiments. Do not present different metrics as the old 85% result. |
| Retain the current scope and data | Preserve the best honest results and mark the requirement unmet. No unsupported passing conclusion. |

Decision record (complete only when an actual response is received):

| Field | Recorded value |
|---|---|
| Status | Awaiting instructor decision |
| Decision date / decision maker | Not provided |
| Approved option and rationale | Not provided |
| Confirmed metric, threshold, six-group rule | Current requirement: HR@10 >= 85% in every group; no change approved |
| Authorized data source, cohort, resource/time limits | Not provided |
| Next permitted implementation action | None beyond this documentation phase |

No message has been sent to the instructor. The decision-record checklist item stays pending.

## Verification and stopping point

The numerical tables were generated from current experiment JSON, not copied from rounded prose. Per-group maxima include baselines explicitly; gaps use unrounded stored rates. All six group orders were checked across reports, and protected hashes were checked. This documentation-only phase does not require new model tests or a frontend build. Earlier recorded 45-test validation belongs to A3 and is not a new test run.

Current retained evidence snapshot (historical experiments are consolidated):

| Artifact | SHA-256 |
|---|---|
| [experiment_summary.json](../data/processed/experiment_summary.json) | `e5ae4b99439fd5191af04cfc02a90caec8d88cf109eb3f3cd48aa2044ff03517` |
| [assessment_protocol.json](../data/processed/assessment_protocol.json) | `2fe17e3ed1d987555e781df80b15487a05a09e0b0a98a50cf8cc8aff4b3fd88d` |
| [multiple_hidden_validation.json](../data/processed/multiple_hidden_validation.json) | `789a3b1aadfaf67ef59009dc51ecdb4b0b55470b5da1e00e9c9df735160bab84` |
| [multiple_hidden_test.json](../data/processed/multiple_hidden_test.json) | `f3de4afbbdc4b9c6eab4a5eb97698ef5c1a68427eef90536f499e0d00e2c61d0` |
| [clean_transactions.json](../data/processed/clean_transactions.json) | `affc2f9be5158783718cdafba79399f3d87cd7daef6040f15de6545ed1359a8f` |
| [rules.json](../data/processed/rules.json) | `1a1f3a838f0c7cea5c8f79aa1589b80bdd4d2e9250e1272eb64c78606ad8ff45` |
| [evaluation_metrics.json](../data/processed/evaluation_metrics.json) | `f7f709d84337f9bda469d541600cf7a09ef3109a2800bfe8ca070973f2275bc4` |
| [data_audit.json](../data/processed/data_audit.json) | `aa589351cd4d2282eb1e67f8f7aa9b2dd6fd3a5c6f0ceec67ad78a9bb75cfc5f` |

Instructor decision, data rebuild and experimental model integration remain pending. The original website remains unchanged.
