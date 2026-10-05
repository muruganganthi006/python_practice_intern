from __future__ import annotations

from datetime import date, time

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies.auth import require_admin
from app.models.booking import Booking
from app.models.bus import Bus
from app.models.operator import BusOperator
from app.models.routes import Route
from app.models.trips import Trip
from app.models.user import User


router = APIRouter(prefix="/api/admin", tags=["admin"])


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# BUS SCHEMAS
# ============================================================

class BusCreateRequest(BaseModel):
    operator_id: int
    bus_number: str = Field(..., min_length=1, max_length=50)
    registration_number: str | None = Field(
        default=None,
        max_length=50,
    )
    bus_type: str = Field(..., min_length=1, max_length=50)
    total_seats: int = Field(..., ge=1, le=100)
    amenities: str | None = Field(
        default=None,
        max_length=500,
    )
    status: str = "ACTIVE"

    @field_validator(
        "bus_number",
        "registration_number",
        "bus_type",
        "amenities",
        mode="before",
    )
    @classmethod
    def clean_text(cls, value):
        if value is None:
            return value

        if isinstance(value, str):
            value = value.strip()

        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        value = value.strip().upper()

        allowed_statuses = {
            "ACTIVE",
            "INACTIVE",
            "MAINTENANCE",
        }

        if value not in allowed_statuses:
            raise ValueError(
                "Status must be ACTIVE, INACTIVE, or MAINTENANCE."
            )

        return value


class BusUpdateRequest(BaseModel):
    operator_id: int | None = None
    bus_number: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    registration_number: str | None = Field(
        default=None,
        max_length=50,
    )
    bus_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    total_seats: int | None = Field(
        default=None,
        ge=1,
        le=100,
    )
    amenities: str | None = Field(
        default=None,
        max_length=500,
    )
    status: str | None = None

    @field_validator(
        "bus_number",
        "registration_number",
        "bus_type",
        "amenities",
        mode="before",
    )
    @classmethod
    def clean_text(cls, value):
        if value is None:
            return value

        if isinstance(value, str):
            value = value.strip()

        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip().upper()

        allowed_statuses = {
            "ACTIVE",
            "INACTIVE",
            "MAINTENANCE",
        }

        if value not in allowed_statuses:
            raise ValueError(
                "Status must be ACTIVE, INACTIVE, or MAINTENANCE."
            )

        return value


# ============================================================
# BUS SERIALIZER
# ============================================================

def serialize_bus(bus: Bus, operator: BusOperator) -> dict:
    return {
        "id": bus.id,
        "operator_id": bus.operator_id,
        "operator": operator.name,
        "bus_number": bus.bus_number,
        "registration_number": bus.registration_number,
        "bus_type": bus.bus_type,
        "total_seats": bus.total_seats,
        "amenities": bus.amenities,
        "status": bus.status,
    }


# ============================================================
# BUS MANAGEMENT
# ============================================================

