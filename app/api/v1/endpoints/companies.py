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


@router.post(
    "/",
    response_model=CompanyCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db),
):
    existing_company = (
        db.query(Company)
        .filter(Company.name == company_data.name)
        .first()
    )

    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company already exists",
        )

    recruiter_code = generate_company_code()

    recruiter_code_hash = hash_company_code(
        recruiter_code
    )

    new_company = Company(
        name=company_data.name,
        recruiter_code_hash=recruiter_code_hash,
        is_active=True,
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return {
        "id": new_company.id,
        "name": new_company.name,
        "recruiter_code": recruiter_code,
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