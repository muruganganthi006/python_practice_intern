from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class BusCreate(BaseModel):
    operator_name: str = Field(min_length=2, max_length=100)
    bus_number: str = Field(min_length=2, max_length=50)
    bus_type: str
    total_seats: int = Field(gt=0)
    amenities: Optional[str] = None


class BusResponse(BaseModel):
    id: int
    operator_name: str
    bus_number: str
    bus_type: str
    total_seats: int
    amenities: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True  

class RouteCreate(BaseModel):
    source: str = Field(min_length=2, max_length=100)
    destination: str = Field(min_length=2, max_length=100)
    distance_km: float = Field(gt=0)


class RouteResponse(BaseModel):
    id: int
    source: str
    destination: str
    distance_km: float
    created_at: datetime

    class Config:
        from_attributes = True

class TripCreate(BaseModel):
    bus_id: int
    route_id: int
    departure_time: datetime
    arrival_time: datetime
    fare: float = Field(gt=0)


class TripResponse(BaseModel):
    id: int
    bus_id: int
    route_id: int
    departure_time: datetime
    arrival_time: datetime
    fare: float
    available_seats: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    trip_id: int
    seat_numbers: str


class BookingResponse(BaseModel):
    id: int
    user_id: int
    trip_id: int
    seat_numbers: str
    num_seats: int
    total_amount: float
    status: str
    booked_at: datetime

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    trip_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BusCreate(BaseModel):
    operator_name: str = Field(
        min_length=2,
        max_length=100
    )

    bus_number: str = Field(
        min_length=2,
        max_length=50
    )

    bus_type: str

    total_seats: int = Field(
        gt=0
    )

    amenities: Optional[str] = None


class BusResponse(BaseModel):
    id: int
    operator_name: str
    bus_number: str
    bus_type: str
    total_seats: int
    amenities: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------
# Route Schemas
# -------------------------

class RouteCreate(BaseModel):
    source: str = Field(
        min_length=2,
        max_length=100
    )

    destination: str = Field(
        min_length=2,
        max_length=100
    )

    distance_km: float = Field(
        gt=0
    )


class RouteResponse(BaseModel):
    id: int
    source: str
    destination: str
    distance_km: float
    created_at: datetime

    class Config:
        from_attributes = True



class TripCreate(BaseModel):
    bus_id: int
    route_id: int
    departure_time: datetime
    arrival_time: datetime
    fare: float = Field(gt=0)


class TripResponse(BaseModel):
    id: int
    bus_id: int
    route_id: int
    departure_time: datetime
    arrival_time: datetime
    fare: float
    available_seats: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TripUpdate(BaseModel):
    departure_time: datetime
    arrival_time: datetime
    fare: float = Field(gt=0)
    status: str = "scheduled"

class BookingCreate(BaseModel):
    trip_id: int
    seat_numbers: list[int] = Field(min_length=1)


class BookingResponse(BaseModel):
    id: int
    user_id: int
    trip_id: int
    seat_numbers: str
    num_seats: int
    total_amount: float
    status: str
    booked_at: datetime

    class Config:
        from_attributes = True

class PaymentRequest(BaseModel):
    booking_id: int
    payment_method: str = Field(min_length=3, max_length=30)


class PaymentResponse(BaseModel):
    booking_id: int
    payment_method: str
    amount: float
    status: str
    message: str

class ReviewCreate(BaseModel):
    trip_id: int
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    trip_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True