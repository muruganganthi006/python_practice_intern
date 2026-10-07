from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import TokenResponse, UserLoginRequest, UserPublic, UserRegisterRequest
from app.utils.security import create_access_token, get_password_hash, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    existing_user = db.scalar(select(User).where(User.email == normalized_email))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    user = User(
        name=payload.name.strip(),
        email=normalized_email,
        password_hash=get_password_hash(payload.password),
        phone=payload.phone,
        role=UserRole.USER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Registration successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role.value,
        },
    }


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower().strip()))
    if (
        not user
        or not user.is_active
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(str(user.id), user.role.value)

    return TokenResponse(
        access_token=token,
        user=UserPublic(
            id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            role=user.role.value,
        ),
    )


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return UserPublic(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role.value,
    )
