from __future__ import annotations

from datetime import time
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class OperatorUpsert(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=300)
    status: Literal["ACTIVE", "INACTIVE"] = "ACTIVE"

    @field_validator("name", "phone", "address", mode="before")
    @classmethod
    def strip_optional_text(cls, value):
        return value.strip() if isinstance(value, str) else value


class RouteUpsert(BaseModel):
    origin: str = Field(min_length=1, max_length=100)
    destination: str = Field(min_length=1, max_length=100)
    distance_km: int | None = Field(default=None, gt=0)
    estimated_duration_minutes: int | None = Field(default=None, gt=0)
    status: Literal["ACTIVE", "INACTIVE"] = "ACTIVE"

    @field_validator("origin", "destination")
    @classmethod
    def strip_route_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Route origin and destination are required.")
        return value


class RoutePointCreate(BaseModel):
    point_type: Literal["BOARDING", "DROPPING"]
    name: str = Field(min_length=1, max_length=150)
    address: str | None = Field(default=None, max_length=300)
    point_time: time | None = None

    @field_validator("name", "address", mode="before")
    @classmethod
    def strip_point_text(cls, value):
        return value.strip() if isinstance(value, str) else value


class RoutePointUpdate(BaseModel):
    point_type: Literal["BOARDING", "DROPPING"] | None = None
    name: str | None = Field(default=None, min_length=1, max_length=150)
    address: str | None = Field(default=None, max_length=300)
    point_time: time | None = None


class SeatStateUpdate(BaseModel):
    status: Literal["AVAILABLE", "RESERVED", "BLOCKED"]


class UserAdminUpdate(BaseModel):
    role: Literal["USER", "ADMIN"] | None = None
    is_active: bool | None = None


class AdminProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=10, max_length=20)

    @field_validator("name", "phone")
    @classmethod
    def strip_profile_text(cls, value: str) -> str:
        return value.strip()


class AdminPasswordUpdate(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8)


class SimulatedPaymentInput(BaseModel):
    payment_method: Literal["UPI", "CARD", "NET_BANKING", "CASH"] = "UPI"
