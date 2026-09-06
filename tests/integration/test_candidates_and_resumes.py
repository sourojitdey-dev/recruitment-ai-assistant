import io
import fitz


def create_sample_pdf_bytes(text: str = "Experienced Python and FastAPI Engineer with AWS & Docker skills.") -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_candidate_profile_flow(client, candidate_token):
    # 1. Create profile
    res = client.post(
        "/api/v1/candidates/",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={
            "phone": "+91-9988776655",
            "location": "Bengaluru",
            "bio": "Senior Software Engineer passionate about Distributed Systems.",
        },
    )
    assert res.status_code == 201
    assert res.json()["location"] == "Bengaluru"

    # 2. Get profile
    res = client.get(
        "/api/v1/candidates/me",
        headers={"Authorization": f"Bearer {candidate_token}"},
    )
    assert res.status_code == 200
    assert res.json()["phone"] == "+91-9988776655"

    # 3. Update profile
    res = client.put(
        "/api/v1/candidates/me",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={
            "phone": "+91-9988776655",
            "location": "Remote, India",
            "bio": "Updated Bio.",
        },
    )
    assert res.status_code == 200
    assert res.json()["location"] == "Remote, India"


def test_upload_resume_and_extraction(client, candidate_token, candidate_profile):
    pdf_bytes = create_sample_pdf_bytes("Sagnik Saha Resume: Expert in Python, FastAPI, PostgreSQL, and PyTorch.")
    file_payload = {"file": ("resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}

    res = client.post(
        "/api/v1/resumes/",
        headers={"Authorization": f"Bearer {candidate_token}"},
        files=file_payload,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["filename"] == "resume.pdf"
    assert "FastAPI" in data["extracted_text"]

    # List candidate's resumes
    res = client.get(
        "/api/v1/resumes/",
        headers={"Authorization": f"Bearer {candidate_token}"},
    )
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_upload_invalid_file_format(client, candidate_token, candidate_profile):
    file_payload = {"file": ("malicious.exe", io.BytesIO(b"Not a PDF"), "application/octet-stream")}
    res = client.post(
        "/api/v1/resumes/",
        headers={"Authorization": f"Bearer {candidate_token}"},
        files=file_payload,
    )
    assert res.status_code == 400
    assert "Only PDF resumes are supported" in res.json()["detail"]
