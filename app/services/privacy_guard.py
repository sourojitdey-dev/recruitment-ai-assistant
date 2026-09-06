import re


ADVISORY_DISCLAIMER = (
    "This response is AI-assisted advisory guidance based on authorized documents. "
    "It does not represent an automated hiring or employment decision."
)

FORBIDDEN_PROMPT_PATTERNS = [
    r"ignore previous instructions",
    r"system prompt",
    r"drop database",
    r"select \* from users",
    r"reveal other candidates",
    r"show all passwords",
]


def check_query_safety(query: str) -> tuple[bool, str | None]:
    """Check if query violates security, privacy, or prompt guardrails."""
    lowered = query.lower()

    for pattern in FORBIDDEN_PROMPT_PATTERNS:
        if re.search(pattern, lowered):
            return False, "This query violates platform privacy or security policies."

    return True, None


def sanitize_response(response_text: str) -> str:
    """Ensure response avoids automated employment promises and maintains advisory tone."""
    if not response_text:
        return "The provided documents do not contain information to answer this question."

    # Prevent automated hiring declarations
    replacements = [
        (r"\bYou are (hereby )?hired\b", "You appear to be a strong candidate based on your skills"),
        (r"\bYou have been rejected\b", "Your profile shows potential skill gaps for this specific position"),
        (r"\bWe guarantee (a |your )?job\b", "We recommend focusing on the key qualifications to improve your fit"),
    ]

    sanitized = response_text
    for pattern, replacement in replacements:
        sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)

    return sanitized
