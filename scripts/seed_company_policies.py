import os
import sys

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.company import Company
from app.models.knowledge_document import KnowledgeDocument
from app.models.user import User
from app.services.company import generate_company_code, hash_company_code
from app.services.company_policy_defaults import seed_standard_policies_for_company


def seed_all_company_policies():
    """
    Backfill and index standard company policies (Maternity & Parental Leave,
    Remote Work Policy, Health & Wellness Benefits, Code of Conduct & Culture,
    Hiring & Interview FAQ) for all companies existing in the database.
    """
    db = SessionLocal()
    print("=" * 60)
    print("RecruitAI — Company Policy & Knowledge Base Seeder")
    print("=" * 60)

    try:
        # Find all companies
        companies = db.query(Company).all()
        if not companies:
            print("No companies found in database. Creating default demo company: 'NexusTech Innovations'...")
            nexus = Company(
                name="NexusTech Innovations",
                recruiter_code_hash=hash_company_code("NEXUS-2026-KEY"),
                is_active=True,
            )
            db.add(nexus)
            db.commit()
            db.refresh(nexus)
            companies = [nexus]
            print(f"Created '{nexus.name}' with Recruiter Code: NEXUS-2026-KEY")

        # Find first admin or user ID if available
        first_user = db.query(User).filter(User.role.in_(["admin", "recruiter"])).first()
        uploader_id = first_user.id if first_user else None

        total_companies_updated = 0
        total_chunks_created = 0

        for company in companies:
            print(f"\n[Processing Company #{company.id}] '{company.name}'...")

            # Count existing documents for company
            existing_docs_count = (
                db.query(KnowledgeDocument)
                .filter(KnowledgeDocument.company_id == company.id)
                .count()
            )
            print(f"  Existing documents in DB: {existing_docs_count}")

            # Seed standard policies (Maternity leave, Remote work, Benefits, Culture, Hiring FAQ)
            chunks_indexed = seed_standard_policies_for_company(
                db=db,
                company=company,
                uploaded_by=uploader_id,
                overwrite=False,
            )

            total_chunks_created += chunks_indexed
            total_companies_updated += 1
            print(f"  [OK] Successfully ensured & indexed policy knowledge chunks (+{chunks_indexed} new chunks).")

        print("\n" + "=" * 60)
        print(f"Policy Seeding Complete!")
        print(f"Total Companies Verified: {total_companies_updated}")
        print(f"Total New Vector Chunks Indexed: {total_chunks_created}")
        print("=" * 60)

    except Exception as e:
        print(f"\n[ERROR] Policy seeding encountered an issue: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all_company_policies()
