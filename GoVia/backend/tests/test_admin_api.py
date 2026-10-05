from fastapi.testclient import TestClient
from sqlalchemy import select

from app.database import SessionLocal, init_db
from app.main import app
from app.models.user import User, UserRole
from app.utils.security import create_access_token


client = TestClient(app)


def test_admin_trip_listing_requires_admin_access():
    init_db()

    db = SessionLocal()
    try:
        admin = db.scalar(select(User).where(User.email == "admin@govia.com"))
        if admin is None:
            admin = User(
                name="Admin User",
                email="admin@govia.com",
                password_hash="hashed",
                phone="9876543211",
                role=UserRole.ADMIN,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
    finally:
        db.close()

    token = create_access_token(str(admin.id), admin.role.value)
    response = client.get(
        "/api/admin/trips",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    body = response.json()
    assert "trips" in body
