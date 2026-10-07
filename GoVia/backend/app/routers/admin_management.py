from __future__ import annotations

import csv
from io import StringIO
from datetime import date
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select
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
from app.models.trip_seat_state import TripSeatState
from app.models.user import User, UserRole
from app.schemas.admin import (
    AdminPasswordUpdate,
    AdminProfileUpdate,
    OperatorUpsert,
    RoutePointCreate,
    RoutePointUpdate,
    RouteUpsert,
    SeatStateUpdate,
    UserAdminUpdate,
)
from app.services.seat_management import ensure_bus_seats, trip_seat_payload
from app.utils.security import get_password_hash, verify_password


router = APIRouter(prefix="/api/admin", tags=["admin-management"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _operator_data(operator: BusOperator) -> dict:
    return {
        "id": operator.id,
        "name": operator.name,
        "email": operator.email,
        "phone": operator.phone,
        "address": operator.address,
        "status": operator.status,
        "created_at": operator.created_at.isoformat(),
        "bus_count": len(operator.buses),
        "buses": [
            {"id": bus.id, "bus_number": bus.bus_number, "status": bus.status}
            for bus in operator.buses
        ],
    }


def _point_data(point: RoutePoint) -> dict:
    return {
        "id": point.id,
        "route_id": point.route_id,
        "point_type": point.point_type,
        "name": point.name,
        "address": point.address,
        "point_time": point.point_time.isoformat() if point.point_time else None,
    }


def _route_data(route: Route) -> dict:
    points = [_point_data(point) for point in route.points]
    return {
        "id": route.id,
        "origin": route.origin,
        "destination": route.destination,
        "distance_km": route.distance_km,
        "estimated_duration_minutes": route.estimated_duration_minutes,
        "status": route.status,
        "boarding_points": [point for point in points if point["point_type"] == "BOARDING"],
        "dropping_points": [point for point in points if point["point_type"] == "DROPPING"],
        "trip_count": len(route.trips),
    }


def _booking_data(booking: Booking) -> dict:
    trip = booking.trip
    route = trip.route if trip else None
    bus = trip.bus if trip else None
    payment = booking.payment
    return {
        "id": booking.id,
        "booking_id": f"GV-{booking.id:05d}",
        "user_id": booking.user_id,
        "passenger": booking.user.name,
        "email": booking.user.email,
        "phone": booking.traveler_phone,
        "bus_id": bus.id if bus else None,
        "bus": bus.bus_number if bus else "Unknown bus",
        "route_id": route.id if route else None,
        "route": f"{route.origin} → {route.destination}" if route else "Unknown route",
        "trip_id": trip.id if trip else None,
        "date": trip.travel_date.isoformat() if trip else None,
        "seats": sorted(seat.seat_number for seat in booking.seats),
        "amount": float(booking.total_amount),
        "payment_method": payment.payment_method if payment else None,
        "transaction_id": payment.transaction_id if payment else None,
        "payment_status": payment.payment_status if payment else "UNKNOWN",
        "payment_date": payment.payment_date.isoformat() if payment else None,
        "status": booking.status,
        "created_at": booking.created_at.isoformat(),
    }


@router.get("/dashboard/summary")
def dashboard_summary(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    def count(model, *conditions) -> int:
        return int(db.scalar(select(func.count()).select_from(model).where(*conditions)) or 0)

    bookings = count(Booking)
    cancelled = count(Booking, Booking.status == "CANCELLED")
    upcoming = db.scalars(
        select(Trip)
        .where(Trip.status == "SCHEDULED", Trip.travel_date >= date.today())
        .order_by(Trip.travel_date, Trip.departure_time)
        .limit(8)
    ).all()
    recent_bookings = db.scalars(
        select(Booking).order_by(Booking.created_at.desc()).limit(8)
    ).all()
    recent_payments = db.scalars(
        select(Payment).order_by(Payment.payment_date.desc()).limit(8)
    ).all()
    active_trip_filter = (
        Trip.status == "SCHEDULED",
        Trip.travel_date >= date.today(),
    )
    total_seats = int(
        db.scalar(
            select(func.coalesce(func.sum(Bus.total_seats), 0))
            .join(Trip, Trip.bus_id == Bus.id)
            .where(*active_trip_filter, Bus.status == "ACTIVE")
        )
        or 0
    )
    confirmed_seats = int(
        db.scalar(
            select(func.count(BookingSeat.id))
            .join(Booking, Booking.id == BookingSeat.booking_id)
            .join(Trip, Trip.id == Booking.trip_id)
            .where(Booking.status == "CONFIRMED", *active_trip_filter)
        )
        or 0
    )

    return {
        "operators": count(BusOperator),
        "active_operators": count(BusOperator, BusOperator.status == "ACTIVE"),
        "buses": count(Bus),
        "active_buses": count(Bus, Bus.status == "ACTIVE"),
        "routes": count(Route),
        "trips": count(Trip),
        "scheduled_trips": count(Trip, Trip.status == "SCHEDULED"),
        "completed_trips": count(Trip, Trip.status == "COMPLETED"),
        "cancelled_trips": count(Trip, Trip.status == "CANCELLED"),
        "users": count(User),
        "bookings": bookings,
        "cancelled_bookings": cancelled,
        "revenue": float(
            db.scalar(
                select(func.coalesce(func.sum(Payment.amount), 0)).where(
                    Payment.payment_status == "SUCCESS"
                )
            )
            or 0
        ),
        "successful_payments": count(Payment, Payment.payment_status == "SUCCESS"),
        "failed_payments": count(Payment, Payment.payment_status == "FAILED"),
        "total_seats": total_seats,
        "booked_seats": confirmed_seats,
        "seat_occupancy_percent": round(confirmed_seats * 100 / total_seats) if total_seats else 0,
        "recent_bookings": [_booking_data(booking) for booking in recent_bookings],
        "upcoming_trips": [
            {
                "id": trip.id,
                "route": f"{trip.route.origin} → {trip.route.destination}",
                "bus": trip.bus.bus_number,
                "travel_date": trip.travel_date.isoformat(),
                "departure_time": trip.departure_time.isoformat(),
                "status": trip.status,
            }
            for trip in upcoming
        ],
        "recent_payments": [
            {
                "id": payment.id,
                "booking_id": f"GV-{payment.booking_id:05d}",
                "user": payment.user.name,
                "amount": float(payment.amount),
                "method": payment.payment_method,
                "transaction_id": payment.transaction_id,
                "status": payment.payment_status,
                "payment_date": payment.payment_date.isoformat(),
            }
            for payment in recent_payments
        ],
    }


@router.get("/operators")
def list_operators(
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    statement = select(BusOperator).order_by(BusOperator.id)
    if status_filter:
        statement = statement.where(BusOperator.status == status_filter.upper())
    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(BusOperator.name.ilike(term), BusOperator.email.ilike(term), BusOperator.phone.ilike(term))
        )
    return {"operators": [_operator_data(item) for item in db.scalars(statement).all()]}


@router.post("/operators", status_code=status.HTTP_201_CREATED)
def create_operator(
    payload: OperatorUpsert,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    existing = db.scalar(select(BusOperator).where(BusOperator.name == payload.name))
    if existing:
        raise HTTPException(status_code=409, detail="Operator already exists.")
    operator = BusOperator(**payload.model_dump())
    db.add(operator)
    db.commit()
    db.refresh(operator)
    return {"operator": _operator_data(operator)}


@router.get("/operators/{operator_id}")
def get_operator(
    operator_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    operator = db.get(BusOperator, operator_id)
    if operator is None:
        raise HTTPException(status_code=404, detail="Operator not found.")
    return {"operator": _operator_data(operator)}


@router.put("/operators/{operator_id}")
def update_operator(
    operator_id: int,
    payload: OperatorUpsert,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    operator = db.get(BusOperator, operator_id)
    if operator is None:
        raise HTTPException(status_code=404, detail="Operator not found.")
    duplicate = db.scalar(
        select(BusOperator).where(BusOperator.name == payload.name, BusOperator.id != operator_id)
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="Operator already exists.")
    for key, value in payload.model_dump().items():
        setattr(operator, key, value)
    db.commit()
    db.refresh(operator)
    return {"operator": _operator_data(operator)}


@router.get("/routes")
def list_routes(
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    statement = select(Route).order_by(Route.id)
    if status_filter:
        statement = statement.where(Route.status == status_filter.upper())
    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(or_(Route.origin.ilike(term), Route.destination.ilike(term)))
    return {"routes": [_route_data(route) for route in db.scalars(statement).all()]}


@router.post("/routes", status_code=status.HTTP_201_CREATED)
def create_route(
    payload: RouteUpsert,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    existing = db.scalar(
        select(Route).where(Route.origin == payload.origin, Route.destination == payload.destination)
    )
    if existing:
        raise HTTPException(status_code=409, detail="Route already exists.")
    route = Route(**payload.model_dump())
    db.add(route)
    db.commit()
    db.refresh(route)
    return {"route": _route_data(route)}


@router.get("/routes/{route_id}")
def get_route(
    route_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    route = db.get(Route, route_id)
    if route is None:
        raise HTTPException(status_code=404, detail="Route not found.")
    return {"route": _route_data(route)}


@router.put("/routes/{route_id}")
def update_route(
    route_id: int,
    payload: RouteUpsert,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    route = db.get(Route, route_id)
    if route is None:
        raise HTTPException(status_code=404, detail="Route not found.")
    duplicate = db.scalar(
        select(Route).where(
            Route.origin == payload.origin,
            Route.destination == payload.destination,
            Route.id != route_id,
        )
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="Route already exists.")
    for key, value in payload.model_dump().items():
        setattr(route, key, value)
    db.commit()
    db.refresh(route)
    return {"route": _route_data(route)}


@router.post("/routes/{route_id}/points", status_code=status.HTTP_201_CREATED)
def create_route_point(
    route_id: int,
    payload: RoutePointCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    route = db.get(Route, route_id)
    if route is None:
        raise HTTPException(status_code=404, detail="Route not found.")
    point = RoutePoint(route_id=route_id, **payload.model_dump())
    db.add(point)
    db.commit()
    db.refresh(point)
    return {"point": _point_data(point)}


@router.put("/route-points/{point_id}")
def update_route_point(
    point_id: int,
    payload: RoutePointUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    point = db.get(RoutePoint, point_id)
    if point is None:
        raise HTTPException(status_code=404, detail="Route point not found.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(point, key, value)
    db.commit()
    db.refresh(point)
    return {"point": _point_data(point)}


@router.delete("/route-points/{point_id}")
def delete_route_point(
    point_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    point = db.get(RoutePoint, point_id)
    if point is None:
        raise HTTPException(status_code=404, detail="Route point not found.")
    assigned = db.scalar(
        select(Trip.id).where(
            or_(Trip.boarding_point_id == point_id, Trip.dropping_point_id == point_id)
        ).limit(1)
    )
    if assigned:
        raise HTTPException(status_code=409, detail="This point is assigned to a trip and cannot be removed.")
    db.delete(point)
    db.commit()
    return {"message": "Route point removed."}


@router.get("/buses/{bus_id}/seats")
def list_bus_seats(
    bus_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    bus = db.get(Bus, bus_id)
    if bus is None:
        raise HTTPException(status_code=404, detail="Bus not found.")
    seats = ensure_bus_seats(db, bus)
    db.commit()
    return {
        "bus_id": bus.id,
        "bus_type": bus.bus_type,
        "seats": [
            {
                "seat_number": seat.seat_number,
                "seat_label": seat.seat_label,
                "seat_type": seat.seat_type,
                "row_index": seat.row_index,
                "column_index": seat.column_index,
                "status": seat.status,
            }
            for seat in seats
        ],
    }


@router.put("/buses/{bus_id}/seats/{seat_number}")
def update_bus_seat(
    bus_id: int,
    seat_number: int,
    seat_label: str = Query(..., min_length=1, max_length=12),
    seat_type: str = Query(..., pattern="^(SEATER|SLEEPER)$"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    bus = db.get(Bus, bus_id)
    if bus is None:
        raise HTTPException(status_code=404, detail="Bus not found.")
    ensure_bus_seats(db, bus)
    seat = db.scalar(
        select(BusSeat).where(BusSeat.bus_id == bus_id, BusSeat.seat_number == seat_number)
    )
    if seat is None:
        raise HTTPException(status_code=404, detail="Seat not found.")
    booked = db.scalar(
        select(BookingSeat.id)
        .join(Booking, Booking.id == BookingSeat.booking_id)
        .join(Trip, Trip.id == Booking.trip_id)
        .where(Trip.bus_id == bus_id, BookingSeat.seat_number == seat_number, Booking.status == "CONFIRMED")
        .limit(1)
    )
    if booked:
        raise HTTPException(status_code=409, detail="A booked seat's layout cannot be changed.")
    seat.seat_label = seat_label.strip().upper()
    seat.seat_type = seat_type
    db.commit()
    return {"message": "Seat configuration updated."}


@router.get("/seats")
def list_trip_seats(
    trip_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found.")
    payload = trip_seat_payload(db, trip)
    db.commit()
    return payload


@router.patch("/trips/{trip_id}/seats/{seat_number}")
def update_trip_seat_state(
    trip_id: int,
    seat_number: int,
    payload: SeatStateUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found.")
    layout = ensure_bus_seats(db, trip.bus)
    if not any(seat.seat_number == seat_number for seat in layout):
        raise HTTPException(status_code=404, detail="Seat not found.")
    booking = db.scalar(
        select(BookingSeat.id)
        .join(Booking, Booking.id == BookingSeat.booking_id)
        .where(Booking.trip_id == trip_id, BookingSeat.seat_number == seat_number, Booking.status == "CONFIRMED")
        .limit(1)
    )
    if booking:
        raise HTTPException(status_code=409, detail="A booked seat cannot be changed.")
    state = db.scalar(
        select(TripSeatState).where(
            TripSeatState.trip_id == trip_id,
            TripSeatState.seat_number == seat_number,
        )
    )
    if payload.status == "AVAILABLE":
        if state:
            db.delete(state)
    elif state:
        state.status = payload.status
    else:
        db.add(TripSeatState(trip_id=trip_id, seat_number=seat_number, status=payload.status))
    db.commit()
    return {"message": "Trip seat status updated.", "status": payload.status}


@router.get("/bookings")
def list_admin_bookings(
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
        select(Booking)
        .join(Trip, Trip.id == Booking.trip_id)
        .join(Route, Route.id == Trip.route_id)
        .join(Bus, Bus.id == Trip.bus_id)
        .join(User, User.id == Booking.user_id)
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
        statement = statement.where(
            or_(
                User.name.ilike(term),
                User.email.ilike(term),
                Bus.bus_number.ilike(term),
                Route.origin.ilike(term),
                Route.destination.ilike(term),
                func.cast(Booking.id, str).ilike(term),
            )
        )
    rows = db.scalars(statement).unique().all()
    return {"bookings": [_booking_data(booking) for booking in rows]}


@router.get("/payments")
def list_payments(
    payment_status: str | None = None,
    search: str | None = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    statement = select(Payment).order_by(Payment.payment_date.desc())
    if payment_status:
        statement = statement.where(Payment.payment_status == payment_status.upper())
    if search:
        term = f"%{search.strip()}%"
        statement = statement.join(Payment.user).where(
            or_(Payment.transaction_id.ilike(term), User.name.ilike(term), User.email.ilike(term))
        )
    payments = db.scalars(statement).unique().all()
    return {
        "payments": [
            {
                "id": payment.id,
                "booking_id": f"GV-{payment.booking_id:05d}",
                "user": payment.user.name,
                "amount": float(payment.amount),
                "payment_method": payment.payment_method,
                "transaction_id": payment.transaction_id,
                "payment_status": payment.payment_status,
                "payment_date": payment.payment_date.isoformat(),
            }
            for payment in payments
        ]
    }


@router.get("/users")
def list_users(
    search: str | None = None,
    role: str | None = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    statement = select(User).order_by(User.created_at.desc())
    if role:
        statement = statement.where(User.role == role.upper())
    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(or_(User.name.ilike(term), User.email.ilike(term), User.phone.ilike(term)))
    users = db.scalars(statement).all()
    return {
        "users": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role.value,
                "is_active": user.is_active,
                "booking_count": len(user.bookings),
                "created_at": user.created_at.isoformat(),
            }
            for user in users
        ]
    }


@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    payload: UserAdminUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    values = payload.model_dump(exclude_unset=True)
    remove_admin = (
        user.role == UserRole.ADMIN
        and (("role" in values and values["role"] == "USER") or values.get("is_active") is False)
    )
    if remove_admin:
        active_admins = db.scalar(
            select(func.count()).select_from(User).where(
                User.role == UserRole.ADMIN, User.is_active.is_(True)
            )
        ) or 0
        if active_admins <= 1:
            raise HTTPException(status_code=409, detail="The last active administrator cannot be deactivated or demoted.")
    for key, value in values.items():
        setattr(user, key, UserRole(value) if key == "role" and value else value)
    db.commit()
    db.refresh(user)
    return {"message": "User updated.", "user_id": user.id, "role": user.role.value, "is_active": user.is_active}


@router.get("/profile")
def get_admin_profile(current_user: User = Depends(require_admin)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role.value,
    }


@router.put("/profile")
def update_admin_profile(
    payload: AdminProfileUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    duplicate = db.scalar(select(User).where(User.email == payload.email.lower(), User.id != current_user.id))
    if duplicate:
        raise HTTPException(status_code=409, detail="Email is already in use.")
    current_user.name = payload.name
    current_user.email = payload.email.lower()
    current_user.phone = payload.phone
    db.commit()
    db.refresh(current_user)
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "phone": current_user.phone, "role": current_user.role.value}


@router.patch("/profile/password")
def update_admin_password(
    payload: AdminPasswordUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully."}


@router.get("/settings")
def get_admin_settings(current_user: User = Depends(require_admin)):
    del current_user
    return {
        "application": "GoVia",
        "database": "SQLite",
        "payment_mode": "SIMULATED",
        "booking_cancellation": "Confirmed bookings can be cancelled by their owner or an administrator.",
    }


@router.get("/reports/{report_name}")
def download_report(
    report_name: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    output = StringIO()
    writer = csv.writer(output)

    if report_name == "daily-bookings":
        writer.writerow(["booking_id", "passenger", "email", "route", "bus", "travel_date", "seats", "amount", "status"])
        rows = db.scalars(
            select(Booking).where(func.date(Booking.created_at) == date.today().isoformat()).order_by(Booking.created_at.desc())
        ).all()
        for booking in rows:
            item = _booking_data(booking)
            writer.writerow([item["booking_id"], item["passenger"], item["email"], item["route"], item["bus"], item["date"], ", ".join(map(str, item["seats"])), item["amount"], item["status"]])
    elif report_name == "monthly-revenue":
        writer.writerow(["month", "payment_method", "successful_amount"])
        payments = db.scalars(select(Payment).where(Payment.payment_status == "SUCCESS")).all()
        totals: dict[tuple[str, str], float] = {}
        for payment in payments:
            key = (payment.payment_date.strftime("%Y-%m"), payment.payment_method)
            totals[key] = totals.get(key, 0.0) + float(payment.amount)
        for (month, method), amount in sorted(totals.items()):
            writer.writerow([month, method, f"{amount:.2f}"])
    elif report_name == "fleet-occupancy":
        writer.writerow(["bus_number", "operator", "total_seats", "upcoming_trips", "booked_seats", "occupancy_percent"])
        buses = db.scalars(select(Bus).order_by(Bus.id)).all()
        for bus in buses:
            trips = db.scalars(select(Trip).where(Trip.bus_id == bus.id, Trip.status == "SCHEDULED", Trip.travel_date >= date.today())).all()
            capacity = sum(trip.bus.total_seats for trip in trips)
            booked = int(db.scalar(select(func.count(BookingSeat.id)).join(Booking, Booking.id == BookingSeat.booking_id).join(Trip, Trip.id == BookingSeat.trip_id).where(Trip.bus_id == bus.id, Trip.status == "SCHEDULED", Trip.travel_date >= date.today(), Booking.status == "CONFIRMED")) or 0)
            percent = round(booked * 100 / capacity) if capacity else 0
            writer.writerow([bus.bus_number, bus.operator.name, capacity, len(trips), booked, percent])
    elif report_name == "cancellations":
        writer.writerow(["booking_id", "passenger", "route", "travel_date", "amount", "payment_status", "cancelled_status"])
        rows = db.scalars(select(Booking).where(Booking.status == "CANCELLED").order_by(Booking.created_at.desc())).all()
        for booking in rows:
            item = _booking_data(booking)
            writer.writerow([item["booking_id"], item["passenger"], item["route"], item["date"], item["amount"], item["payment_status"], item["status"]])
    else:
        raise HTTPException(status_code=404, detail="Report type not found.")

    filename = f"govia-{report_name}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.patch("/bookings/{booking_id}/cancel")
def admin_cancel_booking(
    booking_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if booking.status != "CONFIRMED":
        raise HTTPException(status_code=400, detail="Only confirmed bookings can be cancelled.")
    booking.status = "CANCELLED"
    if booking.payment and booking.payment.payment_status == "SUCCESS":
        booking.payment.payment_status = "REFUNDED"
    for seat in list(booking.seats):
        db.delete(seat)
    db.commit()
    db.refresh(booking)
    return {"message": "Booking cancelled successfully.", "booking": _booking_data(booking)}
