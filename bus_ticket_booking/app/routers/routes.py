from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Route
from app.schemas import RouteCreate, RouteResponse


router = APIRouter(
    prefix="/routes",
    tags=["Routes"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# Create Route
@router.post("/", response_model=RouteResponse, status_code=201)
def create_route(route: RouteCreate, db: Session = Depends(get_db)):

    new_route = Route(
        source=route.source,
        destination=route.destination,
        distance_km=route.distance_km
    )

    db.add(new_route)
    db.commit()
    db.refresh(new_route)

    return new_route


# Get All Routes
@router.get("/", response_model=list[RouteResponse])
def get_routes(db: Session = Depends(get_db)):
    routes = db.query(Route).all()
    return routes


# Get Route by ID
@router.get("/{route_id}", response_model=RouteResponse)
def get_route(route_id: int, db: Session = Depends(get_db)):

    route = db.query(Route).filter(Route.id == route_id).first()

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found"
        )

    return route


# Delete Route
@router.delete("/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db)):

    route = db.query(Route).filter(Route.id == route_id).first()

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found"
        )

    db.delete(route)
    db.commit()

    return {
        "message": "Route deleted successfully"
    }