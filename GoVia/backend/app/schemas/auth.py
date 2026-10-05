from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator, model_validator


class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Name is required.")
        return value.strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 7:
            raise ValueError("Password must be at least 7 characters long.")
        if not any(ch.isupper() for ch in value):
            raise ValueError("Password must include at least one uppercase letter.")
        if not any(ch.islower() for ch in value):
            raise ValueError("Password must include at least one lowercase letter.")
        if not any(ch.isdigit() for ch in value):
            raise ValueError("Password must include at least one number.")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned = "".join(ch for ch in value if ch.isdigit())
        if len(cleaned) < 10:
            raise ValueError("Phone number must contain at least 10 digits.")
        return cleaned


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
