"""Backward-compatibility shim for backend.app.core.taxonomy.

Redirects directly to eclat_algorithm.taxonomy.
"""

from eclat_algorithm.taxonomy import (
    SKILL_TAXONOMY,
    ALIAS_MAP,
    extract_skills,
    get_category,
    CAT_LANGUAGE,
    CAT_FRAMEWORK,
    CAT_DATABASE,
    CAT_CLOUD_DEVOPS,
    CAT_DEV_TOOLS,
)

__all__ = [
    "SKILL_TAXONOMY",
    "ALIAS_MAP",
    "extract_skills",
    "get_category",
    "CAT_LANGUAGE",
    "CAT_FRAMEWORK",
    "CAT_DATABASE",
    "CAT_CLOUD_DEVOPS",
    "CAT_DEV_TOOLS",
]
