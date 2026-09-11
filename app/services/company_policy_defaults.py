"""
Default policy templates and ingestion helper functions for companies.
"""
from pathlib import Path
from typing import Any
from uuid import uuid4
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.knowledge_document import KnowledgeDocument
from app.services.vector_store import index_knowledge_document

DOCUMENTS_STORAGE_DIR = Path("storage/documents")


def get_default_maternity_policy(company_name: str) -> str:
    return f"""# {company_name} — Maternity & Parental Leave Policy

## 1. Overview & Commitment
At {company_name}, we believe growing your family is one of life's most momentous milestones. We are committed to supporting parents of all genders through generous paid leave, flexible return-to-work programs, and comprehensive family support.

## 2. Paid Leave Entitlements
* **Primary Caregivers / Birthing Parents:** Eligible for **20 weeks of 100% fully paid maternity leave**.
* **Non-Birthing Parents & Secondary Caregivers:** Eligible for **12 weeks of 100% fully paid parental leave**.
* **Adoption & Surrogacy:** Eligible for **16 weeks of 100% fully paid parental leave** plus up to $5,000 in adoption assistance reimbursement.
* **Leave Timing:** Parental leave may be taken continuously or in blocks within the first 12 months following birth, adoption, or foster placement.

## 3. Benefits Continuation & Equity
* Health, dental, and vision insurance premiums continue to be fully paid by {company_name} during the leave period.
* Equity (stock options/RSUs) and bonus calculations continue to vest uninterrupted throughout the leave.
* Annual performance reviews and promotional consideration are protected from any leave-related bias.

## 4. Gradual Transition & Return-to-Work (Phase-Back)
* Employees returning from parental leave are eligible for our **Gradual Phase-Back Program**: work 80% hours with 100% full salary for the first 4 weeks after returning.
* Dedicated private lactation and parent wellness suites are available in all physical office hubs.
* Flexible hybrid/remote scheduling is available to support infant care routines.
"""


def get_default_remote_work_policy(company_name: str) -> str:
    return f"""# {company_name} — Remote & Flexible Work Policy

## 1. Work Model
{company_name} operates as a **remote-first, location-flexible** organization. Employees can work from home, a co-working space, or an office hub where available.

## 2. Home Office & Tech Stipend
* **Initial Setup Stipend:** Every new hire receives a **$1,500 tax-free home office setup stipend** for ergonomic chairs, desks, monitors, and accessories.
* **Monthly Internet & Mobile Allowance:** Employees receive a **$100 monthly stipend** to offset high-speed home internet and mobile connectivity costs.
* **Hardware:** Latest Apple MacBook Pro or high-spec Linux/Windows developer laptop refreshed every 3 years, plus high-definition webcam and noise-canceling headphones.

## 3. Core Hours & Asynchronous Collaboration
* **Core Collaboration Hours:** 10:00 AM to 4:00 PM in your local primary timezone for synchronous standups and design reviews.
* Outside core hours, team members are encouraged to work asynchronously with documented decisions in PRs, design docs, and ticket trackers.
* No internal meetings on Focus Fridays to provide dedicated deep work time.
"""


def get_default_health_benefits(company_name: str) -> str:
    return f"""# {company_name} — Health, Wellness & Comprehensive Benefits

## 1. Medical, Dental & Vision
* **Coverage:** {company_name} covers **100% of employee medical, dental, and vision insurance premiums** and **80% of eligible dependent premiums**.
* Comprehensive PPO and HDHP/HSA plan options with low deductibles and worldwide emergency coverage.
* Prescription drug coverage and preventative care covered at 100%.

## 2. Mental Health & Well-being
* **Employee Assistance Program (EAP):** 12 free, confidential 1-on-1 counseling and therapy sessions per year per family member via certified partners.
* Free premium subscription to mindfulness and meditation apps (Headspace/Calm).
* **Annual Wellness Stipend:** **$150/month ($1,800/year)** for gym memberships, fitness trackers, sports leagues, or personal training.

## 3. Continuous Learning & Professional Development
* **$2,500 annual learning budget** for conferences, certifications, books, and online courses.
* 3 paid "learning days" per year to attend workshops, hackathons, or academic conferences.
"""


