from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Trip, Bus, Route
from app.schemas import TripCreate, TripResponse


router = APIRouter(
    prefix="/trips",
    tags=["Trips"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# Create Trip
@router.post("/", response_model=TripResponse, status_code=201)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):

    bus = db.query(Bus).filter(Bus.id == trip.bus_id).first()

    if not bus:
        raise HTTPException(
            status_code=404,
            detail="Bus not found"
        )

    route = db.query(Route).filter(Route.id == trip.route_id).first()

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found"
        )

    if trip.arrival_time <= trip.departure_time:
        raise HTTPException(
            status_code=400,
            detail="Arrival time must be after departure time"
        )

    new_trip = Trip(
        bus_id=trip.bus_id,
        route_id=trip.route_id,
        departure_time=trip.departure_time,
        arrival_time=trip.arrival_time,
        fare=trip.fare,
        available_seats=bus.total_seats,
        status="scheduled"
    )

    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    return new_trip