@router.get("/buses")
def list_buses(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    rows = db.execute(
        select(Bus, BusOperator)
        .join(BusOperator, BusOperator.id == Bus.operator_id)
        .order_by(Bus.id.asc())
    ).all()

    return {
        "buses": [
            serialize_bus(bus, operator)
            for bus, operator in rows
        ]
    }


@router.get("/bookings")
def list_bookings(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    rows = db.execute(
        select(Booking, User, Trip, Route, Bus)
        .join(User, User.id == Booking.user_id)
        .join(Trip, Trip.id == Booking.trip_id)
        .join(Route, Route.id == Trip.route_id)
        .join(Bus, Bus.id == Trip.bus_id)
        .order_by(Booking.created_at.desc())
    ).all()

    bookings = []
    for booking, booking_user, trip, route, bus in rows:
        bookings.append(
            {
                "id": booking.id,
                "booking_id": f"GV-{booking.id:05d}",
                "user": booking_user.name,
                "email": booking_user.email,
                "trip": f"{route.origin} → {route.destination}",
                "route": f"{route.origin} → {route.destination}",
                "bus": bus.bus_number,
                "date": str(trip.travel_date),
                "seat": ", ".join(str(seat.seat_number) for seat in booking.seats),
                "seats": ", ".join(str(seat.seat_number) for seat in booking.seats),
                "amount": float(booking.total_amount),
                "status": booking.status,
                "created_at": booking.created_at.isoformat(),
            }
        )

    return {"bookings": bookings}


@router.post(
    "/buses",
    status_code=status.HTTP_201_CREATED,
)
def create_bus(
    payload: BusCreateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    # Check operator
    operator = db.get(BusOperator, payload.operator_id)

    if operator is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found.",
        )

    # Check duplicate bus number
    existing_bus = db.scalar(
        select(Bus).where(
            Bus.bus_number == payload.bus_number
        )
    )

    if existing_bus is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bus number already exists.",
        )

    # Check duplicate registration number
    if payload.registration_number:
        existing_registration = db.scalar(
            select(Bus).where(
                Bus.registration_number
                == payload.registration_number
            )
        )

        if existing_registration is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Registration number already exists.",
            )

    bus = Bus(
        operator_id=payload.operator_id,
        bus_number=payload.bus_number,
        registration_number=payload.registration_number,
        bus_type=payload.bus_type,
        total_seats=payload.total_seats,
        amenities=payload.amenities,
        status=payload.status,
    )

    db.add(bus)
    db.commit()
    db.refresh(bus)

    return {
        "message": "Bus created successfully.",
        "bus": serialize_bus(bus, operator),
    }


@router.put("/buses/{bus_id}")
def update_bus(
    bus_id: int,
    payload: BusUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    bus = db.get(Bus, bus_id)

    if bus is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found.",
        )

    # Update operator
    if payload.operator_id is not None:
        operator = db.get(
            BusOperator,
            payload.operator_id,
        )

        if operator is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Operator not found.",
            )

        bus.operator_id = payload.operator_id

    # Check duplicate bus number
    if payload.bus_number is not None:
        existing_bus = db.scalar(
            select(Bus).where(
                Bus.bus_number == payload.bus_number,
                Bus.id != bus_id,
            )
        )

        if existing_bus is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bus number already exists.",
            )

        bus.bus_number = payload.bus_number

    # Check duplicate registration number
    if payload.registration_number is not None:
        existing_registration = db.scalar(
            select(Bus).where(
                Bus.registration_number
                == payload.registration_number,
                Bus.id != bus_id,
            )
        )

        if existing_registration is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Registration number already exists.",
            )

        bus.registration_number = payload.registration_number

    if payload.bus_type is not None:
        bus.bus_type = payload.bus_type

    if payload.total_seats is not None:
        bus.total_seats = payload.total_seats

    if payload.amenities is not None:
        bus.amenities = payload.amenities

    if payload.status is not None:
        bus.status = payload.status

    db.commit()
    db.refresh(bus)

    operator = db.get(
        BusOperator,
        bus.operator_id,
    )

    return {
        "message": "Bus updated successfully.",
        "bus": serialize_bus(bus, operator),
    }


# ============================================================
# TRIP SCHEMAS
# ============================================================

class TripCreateRequest(BaseModel):
    route_id: int
    bus_id: int
    travel_date: date
    departure_time: str = Field(
        ...,
        examples=["06:30:00"],
    )
    arrival_time: str = Field(
        ...,
        examples=["13:10:00"],
    )
    fare: float
    status: str = "SCHEDULED"

    @field_validator(
        "departure_time",
        "arrival_time",
    )
    @classmethod
    def validate_time_value(cls, value: str) -> str:
        try:
            time.fromisoformat(value)
        except ValueError as exc:
            raise ValueError(
                "Time must be in HH:MM:SS format."
            ) from exc

        return value


class TripUpdateRequest(BaseModel):
    route_id: int | None = None
    bus_id: int | None = None
    travel_date: date | None = None
    departure_time: str | None = None
    arrival_time: str | None = None
    fare: float | None = None
    status: str | None = None

    @field_validator(
        "departure_time",
        "arrival_time",
    )
    @classmethod
    def validate_time_value(cls, value: str | None) -> str | None:
        if value is None:
            return value

        try:
            time.fromisoformat(value)
        except ValueError as exc:
            raise ValueError(
                "Time must be in HH:MM:SS format."
            ) from exc

        return value


