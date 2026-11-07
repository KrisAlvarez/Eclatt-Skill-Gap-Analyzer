"""ECLAT Algorithm Engine and Association Rule Mining.

Implements Equivalence Class Clustering and bottom-up Lattice Traversal (ECLAT)
using vertical transaction ID lists (TID-lists), fast set intersections,
and directional rule generation evaluated by Support, Confidence, and Lift.
"""

from collections import defaultdict
from itertools import combinations
from typing import Dict, FrozenSet, List, Optional, Set, Tuple
from eclat_algorithm.taxonomy import get_category


class ECLATMiner:
    def __init__(
        self,
        transactions: List[List[str]],
        min_support: float = 0.05,
        min_absolute_count: int = 3,
        max_itemset_size: int = 4,
    ):
        self.transactions = transactions
        self.n_transactions = len(transactions)
        self.min_support = min_support
        self.max_itemset_size = max_itemset_size
        self.min_support_count = max(min_absolute_count, int(min_support * self.n_transactions))
        
        # Inverted index: Skill -> Set of Transaction IDs
        self.tid_lists: Dict[str, Set[int]] = defaultdict(set)
        self._build_tid_lists()
        
        # Mined structures
        self.frequent_itemsets: Dict[FrozenSet[str], int] = {}
        self.rules: List[Dict[str, any]] = []

    def _build_tid_lists(self):
        """Construct vertical TID-lists from transactions."""
        for tid, t in enumerate(self.transactions):
            for skill in set(t):
                self.tid_lists[skill].add(tid)

    def mine(self) -> Dict[FrozenSet[str], int]:
        """Mine frequent itemsets using vertical lattice traversal."""
        if self.n_transactions == 0:
            return {}

        # 1. Filter frequent 1-itemsets
        frequent_1_items = []
        for item, tids in self.tid_lists.items():
            if len(tids) >= self.min_support_count:
                fset = frozenset([item])
                self.frequent_itemsets[fset] = len(tids)
                frequent_1_items.append((item, tids))

        # Sort items by frequency (ascending) for efficient prefix-tree pruning
        frequent_1_items.sort(key=lambda x: len(x[1]))

        # 2. Run recursive equivalence class traversal
        self._eclat_recurse([], frequent_1_items)
        return self.frequent_itemsets

    def _eclat_recurse(
        self,
        prefix: List[str],
        items: List[Tuple[str, Set[int]]]
    ):
        """Recursive DFS lattice traversal using TID-list intersections."""
        for i in range(len(items)):
            item_i, tids_i = items[i]
            new_prefix = prefix + [item_i]
            if len(new_prefix) >= self.max_itemset_size:
                continue
            new_items = []

            for j in range(i + 1, len(items)):
                item_j, tids_j = items[j]
                
                # ECLAT Core: Vertical Set Intersection
                common_tids = tids_i & tids_j
                if len(common_tids) >= self.min_support_count:
                    candidate_itemset = frozenset(new_prefix + [item_j])
                    self.frequent_itemsets[candidate_itemset] = len(common_tids)
                    new_items.append((item_j, common_tids))

            if new_items:
                self._eclat_recurse(new_prefix, new_items)

    def generate_rules(
        self,
        min_confidence: float = 0.35,
        min_lift: float = 1.10
    ) -> List[Dict[str, any]]:
        """Generate association rules (A -> B) from frequent itemsets."""
        if not self.frequent_itemsets:
            self.mine()

        rules = []
        n = self.n_transactions
        if n == 0:
            return []

        # Iterate over itemsets of size >= 2
        for itemset, itemset_count in self.frequent_itemsets.items():
            k = len(itemset)
            if k < 2:
                continue

            itemset_support = itemset_count / n

            # Single-consequent rules (X -> {y})
            for item in itemset:
                antecedent = itemset - {item}
                consequent = frozenset([item])

                ant_count = self.frequent_itemsets.get(antecedent)
                if not ant_count:
                    ant_tids = None
                    for s in antecedent:
                        if ant_tids is None:
                            ant_tids = set(self.tid_lists.get(s, set()))
                        else:
                            ant_tids &= self.tid_lists.get(s, set())
                    ant_count = len(ant_tids) if ant_tids else 0

                if ant_count == 0:
                    continue

                confidence = itemset_count / ant_count
                consequent_count = len(self.tid_lists.get(item, set()))
                consequent_support = consequent_count / n

                if consequent_support == 0:
                    continue

                lift = confidence / consequent_support

                if confidence >= min_confidence and lift >= min_lift:
                    rules.append({
                        "antecedent": sorted(antecedent),
                        "consequent": [item],
                        "support": round(itemset_support, 4),
                        "confidence": round(confidence, 4),
                        "lift": round(lift, 3),
                        "category": get_category(item),
                        "joint_count": itemset_count,
                        "antecedent_count": ant_count,
                    })

        # Sort rules by Lift * Confidence descending
        rules.sort(key=lambda r: -(r["lift"] * r["confidence"]))
        self.rules = rules

        # Hash map index for O(1) antecedent lookup
        self.rules_by_ant: Dict[FrozenSet[str], List[Dict[str, any]]] = defaultdict(list)
        for r in rules:
            self.rules_by_ant[frozenset(r["antecedent"])].append(r)

        return rules

    def recommend(
        self,
        user_skills: List[str],
        top_k: int = 5
    ) -> Dict[str, any]:
        """Execute 3-tier fallback recommendation engine."""
        user_set = set(user_skills)
        recommendations = []
        matched_subset = None
        tier_used = "Tier 3: Foundational Prior"
        sub_lattice_used = False
        active_rules = []

        if not hasattr(self, "rules_by_ant") or not self.rules_by_ant:
            self.rules_by_ant = defaultdict(list)
            for r in self.rules:
                self.rules_by_ant[frozenset(r["antecedent"])].append(r)

        # Tier 1: Exact Antecedent Match
        exact_matches = [
            r for r in self.rules_by_ant.get(frozenset(user_set), [])
            if r["consequent"][0] not in user_set
        ]

        if exact_matches:
            tier_used = "Tier 1: Exact Match"
            active_rules = exact_matches
            for r in exact_matches:
                rec_skill = r["consequent"][0]
                recommendations.append({
                    "skill": rec_skill,
                    "category": r["category"],
                    "confidence": r["confidence"],
                    "lift": r["lift"],
                    "support": r["support"],
                    "evidence_jobs_count": r["joint_count"],
                    "tier": tier_used,
                    "explanation": f"Frequently paired with your exact stack {r['antecedent']} (Lift: {r['lift']}x, Conf: {int(r['confidence']*100)}%)."
                })

        # Tier 2: Sub-Lattice Step-Down (bounded to antecedent sizes 3, 2, 1)
        if not recommendations and len(user_set) > 0:
            max_sub = min(3, len(user_set) - 1 if len(user_set) > 1 else 1)
            for sub_len in range(max_sub, 0, -1):
                best_subset_rules = []
                best_sub_support = -1

                for sub in combinations(sorted(user_set), sub_len):
                    sub_fset = frozenset(sub)
                    sub_rules = [
                        r for r in self.rules_by_ant.get(sub_fset, [])
                        if r["consequent"][0] not in user_set
                    ]
                    if sub_rules:
                        sub_support = max(r["support"] for r in sub_rules)
                        if sub_support > best_sub_support:
                            best_sub_support = sub_support
                            best_subset_rules = sub_rules
                            matched_subset = list(sub)

                if best_subset_rules:
                    sub_lattice_used = True
                    tier_used = "Tier 2: Sub-Lattice Complement"
                    active_rules = best_subset_rules
                    for r in best_subset_rules:
                        rec_skill = r["consequent"][0]
                        recommendations.append({
                            "skill": rec_skill,
                            "category": r["category"],
                            "confidence": r["confidence"],
                            "lift": r["lift"],
                            "support": r["support"],
                            "evidence_jobs_count": r["joint_count"],
                            "tier": tier_used,
                            "explanation": f"Recommended via strongest matched subset {matched_subset} (Lift: {r['lift']}x, Conf: {int(r['confidence']*100)}%)."
                        })
                    break

        # Tier 3: Unconditional 1-Itemset Baseline Prior
        if not recommendations:
            tier_used = "Tier 3: Foundational Prior"
            frequent_1 = [
                (list(k)[0], count)
                for k, count in self.frequent_itemsets.items()
                if len(k) == 1 and list(k)[0] not in user_set
            ]
            frequent_1.sort(key=lambda x: -x[1])
            for skill, count in frequent_1[:top_k]:
                supp = count / self.n_transactions if self.n_transactions > 0 else 0.0
                recommendations.append({
                    "skill": skill,
                    "category": get_category(skill),
                    "confidence": round(supp, 4),
                    "lift": 1.0,
                    "support": round(supp, 4),
                    "evidence_jobs_count": count,
                    "tier": tier_used,
                    "explanation": f"Foundational industry competency ({int(supp*100)}% of postings in this track require this)."
                })

        # Deduplicate recommendations preserving highest rank
        seen_skills = set()
        deduped = []
        for rec in recommendations:
            if rec["skill"] not in seen_skills:
                seen_skills.add(rec["skill"])
                deduped.append(rec)

        return {
            "tier_used": tier_used,
            "sub_lattice_used": sub_lattice_used,
            "matched_subset": matched_subset,
            "active_rules": active_rules[:top_k * 2],
            "recommendations": deduped[:top_k],
        }
