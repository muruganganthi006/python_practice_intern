from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Trip, Bus, Route
from app.schemas import TripCreate, TripUpdate, TripResponse

router = APIRouter(prefix="/trips", tags=["Trips"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=TripResponse, status_code=201)
def create_trip(
    trip: TripCreate,
    db: Session = Depends(get_db)
):
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

@router.get("/", response_model=list[TripResponse])
def get_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).all()
    return trips

@router.get("/search", response_model=list[TripResponse])
def search_trips(
    source: str,
    destination: str,
    date: str,
    db: Session = Depends(get_db)
):
    trips = (
        db.query(Trip)
        .join(Route)
        .filter(
            Route.source.ilike(source),
            Route.destination.ilike(destination),
            Trip.departure_time >= f"{date} 00:00:00",
            Trip.departure_time < f"{date} 23:59:59"
        )
        .all()
    )

    return trips

@router.get("/{trip_id}/seats")
def get_trip_seats(
    trip_id: int,
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    bus = db.query(Bus).filter(Bus.id == trip.bus_id).first()

    if not bus:
        raise HTTPException(
            status_code=404,
            detail="Bus not found"
        )

    seats = []

    for seat_number in range(1, bus.total_seats + 1):
        seats.append({
            "seat_number": seat_number,
            "status": "available"
        })

    return {
        "trip_id": trip.id,
        "total_seats": bus.total_seats,
        "available_seats": trip.available_seats,
        "seats": seats
    }

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    return trip

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    trip_data: TripUpdate,
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    trip.departure_time = trip_data.departure_time
    trip.arrival_time = trip_data.arrival_time
    trip.fare = trip_data.fare
    trip.status = trip_data.status

    db.commit()
    db.refresh(trip)

    return trip

@router.delete("/{trip_id}")
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    if trip.bookings:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a trip with existing bookings"
        )

    db.delete(trip)
    db.commit()

    return {
        "message": "Trip deleted successfully"
    }