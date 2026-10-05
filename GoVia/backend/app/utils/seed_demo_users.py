from sqlalchemy import select

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.utils.security import get_password_hash


def seed_demo_users() -> None:
    db = SessionLocal()
    try:
        existing_user = db.scalar(select(User).where(User.email == "user@govia.com"))
        if not existing_user:
            db.add(
                User(
                    name="Demo User",
                    email="user@govia.com",
                    password_hash=get_password_hash("User@123"),
                    phone="9876543210",
                    role=UserRole.USER,
                )
            )

        existing_admin = db.scalar(select(User).where(User.email == "admin@govia.com"))
        if not existing_admin:
            db.add(
                User(
                    name="Demo Admin",
                    email="admin@govia.com",
                    password_hash=get_password_hash("Admin@123"),
                    phone="9876543211",
                    role=UserRole.ADMIN,
                )
            )

        db.commit()
    finally:
        db.close()
