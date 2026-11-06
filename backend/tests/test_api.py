"""Integration tests for FastAPI REST Endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SkillGap" in data["app"]


def test_roles_endpoint():
    response = client.get("/api/v1/roles")
    assert response.status_code == 200
    data = response.json()
    assert "roles" in data
    assert "skills_by_category" in data
    assert len(data["skills_by_category"]) >= 4
    # Check that canonical categories exist
    assert "Programming Languages" in data["skills_by_category"]
    assert "Databases & Storage" in data["skills_by_category"]
