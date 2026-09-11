def test_create_company(client):
    res = client.post(
        "/api/v1/companies/",
        json={"name": "Cyberdyne Systems"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Cyberdyne Systems"
    assert "recruiter_code" in data
    assert data["documents_indexed"] > 0


def test_create_company_with_custom_policies(client):
    res = client.post(
        "/api/v1/companies/",
        json={
            "name": "Stark Industries AI",
            "industry": "Advanced Aerospace & AI",
            "maternity_leave_policy": "# Stark Industries Maternity Policy\n26 weeks 100% paid leave.",
            "remote_work_policy": "# Stark Remote Policy\nFull remote flexibility with $2,000 stipend.",
            "health_benefits": "# Stark Health\n100% medical coverage worldwide.",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Stark Industries AI"
    assert "recruiter_code" in data
    assert data["documents_indexed"] >= 5



def test_list_companies(client, test_company):
    res = client.get("/api/v1/companies/")
    assert res.status_code == 200
    names = [c["name"] for c in res.json()]
    assert test_company.name in names


def test_recruiter_creates_job(client, recruiter_token, test_company):
    res = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {recruiter_token}"},
        json={
            "title": "Full Stack Engineer",
            "description": "Building modern React & FastAPI applications.",
            "location": "San Francisco, CA",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Full Stack Engineer"
    assert data["company_name"] == test_company.name


def test_candidate_cannot_create_job(client, candidate_token):
    res = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={
            "title": "Unauthorized Job",
            "description": "Should fail",
            "location": "Anywhere",
        },
    )
    assert res.status_code == 403


def test_job_isolation_and_update(client, recruiter_token, other_recruiter_token, test_job):
    # Recruiter of company can update
    res = client.put(
        f"/api/v1/jobs/{test_job.id}",
        headers={"Authorization": f"Bearer {recruiter_token}"},
        json={"title": "Lead Backend Architect"},
    )
    assert res.status_code == 200
    assert res.json()["title"] == "Lead Backend Architect"

    # Recruiter of other company CANNOT update
    res = client.put(
        f"/api/v1/jobs/{test_job.id}",
        headers={"Authorization": f"Bearer {other_recruiter_token}"},
        json={"title": "Malicious Modification"},
    )
    assert res.status_code == 404
