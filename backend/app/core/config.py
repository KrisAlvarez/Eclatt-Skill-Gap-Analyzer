"""Backward-compatibility shim for backend.app.core.config.

Redirects directly to server.app.config.
"""

from server.app.config import (
    BASE_DIR,
    PROCESSED_DIR,
    RULES_FILE,
    METRICS_FILE,
    TRANSACTIONS_FILE,
    Settings,
    settings,
)

__all__ = [
    "BASE_DIR",
    "PROCESSED_DIR",
    "RULES_FILE",
    "METRICS_FILE",
    "TRANSACTIONS_FILE",
    "Settings",
    "settings",
]
