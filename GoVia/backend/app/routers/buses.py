from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies.auth import require_admin
from app.models.bus import Bus
from app.models.operator import BusOperator
from app.models.user import User
from app.schemas.buses import BusCreate, BusResponse


router = APIRouter(
    prefix="/api/buses",
    tags=["buses"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=BusResponse, status_code=201)
def create_bus(
    payload: BusCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    operator = db.get(BusOperator, payload.operator_id)

    if operator is None:
        raise HTTPException(
            status_code=404,
            detail="Operator not found.",
        )

    existing_bus = db.scalar(
        select(Bus).where(
            Bus.bus_number == payload.bus_number
        )
    )

    if existing_bus:
        raise HTTPException(
            status_code=409,
            detail="Bus number already exists.",
        )

    bus = Bus(
        operator_id=payload.operator_id,
        bus_number=payload.bus_number,
        bus_type=payload.bus_type,
        total_seats=payload.total_seats,
        amenities=payload.amenities,
    )

    db.add(bus)
    db.commit()
    db.refresh(bus)

    return bus


@router.get("/", response_model=list[BusResponse])
def get_buses(db: Session = Depends(get_db)):
    return db.scalars(
        select(Bus).order_by(Bus.id)
    ).all()


@router.get("/{bus_id}", response_model=BusResponse)
def get_bus(
    bus_id: int,
    db: Session = Depends(get_db),
):
    bus = db.get(Bus, bus_id)

    if bus is None:
        raise HTTPException(
            status_code=404,
            detail="Bus not found.",
        )

    return bus