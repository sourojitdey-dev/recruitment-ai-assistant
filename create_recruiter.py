from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


db = SessionLocal()

try:
    existing_user = (
        db.query(User)
        .filter(User.email == "recruiter@test.com")
        .first()
    )

    if existing_user:
        print("Recruiter already exists.")
    else:
        recruiter = User(
            name="Rahul Sharma",
            email="recruiter@test.com",
            password_hash=hash_password("Recruiter@123"),
            role="recruiter",
            is_active=True,
        )

        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)

        print("Recruiter created successfully.")
        print("ID:", recruiter.id)
        print("Email:", recruiter.email)
        print("Role:", recruiter.role)

finally:
    db.close()