from __future__ import annotations

from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies.auth import require_admin
from app.models.booking import Booking, BookingSeat
from app.models.bus import Bus
from app.models.bus_seat import BusSeat
from app.models.operator import BusOperator
from app.models.payment import Payment
from app.models.routes import Route
from app.models.route_point import RoutePoint
from app.models.trips import Trip
from app.models.user import User
from app.services.seat_management import ensure_bus_seats


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


def validate_trip_assignment(
    db: Session,
    *,
    route_id: int,
    bus_id: int,
    travel_date: date,
    departure: time,
    arrival: time,
    boarding_point_id: int | None,
    dropping_point_id: int | None,
    excluded_trip_id: int | None = None,
    require_active: bool = True,
) -> tuple[Route, Bus]:
    route = db.get(Route, route_id)
    bus = db.get(Bus, bus_id)
    if route is None or (require_active and route.status != "ACTIVE"):
        raise HTTPException(status_code=400, detail="An active route must be selected.")
    if bus is None or (require_active and bus.status != "ACTIVE"):
        raise HTTPException(status_code=400, detail="An active bus must be selected.")
    if bus.operator is None or (require_active and bus.operator.status != "ACTIVE"):
        raise HTTPException(status_code=400, detail="The bus operator is inactive.")
    if departure == arrival:
        raise HTTPException(status_code=400, detail="Departure and arrival times must differ.")

    for point_id, expected_type in (
        (boarding_point_id, "BOARDING"),
        (dropping_point_id, "DROPPING"),
    ):
        if point_id is None:
            continue
        point = db.get(RoutePoint, point_id)
        if point is None or point.route_id != route_id or point.point_type != expected_type:
            raise HTTPException(status_code=400, detail=f"Select a valid {expected_type.lower()} point for this route.")

    start = datetime.combine(travel_date, departure)
    end = datetime.combine(travel_date, arrival)
    if end <= start:
        end += timedelta(days=1)

    possible_conflicts = db.scalars(
        select(Trip).where(
            Trip.bus_id == bus_id,
            Trip.status == "SCHEDULED",
            Trip.travel_date >= travel_date - timedelta(days=1),
            Trip.travel_date <= travel_date,
            Trip.id != (excluded_trip_id or -1),
        )
    ).all()
    for existing in possible_conflicts:
        existing_start = datetime.combine(existing.travel_date, existing.departure_time)
        existing_end = datetime.combine(existing.travel_date, existing.arrival_time)
        if existing_end <= existing_start:
            existing_end += timedelta(days=1)
        if start < existing_end and existing_start < end:
            raise HTTPException(status_code=409, detail="The bus already has a trip during this time.")

    return route, bus


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
    search: str | None = None,
    route_id: int | None = None,
    bus_id: int | None = None,
    travel_date: date | None = None,
    booking_status: str | None = None,
    payment_status: str | None = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    statement = (
        select(Booking, User, Trip, Route, Bus, Payment)
        .join(User, User.id == Booking.user_id)
        .join(Trip, Trip.id == Booking.trip_id)
        .join(Route, Route.id == Trip.route_id)
        .join(Bus, Bus.id == Trip.bus_id)
        .outerjoin(Payment, Payment.booking_id == Booking.id)
        .order_by(Booking.created_at.desc())
    )
    if route_id is not None:
        statement = statement.where(Route.id == route_id)
    if bus_id is not None:
        statement = statement.where(Bus.id == bus_id)
    if travel_date is not None:
        statement = statement.where(Trip.travel_date == travel_date)
    if booking_status:
        statement = statement.where(Booking.status == booking_status.upper())
    if payment_status:
        statement = statement.where(Payment.payment_status == payment_status.upper())
    if search:
        term = f"%{search.strip()}%"
        booking_id_term = search.strip().removeprefix("GV-").lstrip("0")
        conditions = [
            User.name.ilike(term),
            User.email.ilike(term),
            Bus.bus_number.ilike(term),
            Route.origin.ilike(term),
            Route.destination.ilike(term),
        ]
        if booking_id_term.isdigit():
            conditions.append(cast(Booking.id, String).ilike(f"%{booking_id_term}%"))
        statement = statement.where(or_(*conditions))
    rows = db.execute(statement).all()

    bookings = []
    for booking, booking_user, trip, route, bus, payment in rows:
        seats = ", ".join(str(seat.seat_number) for seat in booking.seats)
        bookings.append(
            {
                "id": booking.id,
                "booking_id": f"GV-{booking.id:05d}",
                "user": booking_user.name,
                "passenger": booking_user.name,
                "email": booking_user.email,
                "trip": f"{route.origin} → {route.destination}",
                "route": f"{route.origin} → {route.destination}",
                "route_id": route.id,
                "bus": bus.bus_number,
                "bus_id": bus.id,
                "date": str(trip.travel_date),
                "seat": seats,
                "seats": seats,
                "amount": float(booking.total_amount),
                "status": booking.status,
                "payment_method": payment.payment_method if payment else None,
                "transaction_id": payment.transaction_id if payment else None,
                "payment_status": payment.payment_status if payment else "UNKNOWN",
                "payment_date": payment.payment_date.isoformat() if payment else None,
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
    if payload.status == "ACTIVE" and operator.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An active bus cannot be assigned to an inactive operator.",
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
    ensure_bus_seats(db, bus)
    db.commit()

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

        if bus.status == "ACTIVE" and operator.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An active bus cannot be assigned to an inactive operator.",
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
        if payload.total_seats < bus.total_seats:
            occupied = db.scalar(
                select(BookingSeat.id)
                .join(Booking, Booking.id == BookingSeat.booking_id)
                .join(Trip, Trip.id == Booking.trip_id)
                .where(
                    Trip.bus_id == bus_id,
                    Booking.status == "CONFIRMED",
                    BookingSeat.seat_number > payload.total_seats,
                )
                .limit(1)
            )
            if occupied:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bus capacity cannot be reduced below seats already booked.",
                )
            for seat in db.scalars(
                select(BusSeat).where(
                    BusSeat.bus_id == bus_id,
                    BusSeat.seat_number > payload.total_seats,
                )
            ).all():
                db.delete(seat)
        bus.total_seats = payload.total_seats

    if payload.amenities is not None:
        bus.amenities = payload.amenities

    if payload.status is not None:
        bus.status = payload.status

    operator = db.get(BusOperator, bus.operator_id)
    if bus.status == "ACTIVE" and (operator is None or operator.status != "ACTIVE"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An active bus requires an active operator.",
        )

    db.commit()
    db.refresh(bus)
    ensure_bus_seats(db, bus)
    db.commit()

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
    boarding_point_id: int | None = None
    dropping_point_id: int | None = None
    travel_date: date
    departure_time: str = Field(
        ...,
        examples=["06:30:00"],
    )
    arrival_time: str = Field(
        ...,
        examples=["13:10:00"],
    )
    fare: float = Field(..., gt=0)
    status: str = "SCHEDULED"

    @field_validator("status")
    @classmethod
    def validate_trip_status(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in {"SCHEDULED", "CANCELLED", "COMPLETED"}:
            raise ValueError("Status must be SCHEDULED, CANCELLED, or COMPLETED.")
        return normalized

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
    boarding_point_id: int | None = None
    dropping_point_id: int | None = None
    travel_date: date | None = None
    departure_time: str | None = None
    arrival_time: str | None = None
    fare: float | None = Field(default=None, gt=0)
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_trip_status(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().upper()
        if normalized not in {"SCHEDULED", "CANCELLED", "COMPLETED"}:
            raise ValueError("Status must be SCHEDULED, CANCELLED, or COMPLETED.")
        return normalized

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
                "route_id": route.id,
                "bus_id": bus.id,
                "boarding_point_id": trip.boarding_point_id,
                "dropping_point_id": trip.dropping_point_id,
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
                "boarding_point": trip.boarding_point.name if trip.boarding_point else None,
                "dropping_point": trip.dropping_point.name if trip.dropping_point else None,
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

    departure = time.fromisoformat(payload.departure_time)
    arrival = time.fromisoformat(payload.arrival_time)
    route, bus = validate_trip_assignment(
        db,
        route_id=payload.route_id,
        bus_id=payload.bus_id,
        travel_date=payload.travel_date,
        departure=departure,
        arrival=arrival,
        boarding_point_id=payload.boarding_point_id,
        dropping_point_id=payload.dropping_point_id,
    )

    trip = Trip(
        bus_id=payload.bus_id,
        route_id=payload.route_id,
        boarding_point_id=payload.boarding_point_id,
        dropping_point_id=payload.dropping_point_id,
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
            "boarding_point": trip.boarding_point.name if trip.boarding_point else None,
            "dropping_point": trip.dropping_point.name if trip.dropping_point else None,
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
        trip.route_id = payload.route_id

    if payload.bus_id is not None:
        trip.bus_id = payload.bus_id

    if payload.boarding_point_id is not None:
        trip.boarding_point_id = payload.boarding_point_id

    if payload.dropping_point_id is not None:
        trip.dropping_point_id = payload.dropping_point_id

    if payload.travel_date is not None:
        trip.travel_date = payload.travel_date

    if payload.departure_time is not None:
        trip.departure_time = time.fromisoformat(payload.departure_time)

    if payload.arrival_time is not None:
        trip.arrival_time = time.fromisoformat(payload.arrival_time)

    if payload.fare is not None:
        trip.fare = payload.fare

    if payload.status is not None:
        trip.status = payload.status

    validate_trip_assignment(
        db,
        route_id=trip.route_id,
        bus_id=trip.bus_id,
        travel_date=trip.travel_date,
        departure=trip.departure_time,
        arrival=trip.arrival_time,
        boarding_point_id=trip.boarding_point_id,
        dropping_point_id=trip.dropping_point_id,
        excluded_trip_id=trip.id,
        require_active=trip.status == "SCHEDULED",
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