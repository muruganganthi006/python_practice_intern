from pydantic import BaseModel


class BusCreate(BaseModel):
    operator_id: int
    bus_number: str
    bus_type: str
    total_seats: int
    amenities: str | None = None


class BusResponse(BaseModel):
    id: int
    operator_id: int
    bus_number: str
    bus_type: str
    total_seats: int
    amenities: str | None

    class Config:
        from_attributes = True