def get_default_culture_code(company_name: str) -> str:
    return f"""# {company_name} — Code of Conduct, Culture & DEI

## 1. Core Values
* **Customer & Candidate First:** Act with integrity, transparency, and empathy in all interactions.
* **Ownership & Bias for Action:** Empower teammates to take intelligent risks, experiment, and learn rapidly.
* **Inclusive by Design:** Diverse perspectives drive superior technology. We foster an environment where all backgrounds, ethnicities, identities, and abilities thrive.

## 2. Anti-Harassment & Equal Opportunity
* Zero tolerance for discrimination, harassment, or retaliation.
* Transparent and anonymous reporting mechanisms through our People Ops team.
* Regular bias training for interviewers and hiring managers.

## 3. Time Off & Holidays
* **Flexible Paid Time Off (PTO):** Unlimited PTO policy with a mandatory minimum of 20 days off taken per year.
* 12 official paid company holidays plus 2 floating personal cultural heritage days.
"""


def get_default_hiring_faq(company_name: str) -> str:
    return f"""# {company_name} — Candidate Hiring & Interview FAQ

## 1. Recruitment Stages
* **Stage 1: Recruiter Introduction (30 min):** Career journey discussion, mutual fit, compensation expectations, and role overview.
* **Stage 2: Technical Deep Dive & Problem Solving (60 min):** Practical coding, system architecture, or domain skills discussion.
* **Stage 3: Collaborative Fit & Leadership (45 min):** Values alignment, cross-functional collaboration, and team Q&A.

## 2. Feedback SLA
* We respect candidate time: candidates receive interview status updates within **48 business hours** after each completed interview round.
* Detailed, constructive feedback is provided upon request for all onsite/finalist interviews.
"""


def ingest_policy_doc(
    db: Session,
    company: Company,
    filename: str,
    text: str,
    document_type: str = "company_policy",
    uploaded_by: int | None = None,
) -> tuple[KnowledgeDocument, int]:
    """Create or update a KnowledgeDocument and index its vector chunks."""
    DOCUMENTS_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    stored_name = f"{company.id}_{filename.replace(' ', '_')}"
    file_path = DOCUMENTS_STORAGE_DIR / stored_name

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)

    # Check if document already exists
    doc = (
        db.query(KnowledgeDocument)
        .filter(
            KnowledgeDocument.company_id == company.id,
            KnowledgeDocument.filename == filename,
        )
        .first()
    )

    if not doc:
        doc = KnowledgeDocument(
            filename=filename,
            file_path=str(file_path),
            content_type="text/markdown",
            document_type=document_type,
            extracted_text=text,
            company_id=company.id,
            uploaded_by=uploaded_by,
            indexing_status="pending",
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
    else:
        doc.extracted_text = text
        doc.file_path = str(file_path)
        doc.document_type = document_type
        doc.indexing_status = "pending"
        db.commit()
        db.refresh(doc)

    chunks_count = 0
    try:
        chunks_count = index_knowledge_document(db, doc)
    except Exception as e:
        print(f"[Warning] Failed to index {filename}: {e}")

    return doc, chunks_count


def seed_standard_policies_for_company(
    db: Session,
    company: Company,
    uploaded_by: int | None = None,
    overwrite: bool = False,
) -> int:
    """Ensure all core policy documents exist and are indexed for a company."""
    cname = company.name

    policy_specs = [
        (
            f"{cname} — Maternity & Parental Leave Policy.md",
            get_default_maternity_policy(cname),
            "company_policy",
        ),
        (
            f"{cname} — Remote & Flexible Work Policy.md",
            get_default_remote_work_policy(cname),
            "company_policy",
        ),
        (
            f"{cname} — Health & Wellness Benefits.md",
            get_default_health_benefits(cname),
            "benefits",
        ),
        (
            f"{cname} — Code of Conduct & Culture.md",
            get_default_culture_code(cname),
            "company_policy",
        ),
        (
            f"{cname} — Hiring Process & Interview FAQ.md",
            get_default_hiring_faq(cname),
            "faq",
        ),
    ]

    total_chunks = 0
    for filename, content, doc_type in policy_specs:
        existing = (
            db.query(KnowledgeDocument)
            .filter(
                KnowledgeDocument.company_id == company.id,
                KnowledgeDocument.filename == filename,
            )
            .first()
        )

        if not existing or overwrite:
            _, chunks = ingest_policy_doc(
                db=db,
                company=company,
                filename=filename,
                text=content,
                document_type=doc_type,
                uploaded_by=uploaded_by,
            )
            total_chunks += chunks

    return total_chunks
