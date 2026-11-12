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
    from server.app.routes.analyze import get_rules_db

    data = client.post("/api/v1/analyze", json={
        "role": role, "experience_mode": mode,
        "possessed_skills": ["HTML", "SQL"], "top_k": 6,
    }).json()
    excluded = set(data["user_skills"]) | {item["skill"] for item in data["recommendations"]}
    expected = [
        item for item in get_rules_db()[role][mode]["top_1_itemsets"]
        if item["skill"] not in excluded
    ][:6]
    assert [item["skill"] for item in data["popular_skills"]] == [item["skill"] for item in expected]
    for actual, source in zip(data["popular_skills"], expected):
        assert actual["support"] == source["support"]
        assert actual["evidence_jobs_count"] == source["count"]


@pytest.mark.parametrize("selected", [["HTML"], ["HTML", "CSS", "SQL"], [], ["HTML", "JavaScript", "Python"]])
def test_popular_skills_after_exact_subset_or_fallback(monkeypatch, selected):
    import importlib
    analyze = importlib.import_module("server.app.routes.analyze")
    artifact = {
        "total_transactions": 100,
        "top_1_itemsets": [
            {"skill": skill, "count": count, "support": count / 100}
            for skill, count in [("HTML", 90), ("JavaScript", 80), ("Python", 70)]
        ],
        "rules": [{
            "antecedent": ["HTML"], "consequent": ["JavaScript"],
            "category": "Programming Languages", "confidence": 0.8,
            "lift": 1.2, "support": 0.6, "joint_count": 60,
        }],
    }
    monkeypatch.setattr(analyze, "_RULES_CACHE", {"Frontend Developer": {"entry": artifact}})
    monkeypatch.setattr(analyze, "_RULE_INDEX_CACHE", {})
    response = client.post("/api/v1/analyze", json={
        "role": "Frontend Developer", "possessed_skills": selected, "top_k": 1,
    })
    assert response.status_code == 200
    data = response.json()
    if selected == ["HTML", "JavaScript", "Python"]:
        assert data["popular_skills"] == []
    else:
        expected = "Python" if "HTML" in selected else "JavaScript"
        assert [item["skill"] for item in data["popular_skills"]] == [expected]
    if len(selected) == 3 and "CSS" in selected:
        assert data["sub_lattice_fallback_used"] is True


def test_metrics_endpoint():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first_metric = data[0]
    assert "eclat_hr_at_5" in first_metric
    assert "baseline_hr_at_5" in first_metric
