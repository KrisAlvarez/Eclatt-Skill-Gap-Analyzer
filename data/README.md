# SkillGap data and evidence

SkillGap explores skill mentions in the historical `asaniczka/1-3m-linkedin-jobs-and-skills-2024` dataset. The source title identifies 2024; the retained records do not establish exact collection dates, geographic coverage, or the current job market.

## Source and retained counts

The source totals documented in [raw/README.md](raw/README.md) are **1,348,454 postings** and **1,296,381 skill rows**. They are reported source totals, not independent recounts in this audit: the raw CSVs and the original build manifest are unavailable locally.

Counts below were recounted from [processed/clean_transactions.json](processed/clean_transactions.json) and match [processed/clean_summary.json](processed/clean_summary.json):

| Assigned track | Retained records (`all`) | Entry-flagged subset (`entry`) |
|---|---:|---:|
| Backend Developer | 28,388 | 1,724 |
| Frontend Developer | 2,520 | 292 |
| Data Analyst | 13,533 | 1,438 |
| Total | 44,441 | 3,454 |

Entry records are included in `all`; do not add the columns. Retained records have at least two canonical skills. The masked-skill benchmark includes only records with at least three, so its denominators are smaller. These are algorithm-assigned records, not manually verified IT postings.

## How labels are assigned

[builder.py](../eclat_algorithm/builder.py) filters titles, maps supplied skill tokens to a closed taxonomy, then scores Backend, Frontend, and Data tracks using skill overlap and title bonuses. It assigns one winning track or excludes ties. Generic software engineer/developer titles receive a Backend bonus, and the broad Data track includes titles such as data engineer and data scientist. These buckets need not match occupational ground truth.

The entry flag uses `job_level` values (`associate`, `entry level`, `internship`) or junior title keywords, with senior title keywords taking precedence and excluding a record from entry. Descriptions and years of experience are not read. A false entry flag means the heuristic did not classify a record as entry; it is not proof of seniority.

## Audit and split provenance

Run from the repository root:

```powershell
.\.venv\Scripts\python.exe -m eclat_algorithm.scripts.check_duplicates --write-report
```

[processed/data_audit.json](processed/data_audit.json) records dataset/code SHA-256 hashes, recounted totals, synthetic-ID overlap, repeated title/skill content, and the exact train and evaluated-test IDs for all six segments. It reconstructs the existing evaluation split (80/20, seed 42, >=3 skills, up to 10,000 test rows). Masking uses seed 44 and stored skill order. The audit does not change transactions, splits, rules, or metrics.

The current artifact has zero repeated synthetic IDs and zero cross-track ID overlap. A one-track classifier produces that separation by design; it does not establish classification quality or source deduplication. Repeated title/skill content occurs across training and test:

| Track | Entry test records matching training title/skills | All-level test records matching training title/skills |
|---|---:|---:|
| Backend | 34 / 275 | 997 / 4,760 |
| Frontend | 2 / 50 | 59 / 466 |
| Data Analyst | 20 / 172 | 423 / 1,839 |

Matching content is a duplicate candidate, not proof of duplicate source postings. The current records lack source identities, locations, descriptions, dates, employers, and original `job_level`; source duplication, grouped split independence, and geographic representativeness remain unverified. Identical skill profiles alone are normal in association mining and do not establish leakage.

Future dataset builds preserve a SHA-256 identity derived from `job_link` and `source_job_level`, and write `processed/dataset_provenance.json` with the resolved download path, source and pipeline hashes, scan/retention counts, and processing limits. Hashing the exact source link supports same-link comparisons but does not identify reposts with different links. The builder downloads the available dataset version; the manifest records the actual resolved download rather than asserting a historical version. This has not been retroactively added to existing transactions. Metadata keyed by job link can overwrite repeated metadata rows, and skill rows are not deduplicated.

## Human classification review

[classification_review.csv](classification_review.csv) contains 30 deterministic retained records: five entry-flagged and five other records per track, sampled with seed 42 and shuffled. Predicted labels are withheld from the sheet to reduce anchoring. This balanced sample is not representative of overall class proportions and excludes rejected postings; it cannot estimate recall over the source dataset.

A human reviewer should fill:

- `human_role`: `Backend Developer`, `Frontend Developer`, `Data Analyst`, `Other`, or `Uncertain`.
- `human_entry_level`: `true`, `false`, or `uncertain`.
- `reviewer` and `reason`: reviewer identity and a short rationale, including missing evidence.

Judge only the visible title and skills, using `Uncertain` when evidence is insufficient. Original posting descriptions and seniority metadata are unavailable, so this is a retained-record review, not full source validation. Human review is pending; no classification accuracy is claimed. Rerun the audit after labeling to count agreements and list disagreements. Existing review sheets are preserved, and incomplete rows are not scored. Uncertain labels count as non-agreement rather than being silently excluded.

An AI reviewer assessed all 30 records on 2026-11-10 using occupational references. See [the review report](../docs/classification-review.md) and [row-level AI assessments](classification_ai_review.csv). Those assessments are separate from the blank human sheet and are not counted as human validation. The report challenges the specificity of the current role labels and leaves all 15 sampled entry-flagged records unresolved for entry suitability.
