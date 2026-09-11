import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.company import Company
from app.models.job import Job
from app.models.knowledge_document import KnowledgeDocument
from app.models.user import User
from app.services.company import generate_company_code, hash_company_code
from app.services.vector_store import index_job, index_knowledge_document

SAMPLE_DOCUMENTS = [
    {
        "filename": "Company_Remote_Work_Policy.md",
        "document_type": "company_policy",
        "text": """# Global Remote Work & Equipment Policy
Our engineering and product teams operate in a remote-first model.
Employees are eligible for a $1,500 home-office stipend upon onboarding.
Core working hours are 10:00 AM to 4:00 PM in your local timezone to allow asynchronous collaboration.
Health insurance, paid parental leave (16 weeks), and annual learning budgets of $2,000 per engineer are provided.""",
    },
    {
        "filename": "Engineering_Hiring_Process_FAQ.md",
        "document_type": "faq",
        "text": """# Engineering Hiring Process FAQ
## Round 1: Recruiter Screening (30 mins)
Discussion of experience, background, salary expectations, and cultural alignment.

## Round 2: Technical Interview (60 mins)
Live coding in Python or TypeScript focusing on clean architecture, API design, and data structures.

## Round 3: System Design & Architecture (60 mins)
Designing scalable backend services, database schema design, and caching strategies.

## Decision:
Recruiting committee meets weekly. Offers are extended within 48 hours of final round completion.""",
    },
]


from app.services.company_policy_defaults import seed_standard_policies_for_company


def seed_knowledge_base():
    db = SessionLocal()
    try:
        # 1. Create or get Demo Company
        company = db.query(Company).filter(Company.name == "NexusTech Innovations").first()
        if not company:
            company = Company(
                name="NexusTech Innovations",
                recruiter_code_hash=hash_company_code("NEXUS-2026-KEY"),
                is_active=True,
            )
            db.add(company)
            db.commit()
            db.refresh(company)
            print(f"Created Demo Company: {company.name} (Recruiter Code: NEXUS-2026-KEY)")

        # Ingest comprehensive standard policies (Maternity leave, Remote work, Benefits, Culture, Hiring FAQ)
        policy_chunks = seed_standard_policies_for_company(
            db=db,
            company=company,
            uploaded_by=None,
            overwrite=False,
        )
        print(f"[OK] Ingested & indexed {policy_chunks} policy chunks for '{company.name}'")

        # 2. Ingest Sample Documents
        for doc_data in SAMPLE_DOCUMENTS:
            existing_doc = (
                db.query(KnowledgeDocument)
                .filter(
                    KnowledgeDocument.filename == doc_data["filename"],
                    KnowledgeDocument.company_id == company.id,
                )
                .first()
            )
            if not existing_doc:
                doc = KnowledgeDocument(
                    filename=doc_data["filename"],
                    file_path=f"storage/documents/{doc_data['filename']}",
                    content_type="text/markdown",
                    document_type=doc_data["document_type"],
                    extracted_text=doc_data["text"],
                    company_id=company.id,
                    uploaded_by=1,
                    indexing_status="pending",
                )
                db.add(doc)
                db.commit()
                db.refresh(doc)
                chunks_count = index_knowledge_document(db, doc)
                print(f"[OK] Ingested & indexed '{doc.filename}' ({chunks_count} chunks)")
            else:
                chunks_count = index_knowledge_document(db, existing_doc)
                print(f"[OK] Re-indexed '{existing_doc.filename}' ({chunks_count} chunks)")

        # 3. Index existing jobs
        jobs = db.query(Job).all()
        for j in jobs:
            c_count = index_job(db, j)
            print(f"[OK] Indexed Job #{j.id} '{j.title}' ({c_count} chunks)")

        print("\nKnowledge base ingestion complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_knowledge_base()
