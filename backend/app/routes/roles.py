"""Backward-compatibility shim for backend.app.routes.roles.

Redirects directly to server.app.routes.roles.
"""

from server.app.routes.roles import router

__all__ = ["router"]
