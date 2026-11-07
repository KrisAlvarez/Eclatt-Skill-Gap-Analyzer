"""Backward-compatibility shim for backend.app.routes.analyze.

Redirects directly to server.app.routes.analyze.
"""

from server.app.routes.analyze import router

__all__ = ["router"]
