import io


def test_recruiter_document_flow(client, recruiter_token, other_recruiter_token):
    # 1. Recruiter uploads markdown document
    doc_content = b"# Remote Work Policy\nOur team works across multiple timezones with core hours 10am-4pm."
    file_payload = {"file": ("policy.md", io.BytesIO(doc_content), "text/markdown")}

    res = client.post(
        "/api/v1/documents/",
        headers={"Authorization": f"Bearer {recruiter_token}"},
        files=file_payload,
        data={"document_type": "company_policy"},
    )
    assert res.status_code == 201
    doc_id = res.json()["id"]
    assert res.json()["filename"] == "policy.md"

    # 2. Recruiter lists company documents
    res = client.get(
        "/api/v1/documents/",
        headers={"Authorization": f"Bearer {recruiter_token}"},
    )
    assert res.status_code == 200
    ids = [d["id"] for d in res.json()]
    assert doc_id in ids

    # 3. Other company recruiter cannot see this document
    res = client.get(
        "/api/v1/documents/",
        headers={"Authorization": f"Bearer {other_recruiter_token}"},
    )
    assert res.status_code == 200
    ids = [d["id"] for d in res.json()]
    assert doc_id not in ids

    # 4. Trigger reindex
    res = client.post(
        f"/api/v1/documents/{doc_id}/index",
        headers={"Authorization": f"Bearer {recruiter_token}"},
    )
    assert res.status_code == 200
    assert "Successfully indexed" in res.json()["message"]

    # 5. Delete document
    res = client.delete(
        f"/api/v1/documents/{doc_id}",
        headers={"Authorization": f"Bearer {recruiter_token}"},
    )
    assert res.status_code == 204
