# Raw Dataset Directory

This project relies exclusively on the **1.3M LinkedIn Jobs & Skills (2024)** dataset by `asaniczka`:
- **Kaggle Identifier**: `asaniczka/1-3m-linkedin-jobs-and-skills-2024`
- **Reported source volume**: 1,348,454 job postings and 1,296,381 skill records. Raw CSVs and an original build manifest are absent locally, so these totals were not independently recounted in the retained-data audit.
- **Automated Management**: The dataset is downloaded and cached automatically via `kagglehub`:
  ```python
  import kagglehub
  path = kagglehub.dataset_download("asaniczka/1-3m-linkedin-jobs-and-skills-2024")
  ```

No legacy manual files are stored in this folder. All extraction, classification, and ECLAT association mining pipelines stream directly from the `kagglehub` cache into `data/processed/`.

The dataset title identifies 2024. Exact collection dates and geographic coverage of the retained SkillGap records are not established. The downloader does not pin a version. Future builds capture the resolved cache path and file hashes in `data/processed/dataset_provenance.json`; this does not retroactively establish the version used for the current artifact. See [the data evidence guide](../README.md) for the retained counts, split audit, and pending human review.
