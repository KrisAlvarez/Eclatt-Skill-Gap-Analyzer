# 🧮 ECLAT Algorithm Engine (`eclat_algorithm`)

This module houses the core machine learning implementation of the **ECLAT (Equivalence Class Clustering and bottom-up Lattice Traversal)** algorithm, the canonical IT skills taxonomy, transaction dataset preprocessing, and empirical evaluation metrics.

---

## 📁 Module Organization

```
eclat_algorithm/
├── __init__.py           # Package interface (exports ECLATMiner, taxonomy constants)
├── miner.py              # Core ECLATMiner: Vertical TID-lists, DFS lattice intersection, rule generation
├── taxonomy.py           # 10 IT Skill Categories, alias normalization, canonical regex mapping
├── evaluation.py         # Production-path train/test masked recovery & baseline
├── recommendation.py     # Shared production artifact building and recommendation tiers
├── builder.py            # Preprocessing pipeline & hybrid role classifier
├── runner.py             # Precomputation & serialization of association rules
├── scripts/              # Standalone CLI tools:
│   ├── build_asaniczka.py # Ingestion pipeline for 1.3M asaniczka LinkedIn dataset
│   ├── build_dataset.py  # Filters raw postings into Entry vs All market transactions
│   ├── run_mining.py     # Offline rule precomputation -> data/processed/rules.json
│   ├── run_evaluation.py # Offline held-out benchmark -> data/processed/evaluation_metrics.json
│   ├── run_cross_validation.py # Five-fold validation
│   ├── run_benchmark.py  # Complete reproducible mining + evaluation workflow
│   ├── run_category_benchmark.py # Category HR@3/HR@4 test and validation report
│   ├── check_dataset.py  # Exploratory data analysis & TID-list intersection demonstration
│   ├── check_dataset2.py # Experience level & job title transaction distribution
│   └── check_duplicates.py # Multi-table deduplication audit
└── README.md             # This document
```

---

## 🔬 Mathematical Foundation & ECLAT Mechanics

### 1. Vertical Data Layout (TID-lists)
Traditional association algorithms (e.g., Apriori) store transactions horizontally:
$$\text{Job}_1 = \{\text{Python, SQL, Docker}\},\quad \text{Job}_2 = \{\text{Python, PostgreSQL}\}$$
This requires repeated, computationally expensive full dataset scans for each candidate itemset size $k$.

In contrast, **ECLAT** transforms transactions into an inverted vertical index:
$$\text{TID}(\text{Python}) = \{1, 2, 5, 6, 8, 9\}$$
$$\text{TID}(\text{Docker}) = \{1, 5, 6, 8\}$$

### 2. Lattice Intersection
Candidate itemset support is computed via fast bitwise/set intersections without scanning the original dataset:
$$\text{TID}(\{\text{Python, Docker}\}) = \text{TID}(\text{Python}) \cap \text{TID}(\text{Docker}) = \{1, 5, 6, 8\}$$
$$\text{Support}(\{\text{Python, Docker}\}) = \frac{|\text{TID}(\text{Python}) \cap \text{TID}(\text{Docker})|}{N}$$

### 3. Association Rule Evaluation Metrics
For an antecedent skill set $A$ and consequent skill $B$:
- **Support**:
  $$\text{Support}(A \rightarrow B) = P(A \cup B) = \frac{|\text{TID}(A) \cap \text{TID}(B)|}{N}$$
- **Confidence**:
  $$\text{Confidence}(A \rightarrow B) = P(B \mid A) = \frac{\text{Support}(A \cup B)}{\text{Support}(A)}$$
- **Lift**:
  $$\text{Lift}(A \rightarrow B) = \frac{P(B \mid A)}{P(B)} = \frac{\text{Confidence}(A \rightarrow B)}{\text{Support}(B)}$$

$\text{Lift} > 1.0$ indicates that the consequent appears more often with the antecedent than its overall frequency would suggest under independence. For example, a lift of 1.86 means the observed co-occurrence is 1.86 times the expected frequency; it does not show that one skill causes demand for another.

### 4. Held-out Recommendation Evaluation
The benchmark uses an 80/20 split of postings with at least three extracted skills. For each held-out posting, one skill is masked and the shared production recommendation path receives the remaining skills. Production support, confidence, and lift thresholds, rule caps, and the top-20 popularity fallback are used unchanged. Long-tail membership is calculated from training-posting frequency (<30%); the API reports its test count, 95% Wilson intervals, and how often rules versus the popularity fallback supplied recommendations. This measures masked-skill recovery only. It does not establish that a suggestion is useful to a learner, represents a requirement, or improves hiring outcomes.

The project quality target is **at least 90% category recovery in the top 4 recommendations**, measured as
`eclat_category_hr_at_4` across every role and experience segment in five-fold cross-validation. Exact skill
recovery remains reported separately and is not represented as 90% accuracy. The generated metrics include
`target_achieved` and `target_gap` so a result cannot be presented as passing before it actually meets the threshold.
The production ranker also preserves category coverage from the role-specific market prior before filling
remaining slots by recommendation strength; this improves breadth, not exact-skill recovery.

### What the HR@4 number means

For each eligible posting containing at least three canonical skills, the benchmark:

1. Holds out one fifth of the postings as a test fold and trains rules on the other four fifths.
2. Selects one skill at random from each test posting and hides it.
3. Sends the remaining skills through the same production recommendation function.
4. Checks the first 4 recommendations. A category hit occurs when at least one recommendation has the same taxonomy category as the hidden skill.
5. Computes `category HR@4 = category_hits / evaluated_test_postings`.

Five folds run with a fixed seed (`42`), and the reported value is their mean. Thus, 99% HR@4
means the hidden skill's **category** was represented in the first 4 suggestions for 99% of
evaluated cases. It does not mean the exact hidden skill was recovered 99% of the time.

---

## 🚀 How to Run ECLAT Workflows

All commands can be executed directly from the project root:

```bash
# 1. Build clean transaction dataset from asaniczka 1.3M dataset (via kagglehub)
python -m eclat_algorithm.scripts.build_dataset

# 2. Mine frequent itemsets & serialize rules to data/processed/rules.json
python -m eclat_algorithm.scripts.run_mining

# 3. Run held-out masked-skill benchmark
python -m eclat_algorithm.scripts.run_evaluation

# 4. Run five-fold target validation
python -m eclat_algorithm.scripts.run_cross_validation

# Report category HR@3 and HR@4 for holdout test and five-fold validation
python -m eclat_algorithm.scripts.run_category_benchmark
```

---

## 🧪 Testing

ECLAT algorithmic unit tests are located in [`tests/test_eclat.py`](../tests/test_eclat.py) and test:
1. TID-list generation from toy transactions.
2. Recursive lattice intersection.
3. Directional rule generation and Support/Confidence/Lift calculations.
4. The 3-tier fallback cascade (Exact Match &rarr; Sub-Lattice Step-Down &rarr; Unconditional Prior).
