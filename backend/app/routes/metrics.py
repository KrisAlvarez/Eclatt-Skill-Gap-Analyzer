"""Backward-compatibility shim for backend.app.routes.metrics.

Redirects directly to server.app.routes.metrics.
"""

from server.app.routes.metrics import router

__all__ = ["router"]
