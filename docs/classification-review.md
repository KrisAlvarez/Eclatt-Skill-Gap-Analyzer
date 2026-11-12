# Strict review of the SkillGap classification sample

Reviewed 2026-11-10 by Codex (AI reviewer). This is an AI-assisted evidence review, not independent human validation. The original human-review sheet remains blank. The reviewer had prior project context, so this should not be described as a fully blinded review.

## Verdict

The current records are not sufficient to validate three precise occupational labels or the entry-level cohort. The review raises substantial scope and evidence concerns. An exploratory tool can use broad skill-pattern buckets, but their names and explanations must accurately describe the mix included.

[The AI review CSV](../data/classification_ai_review.csv) contains an assessment, reason, and reference URLs for every sampled record. [The human sheet](../data/classification_review.csv) is preserved for a person to review separately.

## Review policy and references

The strict interpretation used here is the app's advertised Backend Developer, Frontend Developer, and Data Analyst roles. `Other` means evidence points to a different occupation or an explicitly mixed full-stack role; `Uncertain` means the available title and canonical skills do not settle the classification. These judgments are inferences about incomplete records, not verified original job duties.

1. [BLS: Web developers](https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm) describes different frontend and backend responsibilities. I use those duties as an anchor and decline to force explicitly full-stack titles into a single narrow label. This treatment of mixed roles is a review-policy choice, not a BLS rule requiring exclusion.
2. [O*NET: Business Intelligence Analysts](https://www.onetonline.org/link/summary/15-2051.01) provides an anchor for reporting and business-data analysis. [O*NET: Data Scientists](https://www.onetonline.org/link/summary/15-2051.00), [UK Government: Data engineer](https://understand-digital-data-roles-skills.service.gov.uk/role/data-engineer/), and [O*NET: Data Warehousing Specialists](https://www.onetonline.org/link/summary/15-1243.01) distinguish adjacent data work. Shared Python, SQL, or visualization tools do not establish identical duties.
3. [BLS: Electrical and electronics engineers](https://www.bls.gov/ooh/architecture-and-engineering/electrical-and-electronics-engineers.htm) and [Computer systems analysts](https://www.bls.gov/ooh/computer-and-information-technology/computer-systems-analysts.htm) help identify occupations outside the advertised tracks.
4. [UK Government: DevOps engineer](https://understand-digital-data-roles-skills.service.gov.uk/role/development-operations-devops-engineer/) provides an infrastructure/tooling comparison. I infer that platform/support titles need duties before being treated as application-backend roles.
5. [UK Government: Software developer levels](https://understand-digital-data-roles-skills.service.gov.uk/role/software-developer/) distinguishes junior, senior, and lead responsibilities. I treat explicit Senior/Sr./Lead wording as evidence against entry; this does not verify experience requirements. Unqualified or Associate titles remain uncertain without duties and original seniority metadata. The UK framework does not define every employer's use of Associate.

These US/UK occupational references support definitions. They do not establish SkillGap's geographic coverage, employer requirements, or the exact historical role of any sampled posting. No exact source vacancy was recovered. References were accessed on 2026-11-10.

## Sample results

| Assessment | Records |
|---|---:|
| Current role supported under the strict policy | 4 |
| Current role challenged by a different or mixed role | 15 |
| Primary role unresolved | 11 |
| Explicit non-entry title signal | 10 |
| Entry-level status unresolved | 20 |
| Entry-level status affirmatively established | 0 |

This is not a claim that classifier accuracy is 4/30 or that 15 records are all proven errors. The 15 challenges combine clear scope failures with taxonomy-policy differences. In particular, the implementation intentionally groups data scientists/engineers and full-stack work into broader buckets. If broad buckets are the intended product, the remedy may be naming and disclosure rather than deleting records.

All 15 sampled entry-flagged records remain unresolved for entry suitability; none has enough retained evidence for me to affirm early-career requirements. Thirteen lack junior title signals. The remaining two say Associate, which is insufficient to establish responsibilities. Missing original `job_level` prevents checking whether those flags were justified by source metadata. This is an evidence gap, not proof that all 15 are false positives.

The sample deliberately contains five entry-flagged and five other records per track. It excludes rejected postings and is not proportional to the source. It cannot estimate population error rates or false-negative recall. Agreement with an AI reviewer is not human validation.

## Findings requiring attention

| Severity | Record | Finding and evidence |
|---|---|---|
| High | 1008608, Electrical Engineer, Avionics | Assigned Backend with only Automation and Networking. The title identifies another engineering domain. The exclusion regex matches electrical technician, but not electrical engineer. This is a concrete filtering gap. |
| High | 1023032 and 1034568, Data Scientist; 1036786 and 1023299, Data Engineer | All assigned Data Analyst. These are intentional broad-bucket assignments, but the displayed occupation name overstates specificity. |
| High | 1025122, Sr. Health Equity Data Project Manager | Assigned Data Analyst from a management title and only visualization/Excel evidence. Analyst duties are not established. |
| Medium | 1001291, 1004141, 1001513, 1005576, 1038162 | Explicitly full-stack work is forced into Frontend or Backend. Useful mixed skill evidence can be retained, but a dominant occupational role is not demonstrated. |
| Medium | 1040773, Lead Platform Engineer; 1028475, Support Engineer | Infrastructure/support evidence is pooled into Backend. Shared technologies do not establish application-development responsibilities. |
| Medium | 1004630, 1003515, 1021821, 1014533, 1021160, 1040291, 1013556, 1008386, 1001397, 1017335, 1021410 | The primary specialization is unresolved from title and skills. Additional original responsibilities are needed. |

I replayed the current role heuristic on all 30 records and reproduced all 30 stored role assignments. That shows the labels follow the implementation; it does not validate the occupational labels. The electrical title also currently passes the non-IT exclusion regex. Code evidence: [builder.py](../eclat_algorithm/builder.py), specifically `RE_NON_IT_EXCLUDE`, `classify_role_broad`, and `is_entry_level`.

## Recommendations for the exploratory product

1. Decide and document whether each selector denotes a precise occupation or a broad pattern bucket. For broad buckets, use names such as Backend and infrastructure patterns, Web and interface patterns, and Data and analytics patterns, with mixed occupations clearly disclosed. These are proposed names, not implemented changes.
2. Prioritize the clear electrical-engineering and project-management scope failures. Review exclusion boundaries against retained examples before rebuilding; do not discard all mixed IT work solely because it spans layers.
3. Preserve `Other`, mixed, and uncertain cases in the audit process rather than forcing every candidate into one of three jobs. Keep the current dataset until a reviewed replacement can be compared.
4. Describe the entry subset as flagged from source labels/title signals until original duties and seniority evidence are available. Use uncertainty rather than treating no senior keyword as positive junior evidence.
5. Recover the original source identity, responsibilities, and metadata for sampled records. Have a qualified person label them independently, including rejected examples in a subsequent audit. Adjudicate disagreements before claiming accuracy or using the labels to tune the classifier.
6. Rebuild and reevaluate only after the scope and labeling policy are approved. Changing a cohort changes the mined patterns and benchmark population.

## Status and validation

AI review is complete for 30/30 sampled records. Human validation and legacy-source provenance remain pending in Phase 3. Phase 4 has not started. Source transactions, the human sheet, model rules, and metrics were preserved. Checked unique IDs, source-title/skill correspondence, complete reasons and references, review counts, and replay of current role assignments. No implementation changes or build were needed for this review.
