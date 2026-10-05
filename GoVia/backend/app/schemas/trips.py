from datetime import date, time

from pydantic import BaseModel


class TripCreate(BaseModel):
    bus_id: int
    route_id: int
    travel_date: date
    departure_time: time
    arrival_time: time
    fare: float
    status: str = "SCHEDULED"


class TripResponse(BaseModel):
    id: int
    bus_id: int
    route_id: int
    travel_date: date
    departure_time: time
    arrival_time: time
    fare: float
    status: str

    class Config:
        from_attributes = True