from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.booking import BookingSeat
from app.models.bus import Bus
from app.models.operator import BusOperator
from app.models.routes import Route
from app.models.trips import Trip
from app.schemas.trips import TripCreate, TripResponse
from app.schemas.trip_search import TripSearchResponse


router = APIRouter(
    prefix="/api/trips",
    tags=["trips"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=TripResponse, status_code=201)
def create_trip(
    payload: TripCreate,
    db: Session = Depends(get_db),
):
    bus = db.get(Bus, payload.bus_id)

    if bus is None:
        raise HTTPException(
            status_code=404,
            detail="Bus not found.",
        )

    route = db.get(Route, payload.route_id)

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found.",
        )

    trip = Trip(
        bus_id=payload.bus_id,
        route_id=payload.route_id,
        travel_date=payload.travel_date,
        departure_time=payload.departure_time,
        arrival_time=payload.arrival_time,
        fare=payload.fare,
        status=payload.status,
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)

    return trip


@router.get("/", response_model=list[TripResponse])
def get_trips(db: Session = Depends(get_db)):
    return db.scalars(
        select(Trip).order_by(
            Trip.travel_date,
            Trip.departure_time,
        )
    ).all()


@router.get("/search", response_model=list[TripSearchResponse])
def search_trips(
    origin: str,
    destination: str,
    travel_date: date,
    db: Session = Depends(get_db),
):
    statement = (
        select(Trip, Bus, Route, BusOperator)
        .join(Bus, Trip.bus_id == Bus.id)
        .join(Route, Trip.route_id == Route.id)
        .join(BusOperator, Bus.operator_id == BusOperator.id)
        .where(
            Route.origin.ilike(origin.strip()),
            Route.destination.ilike(destination.strip()),
            Trip.travel_date == travel_date,
            Trip.status == "SCHEDULED",
        )
        .order_by(Trip.departure_time)
    )

    results = db.execute(statement).all()

    return [
        TripSearchResponse(
            id=trip.id,
            bus_id=bus.id,
            route_id=route.id,
            origin=route.origin,
            destination=route.destination,
            travel_date=trip.travel_date,
            departure_time=trip.departure_time,
            arrival_time=trip.arrival_time,
            operator=operator.name,
            bus_number=bus.bus_number,
            bus_type=bus.bus_type,
            fare=float(trip.fare),
            total_seats=bus.total_seats,
            status=trip.status,
        )
        for trip, bus, route, operator in results
    ]


@router.get("/{trip_id}/seats")
def get_trip_seats(
    trip_id: int,
    db: Session = Depends(get_db),
):
    trip = db.get(Trip, trip_id)

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found.",
        )

    if trip.bus is None:
        raise HTTPException(
            status_code=400,
            detail="Trip is not assigned to a bus.",
        )

    booked_seats = db.scalars(
        select(BookingSeat.seat_number)
        .where(BookingSeat.trip_id == trip_id)
        .order_by(BookingSeat.seat_number)
    ).all()

    total_seats = trip.bus.total_seats
    available_seats = [seat for seat in range(1, total_seats + 1) if seat not in booked_seats]

    return {
        "trip_id": trip.id,
        "total_seats": total_seats,
        "booked_seats": booked_seats,
        "available_seats": available_seats,
    }


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
):
    trip = db.get(Trip, trip_id)

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found.",
        )

    return trip