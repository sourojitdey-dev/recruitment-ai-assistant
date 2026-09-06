import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def check_setup():
    print("========================================")
    print("Recruitment AI Assistant - Health Check")
    print("========================================")

    # 1. Check Python version
    print(f"Python Version: {sys.version.split()[0]}")

    # 2. Check imports
    modules = [
        "fastapi", "sqlalchemy", "alembic", "pydantic", "jwt",
        "sentence_transformers", "groq", "pymupdf", "docx", "websockets"
    ]
    for mod in modules:
        try:
            __import__(mod)
            print(f"[OK] {mod} is installed.")
        except ImportError as e:
            print(f"[FAIL] {mod} is MISSING: {e}")

    # 3. Check embedding model loading
    print("\nTesting Embedding Service (SentenceTransformer)...")
    try:
        from app.services.embedding import get_embedding_service
        service = get_embedding_service()
        vec = service.embed_text("Test embedding string")
        print(f"[OK] Embedding generated with dimension {len(vec)}")
    except Exception as e:
        print(f"[FAIL] Embedding service failed: {e}")

    # 4. Check LLM provider
    print("\nTesting LLM Provider...")
    try:
        from app.llm.factory import get_llm_provider
        provider = get_llm_provider()
        print(f"[OK] Active LLM Provider: {provider.__class__.__name__}")
    except Exception as e:
        print(f"[FAIL] LLM provider failed: {e}")

    print("\n========================================")
    print("Health Check Complete!")
    print("========================================")


if __name__ == "__main__":
    check_setup()
