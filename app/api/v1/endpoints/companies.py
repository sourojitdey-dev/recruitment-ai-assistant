from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.company import Company
from app.schemas.company import (
    CompanyCreate,
    CompanyCreateResponse,
    CompanyResponse,
)
from app.services.company import (
    generate_company_code,
    hash_company_code,
)


router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)


from app.services.company_policy_defaults import (
    get_default_culture_code,
    get_default_health_benefits,
    get_default_hiring_faq,
    get_default_maternity_policy,
    get_default_remote_work_policy,
    ingest_policy_doc,
    seed_standard_policies_for_company,
)


@router.post(
    "/",
    response_model=CompanyCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db),
):
    clean_name = company_data.name.strip()
    existing_company = (
        db.query(Company)
        .filter(Company.name.ilike(clean_name))
        .first()
    )

    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company '{clean_name}' already exists. Please use a unique name or register as a recruiter for this organization.",
        )

    recruiter_code = generate_company_code()
    recruiter_code_hash = hash_company_code(recruiter_code)

    new_company = Company(
        name=clean_name,
        recruiter_code_hash=recruiter_code_hash,
        is_active=True,
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    # Ingest provided policies or standard templates
    total_indexed_chunks = 0

    # 1. Maternity & Parental Leave Policy
    maternity_text = company_data.maternity_leave_policy or get_default_maternity_policy(new_company.name)
    _, c1 = ingest_policy_doc(
        db=db,
        company=new_company,
        filename=f"{new_company.name} — Maternity & Parental Leave Policy.md",
        text=maternity_text,
        document_type="company_policy",
    )
    total_indexed_chunks += c1

    # 2. Remote Work Policy
    remote_text = company_data.remote_work_policy or get_default_remote_work_policy(new_company.name)
    _, c2 = ingest_policy_doc(
        db=db,
        company=new_company,
        filename=f"{new_company.name} — Remote & Flexible Work Policy.md",
        text=remote_text,
        document_type="company_policy",
    )
    total_indexed_chunks += c2

    # 3. Health & Wellness Benefits
    health_text = company_data.health_benefits or get_default_health_benefits(new_company.name)
    _, c3 = ingest_policy_doc(
        db=db,
        company=new_company,
        filename=f"{new_company.name} — Health & Wellness Benefits.md",
        text=health_text,
        document_type="benefits",
    )
    total_indexed_chunks += c3

    # 4. Code of Conduct & Culture
    culture_text = company_data.culture_code_of_conduct or get_default_culture_code(new_company.name)
    _, c4 = ingest_policy_doc(
        db=db,
        company=new_company,
        filename=f"{new_company.name} — Code of Conduct & Culture.md",
        text=culture_text,
        document_type="company_policy",
    )
    total_indexed_chunks += c4

    # 5. Hiring FAQ
    _, c5 = ingest_policy_doc(
        db=db,
        company=new_company,
        filename=f"{new_company.name} — Hiring Process & Interview FAQ.md",
        text=get_default_hiring_faq(new_company.name),
        document_type="faq",
    )
    total_indexed_chunks += c5

    # 6. Custom policies if provided
    if company_data.custom_policies:
        for custom_item in company_data.custom_policies:
            if custom_item.content and custom_item.content.strip():
                fname = f"{new_company.name} — {custom_item.title.strip()}.md"
                _, cc = ingest_policy_doc(
                    db=db,
                    company=new_company,
                    filename=fname,
                    text=custom_item.content.strip(),
                    document_type=custom_item.document_type or "company_policy",
                )
                total_indexed_chunks += cc

    return {
        "id": new_company.id,
        "name": new_company.name,
        "recruiter_code": recruiter_code,
        "documents_indexed": total_indexed_chunks,
        "message": f"Company '{new_company.name}' registered successfully with {total_indexed_chunks} AI vector knowledge chunks indexed.",
    }


@router.get(
    "/",
    response_model=list[CompanyResponse],
)
def list_companies(
    db: Session = Depends(get_db),
):
    companies = (
        db.query(Company)
        .filter(Company.is_active.is_(True))
        .order_by(Company.name)
        .all()
    )

    return companies