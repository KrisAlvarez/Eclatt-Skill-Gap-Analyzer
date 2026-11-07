"""Role catalog and taxonomy metadata endpoint."""

import json
from collections import defaultdict
from fastapi import APIRouter
from server.app.config import RULES_FILE
from server.app.schemas import RolesResponse, RoleItem
from eclat_algorithm.taxonomy import SKILL_TAXONOMY

router = APIRouter(prefix="/api/v1", tags=["Roles & Taxonomy"])


@router.get("/roles", response_model=RolesResponse)
def get_roles():
    """Returns available IT career tracks, market posting counts, and skills by category."""
    skills_by_cat = defaultdict(list)
    for skill, cat in sorted(SKILL_TAXONOMY.items()):
        skills_by_cat[cat].append(skill)

    roles_data = []
    if RULES_FILE.exists():
        with open(RULES_FILE, "r", encoding="utf-8") as f:
            rules_db = json.load(f)

        for role_name, modes in rules_db.items():
            all_info = modes.get("all", {})
            entry_info = modes.get("entry", {})
            roles_data.append(
                RoleItem(
                    role_name=role_name,
                    all_postings_count=all_info.get("total_transactions", 0),
                    entry_postings_count=entry_info.get("total_transactions", 0),
                    top_1_itemsets=entry_info.get("top_1_itemsets", [])[:10],
                )
            )
    else:
        # Fallback if rules haven't been precomputed yet
        default_roles = ["Backend Developer", "Frontend Developer", "Data Analyst"]
        for r in default_roles:
            roles_data.append(
                RoleItem(
                    role_name=r,
                    all_postings_count=0,
                    entry_postings_count=0,
                    top_1_itemsets=[],
                )
            )

    return RolesResponse(
        roles=roles_data,
        skills_by_category=skills_by_cat,
    )
