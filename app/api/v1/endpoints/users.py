from fastapi import APIRouter, Depends

from app.api.deps import require_roles, require_self_or_roles
from app.models.user import User


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/candidate-only")
def candidate_only(
    current_user: User = Depends(
        require_roles("candidate")
    ),
):
    return {
        "message": "Candidate access granted",
        "user_id": current_user.id,
        "role": current_user.role,
    }


@router.get("/recruiter-only")
def recruiter_only(
    current_user: User = Depends(
        require_roles("recruiter")
    ),
):
    return {
        "message": "Recruiter access granted",
        "user_id": current_user.id,
        "role": current_user.role,
    }


@router.get("/interviewer-only")
def interviewer_only(
    current_user: User = Depends(
        require_roles("interviewer")
    ),
):
    return {
        "message": "Interviewer access granted",
        "user_id": current_user.id,
        "role": current_user.role,
    }

@router.get("/profile/{user_id}")
def get_profile(
    user_id: int,
    current_user: User = Depends(
        require_self_or_roles("recruiter")
    ),
):
    return {
        "message": "Profile access granted",
        "requested_user_id": user_id,
        "current_user_id": current_user.id,
        "current_user_role": current_user.role,
    }