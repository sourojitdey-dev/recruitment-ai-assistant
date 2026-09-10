
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    InterviewerRegister,
    RecruiterRegister,
    TokenResponse,
    UserRegister,
    UserResponse,
)
from app.services.company import verify_company_code


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="candidate",
        company_id=None,
        favorite_book_hash=hash_password(
            user_data.favorite_book
        ),
        favorite_person_hash=hash_password(
            user_data.favorite_person
        ),
        is_active=True,
    )

    db.add(new_user)
    db.flush()

    candidate = Candidate(
        user_id=new_user.id,
        phone=user_data.phone,
        location=user_data.location,
        bio=user_data.bio,
    )
    db.add(candidate)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/register/recruiter",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_recruiter(
    user_data: RecruiterRegister,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    company = (
        db.query(Company)
        .filter(
            func.lower(Company.name)
            == user_data.company_name.strip().lower(),
            Company.is_active.is_(True),
        )
        .first()
    )

    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    if not verify_company_code(
        user_data.recruiter_code,
        company.recruiter_code_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid company recruiter code",
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="recruiter",
        company_id=company.id,
        favorite_book_hash=hash_password(
            user_data.favorite_book
        ),
        favorite_person_hash=hash_password(
            user_data.favorite_person
        ),
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/register/interviewer",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_interviewer(
    user_data: InterviewerRegister,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    company = (
        db.query(Company)
        .filter(
            func.lower(Company.name)
            == user_data.company_name.strip().lower(),
            Company.is_active.is_(True),
        )
        .first()
    )

    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    if not verify_company_code(
        user_data.recruiter_code,
        company.recruiter_code_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid company recruiter code",
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="interviewer",
        company_id=company.id,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post(
    "/forgot-password",
)
def forgot_password(
    reset_data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == reset_data.email)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.favorite_book_hash is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security questions are not configured",
        )

    if user.favorite_person_hash is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security questions are not configured",
        )

    if not verify_password(
        reset_data.favorite_book,
        user.favorite_book_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid security answers",
        )

    if not verify_password(
        reset_data.favorite_person,
        user.favorite_person_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid security answers",
        )

    user.password_hash = hash_password(
        reset_data.new_password
    )

    db.commit()

    return {
        "message": "Password reset successfully"
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user