# ============================================================
# TRIP MANAGEMENT
# ============================================================

@router.get("/trips")
def list_trips(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    rows = db.execute(
        select(
            Trip,
            Route,
            Bus,
            BusOperator,
        )
        .join(
            Route,
            Route.id == Trip.route_id,
        )
        .join(
            Bus,
            Bus.id == Trip.bus_id,
        )
        .join(
            BusOperator,
            BusOperator.id == Bus.operator_id,
        )
        .order_by(
            Trip.travel_date.desc(),
            Trip.departure_time.asc(),
        )
    ).all()

    trips = []

    for trip, route, bus, operator in rows:
        trips.append(
            {
                "id": trip.id,
                "route": (
                    f"{route.origin} → "
                    f"{route.destination}"
                ),
                "operator": operator.name,
                "bus_number": bus.bus_number,
                "date": str(trip.travel_date),
                "departure": str(trip.departure_time),
                "arrival": str(trip.arrival_time),
                "fare": float(trip.fare),
                "status": trip.status,
                "seats_left": bus.total_seats,
            }
        )

    return {"trips": trips}


@router.post(
    "/trips",
    status_code=status.HTTP_201_CREATED,
)
def create_trip(
    payload: TripCreateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    route = db.get(Route, payload.route_id)

    if route is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found.",
        )

    bus = db.get(Bus, payload.bus_id)

    if bus is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found.",
        )

    departure = time.fromisoformat(
        payload.departure_time
    )

    arrival = time.fromisoformat(
        payload.arrival_time
    )

    if arrival <= departure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Arrival time must be later than "
                "departure time."
            ),
        )

    trip = Trip(
        bus_id=payload.bus_id,
        route_id=payload.route_id,
        travel_date=payload.travel_date,
        departure_time=departure,
        arrival_time=arrival,
        fare=payload.fare,
        status=payload.status.upper(),
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)

    return {
        "message": "Trip created successfully.",
        "trip": {
            "id": trip.id,
            "route": (
                f"{route.origin} → "
                f"{route.destination}"
            ),
            "bus_number": bus.bus_number,
            "date": str(trip.travel_date),
            "departure": str(trip.departure_time),
            "arrival": str(trip.arrival_time),
            "fare": float(trip.fare),
            "status": trip.status,
        },
    }


@router.put("/trips/{trip_id}")
def update_trip(
    trip_id: int,
    payload: TripUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found.",
        )

    if payload.route_id is not None:
        route = db.get(Route, payload.route_id)
        if route is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Route not found.",
            )
        trip.route_id = payload.route_id

    if payload.bus_id is not None:
        bus = db.get(Bus, payload.bus_id)
        if bus is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bus not found.",
            )
        trip.bus_id = payload.bus_id

    if payload.travel_date is not None:
        trip.travel_date = payload.travel_date

    if payload.departure_time is not None:
        trip.departure_time = time.fromisoformat(payload.departure_time)

    if payload.arrival_time is not None:
        trip.arrival_time = time.fromisoformat(payload.arrival_time)

    if payload.fare is not None:
        trip.fare = payload.fare

    if payload.status is not None:
        trip.status = payload.status.upper()

    if trip.arrival_time <= trip.departure_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arrival time must be later than departure time.",
        )

    db.commit()
    db.refresh(trip)

    route = db.get(Route, trip.route_id)
    bus = db.get(Bus, trip.bus_id)

    return {
        "message": "Trip updated successfully.",
        "trip": {
            "id": trip.id,
            "route": f"{route.origin} → {route.destination}",
            "bus_number": bus.bus_number,
            "date": str(trip.travel_date),
            "departure": str(trip.departure_time),
            "arrival": str(trip.arrival_time),
            "fare": float(trip.fare),
            "status": trip.status,
        },
    }