from datetime import datetime

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    trip_id: int
    passenger_count: int = Field(default=1, ge=1)
    selected_seats: list[int] | None = None
    traveler_name: str
    traveler_phone: str
    traveler_email: str


class BookingResponse(BaseModel):
    id: int
    user_id: int
    trip_id: int
    passenger_count: int
    selected_seats: list[int] | None = None
    traveler_name: str
    traveler_phone: str
    traveler_email: str
    total_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True