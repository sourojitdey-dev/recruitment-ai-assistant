from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.services.company import generate_company_code, hash_company_code, verify_company_code


def test_password_hashing_and_verification():
    raw = "SuperSecretPassword123!"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_generation():
    token = create_access_token(user_id=42, role="candidate")
    assert isinstance(token, str)
    assert len(token) > 20


def test_company_code_generation_and_verification():
    code = generate_company_code()
    assert len(code) >= 16
    hashed_code = hash_company_code(code)
    assert verify_company_code(code, hashed_code) is True
    assert verify_company_code("invalid_code", hashed_code) is False
