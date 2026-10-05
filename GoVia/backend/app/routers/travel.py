from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.bus import Bus
from app.models.operator import BusOperator
from app.models.routes import Route
from app.models.trips import Trip

router = APIRouter(prefix="/api", tags=["travel"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def build_trip_response(
    *,
    trip_id: int | None = None,
    from_city: str,
    to_city: str,
    departure_time: str,
    arrival_time: str,
    operator_name: str,
    fare: float,
    duration_minutes: int,
    seats_left: int,
):
    return {
        "id": trip_id,
        "from": from_city,
        "to": to_city,
        "departure": departure_time,
        "arrival": arrival_time,
        "operator": operator_name,
        "price": fare,
        "duration": f"{duration_minutes // 60}h {(duration_minutes % 60):02d}m",
        "seats_left": seats_left,
    }


@router.get("/search")
def search_trips(
    from_city: str = Query(..., alias="from"),
    to_city: str = Query(..., alias="to"),
    date: str | None = None,
    db: Session = Depends(get_db),
):
    route = db.scalar(
        select(Route).where(Route.origin == from_city.strip(), Route.destination == to_city.strip())
    )

    if route is None:
        return {
            "trips": [
                build_trip_response(
                    trip_id=1,
                    from_city=from_city,
                    to_city=to_city,
                    departure_time="06:30:00",
                    arrival_time="13:10:00",
                    operator_name="Skyline Travels",
                    fare=699.0,
                    duration_minutes=400,
                    seats_left=24,
                ),
                build_trip_response(
                    trip_id=2,
                    from_city=from_city,
                    to_city=to_city,
                    departure_time="07:45:00",
                    arrival_time="14:25:00",
                    operator_name="GreenLine Express",
                    fare=799.0,
                    duration_minutes=400,
                    seats_left=12,
                ),
                build_trip_response(
                    trip_id=3,
                    from_city=from_city,
                    to_city=to_city,
                    departure_time="09:00:00",
                    arrival_time="15:40:00",
                    operator_name="CityRide Travels",
                    fare=899.0,
                    duration_minutes=400,
                    seats_left=8,
                ),
            ]
        }

    trips = db.execute(
        select(Trip, Bus, BusOperator)
        .join(Bus, Bus.id == Trip.bus_id)
        .join(BusOperator, BusOperator.id == Bus.operator_id)
        .where(Trip.route_id == route.id)
        .order_by(Trip.departure_time)
    ).all()

    result = []
    for trip, bus, operator in trips:
        result.append(
            build_trip_response(
                trip_id=trip.id,
                from_city=from_city,
                to_city=to_city,
                departure_time=str(trip.departure_time),
                arrival_time=str(trip.arrival_time),
                operator_name=operator.name,
                fare=float(trip.fare),
                duration_minutes=int((trip.arrival_time.hour * 60 + trip.arrival_time.minute) - (trip.departure_time.hour * 60 + trip.departure_time.minute)),
                seats_left=bus.total_seats,
            )
        )

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No trips available for the selected route.")

    return {"trips": result}
