from datetime import datetime, timedelta


def test_candidate_apply_workflow(client, candidate_token, candidate_profile, test_job):
    # 1. Candidate applies
    res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={"job_id": test_job.id, "notes": {"source": "referral"}},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["job_id"] == test_job.id
    assert data["status"] == "applied"
    app_id = data["id"]

    # 2. Duplicate application rejection
    res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={"job_id": test_job.id},
    )
    assert res.status_code == 400
    assert "already applied" in res.json()["detail"]

    # 3. Candidate views own applications
    res = client.get(
        "/api/v1/applications/me",
        headers={"Authorization": f"Bearer {candidate_token}"},
    )
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_recruiter_manage_applications_and_isolation(
    client, candidate_token, candidate_profile, recruiter_token, other_recruiter_token, test_job
):
    # Candidate applies
    res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={"job_id": test_job.id},
    )
    app_id = res.json()["id"]

    # Company recruiter can see
    res = client.get(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {recruiter_token}"},
    )
    assert res.status_code == 200
    ids = [a["id"] for a in res.json()]
    assert app_id in ids

    # Other company recruiter CANNOT see
    res = client.get(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {other_recruiter_token}"},
    )
    assert res.status_code == 200
    ids = [a["id"] for a in res.json()]
    assert app_id not in ids

    # Company recruiter updates status
    res = client.put(
        f"/api/v1/applications/{app_id}/status",
        headers={"Authorization": f"Bearer {recruiter_token}"},
        json={"status": "shortlisted"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "shortlisted"

    # Other company recruiter cannot update
    res = client.put(
        f"/api/v1/applications/{app_id}/status",
        headers={"Authorization": f"Bearer {other_recruiter_token}"},
        json={"status": "hired"},
    )
    assert res.status_code == 404


def test_interview_scheduling_and_permissions(
    client, candidate_token, candidate_profile, recruiter_token, other_recruiter_token, interviewer_user, interviewer_token, test_job
):
    # 1. Candidate applies
    res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={"job_id": test_job.id},
    )
    app_id = res.json()["id"]

    # 2. Get interviewers list
    res = client.get(
        "/api/v1/interviews/interviewers",
        headers={"Authorization": f"Bearer {recruiter_token}"},
    )
    assert res.status_code == 200
    assert len(res.json()) >= 1
    assert res.json()[0]["id"] == interviewer_user.id

    # 3. Schedule interview
    interview_time = (datetime.utcnow() + timedelta(days=2)).isoformat()
    res = client.post(
        "/api/v1/interviews/",
        headers={"Authorization": f"Bearer {recruiter_token}"},
        json={
            "application_id": app_id,
            "interviewer_id": interviewer_user.id,
            "scheduled_at": interview_time,
        },
    )
    assert res.status_code == 201
    interview_id = res.json()["id"]
    assert res.json()["status"] == "scheduled"

    # 4. Interviewer views assigned interviews
    res = client.get(
        "/api/v1/interviews/",
        headers={"Authorization": f"Bearer {interviewer_token}"},
    )
    assert res.status_code == 200
    assert len(res.json()) == 1

    # 5. Interviewer updates status
    res = client.put(
        f"/api/v1/interviews/{interview_id}/status",
        headers={"Authorization": f"Bearer {interviewer_token}"},
        json={"status": "completed"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "completed"

    # 6. Candidate views own interviews
    res = client.get(
        "/api/v1/interviews/me",
        headers={"Authorization": f"Bearer {candidate_token}"},
    )
    assert res.status_code == 200
    assert len(res.json()) == 1

    # 7. Delete interview by recruiter
    res = client.delete(
        f"/api/v1/interviews/{interview_id}",
        headers={"Authorization": f"Bearer {recruiter_token}"},
    )
    assert res.status_code == 204
