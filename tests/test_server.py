"""Integration tests for FastAPI Server Endpoints."""

import pytest
from fastapi.testclient import TestClient
from server.app.main import app

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


def test_analyze_endpoint():
    payload = {
        "role": "Backend Developer",
        "possessed_skills": ["Python", "PostgreSQL"],
        "experience_mode": "entry",
        "top_k": 3
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "Backend Developer"
    assert "recommendations" in data
    assert len(data["recommendations"]) <= 3


def test_analyze_rejects_unknown_skill():
    response = client.post(
        "/api/v1/analyze",
        json={
            "role": "Backend Developer",
            "possessed_skills": ["Python", "DefinitelyNotASkill"],
            "experience_mode": "entry",
            "top_k": 3,
        },
    )
    assert response.status_code == 400
    assert "unknown_skills" in response.json()["detail"]


def test_metrics_endpoint():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first_metric = data[0]
    assert "eclat_hr_at_5" in first_metric
    assert "baseline_hr_at_5" in first_metric
    assert first_metric["target_metric"] == "eclat_category_hr_at_4"


def test_cross_validation_metrics_endpoint_exposes_target_status():
    response = client.get("/api/v1/metrics/cross-validation")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert data[0]["target_threshold"] == 0.9
    assert "target_achieved" in data[0]
