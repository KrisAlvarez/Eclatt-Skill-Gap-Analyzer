# Raw Dataset Directory

This project relies exclusively on the **1.3M LinkedIn Jobs & Skills (2024)** dataset by `asaniczka`:
- **Kaggle Identifier**: `asaniczka/1-3m-linkedin-jobs-and-skills-2024`
- **Volume**: 1,348,454 job postings and 1,296,381 skill records
- **Automated Management**: The dataset is downloaded and cached automatically via `kagglehub`:
  ```python
  import kagglehub
  path = kagglehub.dataset_download("asaniczka/1-3m-linkedin-jobs-and-skills-2024")
  ```

No legacy manual files are stored in this folder. All extraction, classification, and ECLAT association mining pipelines stream directly from the `kagglehub` cache into `data/processed/`.
