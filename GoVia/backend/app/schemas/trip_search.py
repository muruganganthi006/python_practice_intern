from datetime import date, time

from pydantic import BaseModel


class TripSearchResponse(BaseModel):
    id: int
    bus_id: int
    route_id: int
    boarding_point_id: int | None = None
    dropping_point_id: int | None = None
    boarding_point: str | None = None
    dropping_point: str | None = None
    distance_km: int | None = None
    estimated_duration_minutes: int | None = None

    origin: str
    destination: str

    travel_date: date
    departure_time: time
    arrival_time: time

    operator: str
    bus_number: str
    bus_type: str

    fare: float
    total_seats: int
    status: str