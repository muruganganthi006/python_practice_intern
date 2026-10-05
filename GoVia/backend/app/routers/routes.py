from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.routes import Route
from app.schemas.routes import RouteCreate, RouteResponse


router = APIRouter(
    prefix="/api/routes",
    tags=["routes"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=RouteResponse, status_code=201)
def create_route(
    payload: RouteCreate,
    db: Session = Depends(get_db),
):
    existing_route = db.scalar(
        select(Route).where(
            Route.origin == payload.origin,
            Route.destination == payload.destination,
        )
    )

    if existing_route:
        raise HTTPException(
            status_code=409,
            detail="Route already exists.",
        )

    route = Route(
        origin=payload.origin,
        destination=payload.destination,
        distance_km=payload.distance_km,
    )

    db.add(route)
    db.commit()
    db.refresh(route)

    return route


@router.get("/", response_model=list[RouteResponse])
def get_routes(db: Session = Depends(get_db)):
    return db.scalars(
        select(Route).order_by(Route.id)
    ).all()


@router.get("/{route_id}", response_model=RouteResponse)
def get_route(
    route_id: int,
    db: Session = Depends(get_db),
):
    route = db.get(Route, route_id)

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found.",
        )

    return route