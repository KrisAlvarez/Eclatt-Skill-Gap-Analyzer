# ♻️ `backend/` — Compatibility Layer

> **Note:** The `backend/` folder is a **backward-compatibility shim layer**.
> It is preserved so that any external references (CI scripts, Render build history, legacy imports) continue to resolve, but **all real code lives in the canonical locations**:

| Old `backend/` path | Canonical new location |
| :--- | :--- |
| `backend/app/main.py` | [`server/app/main.py`](../server/app/main.py) |
| `backend/app/core/config.py` | [`server/app/config.py`](../server/app/config.py) |
| `backend/app/core/taxonomy.py` | [`eclat_algorithm/taxonomy.py`](../eclat_algorithm/taxonomy.py) |
| `backend/app/data/eclat_miner.py` | [`eclat_algorithm/miner.py`](../eclat_algorithm/miner.py) |
| `backend/app/models/schemas.py` | [`server/app/schemas/models.py`](../server/app/schemas/models.py) |
| `backend/app/routes/analyze.py` | [`server/app/routes/analyze.py`](../server/app/routes/analyze.py) |
| `backend/app/routes/roles.py` | [`server/app/routes/roles.py`](../server/app/routes/roles.py) |
| `backend/app/routes/metrics.py` | [`server/app/routes/metrics.py`](../server/app/routes/metrics.py) |
| `backend/scripts/build_clean_dataset.py` | [`eclat_algorithm/builder.py`](../eclat_algorithm/builder.py) |
| `backend/scripts/build_asaniczka.py` | [`eclat_algorithm/scripts/build_asaniczka.py`](../eclat_algorithm/scripts/build_asaniczka.py) |
| `backend/scripts/run_eclat_offline.py` | [`eclat_algorithm/runner.py`](../eclat_algorithm/runner.py) |
| `backend/scripts/run_evaluation.py` | [`eclat_algorithm/evaluation.py`](../eclat_algorithm/evaluation.py) |
| `backend/scripts/check_dataset.py` | [`eclat_algorithm/scripts/check_dataset.py`](../eclat_algorithm/scripts/check_dataset.py) |
| `backend/scripts/check_dataset2.py` | [`eclat_algorithm/scripts/check_dataset2.py`](../eclat_algorithm/scripts/check_dataset2.py) |
| `backend/scripts/check_duplicates.py` | [`eclat_algorithm/scripts/check_duplicates.py`](../eclat_algorithm/scripts/check_duplicates.py) |

---

For all active development, **use the canonical domain locations above (`server/`, `eclat_algorithm/`, `tests/`).**
