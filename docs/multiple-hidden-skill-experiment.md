# Two-hidden-skill evaluation

The final chosen cutoff is HR@10. See [the validation/test table](final-evaluation.md), [saved validation](../data/processed/multiple_hidden_validation.json), [saved test assessment](../data/processed/multiple_hidden_test.json), and [frozen protocol](../data/processed/assessment_protocol.json).

The fixed experimental model is separate from production. Exactly two posting skills are hidden; Hit@10 counts recovery of at least one, Precision@10 divides recovered skills by ten, and Recall@10 divides by two. Use `eclat_algorithm/scripts/evaluate_multiple_hidden_skills.py --verify` to reproduce validation and `evaluate_heldout_skills.py --verify` to reproduce the held-out result without overwriting it.

Historical cutoff comparisons and the synthetic demonstration are retained in [the compact experiment summary](../data/processed/experiment_summary.json). They do not replace the original benchmark or change assessment approval. No synthetic records enter either final report.
