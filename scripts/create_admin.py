import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


def create_initial_admin():
    db = SessionLocal()
    try:
        admin_email = "admin@recruitment-ai.com"
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            print(f"Admin user already exists: {existing.email}")
            return

        admin = User(
            name="System Administrator",
            email=admin_email,
            password_hash=hash_password("Admin@123456"),
            role="admin",
            favorite_book_hash=hash_password("Clean Code"),
            favorite_person_hash=hash_password("Alan Turing"),
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("Admin user created successfully!")
        print(f"Email: {admin.email}")
        print("Password: Admin@123456")
    finally:
        db.close()


if __name__ == "__main__":
    create_initial_admin()
