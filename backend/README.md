# ♻️ `backend/` — Compatibility Layer

> **Note:** The `backend/` folder is a **backward-compatibility shim layer**.
> It is preserved so that any external references (CI scripts, Render build history, old Postman docs) continue to resolve, but **all real code now lives in the canonical locations**:

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
| `backend/scripts/run_eclat_offline.py` | [`eclat_algorithm/runner.py`](../eclat_algorithm/runner.py) |
| `backend/scripts/run_evaluation.py` | [`eclat_algorithm/evaluation.py`](../eclat_algorithm/evaluation.py) |
| `backend/tests/test_eclat.py` | [`tests/test_eclat.py`](../tests/test_eclat.py) |
| `backend/tests/test_api.py` | [`tests/test_server.py`](../tests/test_server.py) |

---

For all development, **go directly to the canonical locations above.** This folder contains only thin import-forwarding shims.
