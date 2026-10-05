from pydantic import BaseModel


class RouteCreate(BaseModel):
    origin: str
    destination: str
    distance_km: int | None = None


class RouteResponse(BaseModel):
    id: int
    origin: str
    destination: str
    distance_km: int | None

    class Config:
        from_attributes = True