from datetime import date, time

from pydantic import BaseModel


class TripSearchResponse(BaseModel):
    id: int
    bus_id: int
    route_id: int

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