"""Backward-compatibility shim for backend.app.main.

Redirects directly to server.app.main.
"""

from server.app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.app.main:app", host="0.0.0.0", port=8000, reload=True)
