def test_register_candidate(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "Password@123",
            "favorite_book": "Clean Architecture",
            "favorite_person": "Grace Hopper",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "john@example.com"
    assert data["role"] == "candidate"


def test_register_duplicate_email(client, candidate_user):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate User",
            "email": candidate_user.email,
            "password": "Password@123",
            "favorite_book": "Book",
            "favorite_person": "Person",
        },
    )
    assert res.status_code == 400
    assert "Email already registered" in res.json()["detail"]


def test_login_success(client, candidate_user):
    res = client.post(
        "/api/v1/auth/login",
        data={
            "username": candidate_user.email,
            "password": "Candidate@123",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client, candidate_user):
    res = client.post(
        "/api/v1/auth/login",
        data={
            "username": candidate_user.email,
            "password": "WrongPassword",
        },
    )
    assert res.status_code == 401


def test_forgot_password_success(client, candidate_user):
    res = client.post(
        "/api/v1/auth/forgot-password",
        json={
            "email": candidate_user.email,
            "favorite_book": "Clean Code",
            "favorite_person": "Guido",
            "new_password": "NewSecretPassword@123",
        },
    )
    assert res.status_code == 200
    assert res.json()["message"] == "Password reset successfully"


def test_forgot_password_invalid_answers(client, candidate_user):
    res = client.post(
        "/api/v1/auth/forgot-password",
        json={
            "email": candidate_user.email,
            "favorite_book": "Wrong Book",
            "favorite_person": "Wrong Person",
            "new_password": "NewSecretPassword@123",
        },
    )
    assert res.status_code == 403


def test_get_me(client, candidate_token):
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {candidate_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "candidate"
