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


@pytest.mark.parametrize("mode", ["entry", "all"])
@pytest.mark.parametrize("role", ["Backend Developer", "Frontend Developer", "Data Analyst"])
def test_popular_skills_match_selected_segment(role, mode):
    from eclat_algorithm.hybrid import _load_hybrid_mode

    data = client.post("/api/v1/analyze", json={
        "role": role, "experience_mode": mode,
        "possessed_skills": ["HTML", "SQL"], "top_k": 6,
    }).json()
    excluded = set(data["user_skills"]) | {item["skill"] for item in data["recommendations"]}
    _, frequencies, _, _ = _load_hybrid_mode(role, mode)
    total = len(__import__("json").loads(
        __import__("pathlib").Path("data/processed/clean_transactions.json").read_text(encoding="utf-8")
    )[role][mode])
    expected = [{"skill": skill, "support": frequencies[skill] / total,
                 "evidence_jobs_count": frequencies[skill]}
                for skill in sorted(frequencies, key=lambda skill: (-frequencies[skill], skill))
                if skill not in excluded][:6]
    assert [item["skill"] for item in data["popular_skills"]] == [item["skill"] for item in expected]
    for actual, source in zip(data["popular_skills"], expected):
        assert actual["support"] == source["support"]
        assert actual["evidence_jobs_count"] == source["evidence_jobs_count"]


@pytest.mark.parametrize("selected", [["HTML"], ["HTML", "CSS", "SQL"], [], ["HTML", "JavaScript", "Python"]])
def test_popular_skills_after_hybrid_recommendations(selected):
    response = client.post("/api/v1/analyze", json={
        "role": "Frontend Developer", "possessed_skills": selected, "top_k": 1,
    })
    assert response.status_code == 200
    data = response.json()
    recommendations = {item["skill"] for item in data["recommendations"]}
    popular = {item["skill"] for item in data["popular_skills"]}
    assert not (set(data["user_skills"]) & recommendations)
    assert not (set(data["user_skills"]) & popular)
    assert not (recommendations & popular)


def test_metrics_endpoint():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first_metric = data[0]
    assert "eclat_hr_at_5" in first_metric
    assert "baseline_hr_at_5" in first_metric
    for row in data:
        for method in ("eclat", "baseline"):
            assert row[f"{method}_hr_at_5"] <= row[f"{method}_hr_at_10"] <= row[f"{method}_hr_at_20"] <= 1
            lower, upper = row[f"{method}_hr_at_10_ci95"]
            assert 0 <= lower <= row[f"{method}_hr_at_10"] <= upper <= 1


def test_hr20_api_matches_stored_metrics():
    import json
    from server.app.config import METRICS_FILE

    stored = json.loads(METRICS_FILE.read_text(encoding="utf-8"))
    served = client.get("/api/v1/metrics").json()
    assert len(stored) == len(served) == 6
    for source, row in zip(stored, served):
        assert all(row[key] == value for key, value in source.items())
        for method in ("eclat", "baseline"):
            lower, upper = row[f"{method}_hr_at_20_ci95"]
            assert 0 <= lower <= row[f"{method}_hr_at_20"] <= upper <= 1
