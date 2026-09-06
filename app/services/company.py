import secrets

from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()


def generate_company_code() -> str:
    return secrets.token_urlsafe(16)


def hash_company_code(code: str) -> str:
    return password_hash.hash(code)


def verify_company_code(
    code: str,
    code_hash: str,
) -> bool:
    return password_hash.verify(
        code,
        code_hash,
    )