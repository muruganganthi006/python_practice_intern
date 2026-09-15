from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Bus
from app.schemas import BusCreate, BusResponse


router = APIRouter(
    prefix="/buses",
    tags=["Buses"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# -------------------------
# Create Bus
# -------------------------

@router.post(
    "/",
    response_model=BusResponse,
    status_code=201
)
def create_bus(
    bus: BusCreate,
    db: Session = Depends(get_db)
):

    existing_bus = db.query(Bus).filter(
        Bus.bus_number == bus.bus_number
    ).first()

    if existing_bus:
        raise HTTPException(
            status_code=400,
            detail="Bus number already exists"
        )

    new_bus = Bus(
        operator_name=bus.operator_name,
        bus_number=bus.bus_number,
        bus_type=bus.bus_type,
        total_seats=bus.total_seats,
        amenities=bus.amenities
    )

    db.add(new_bus)
    db.commit()
    db.refresh(new_bus)

    return new_bus


# -------------------------
# Get All Buses
# -------------------------

@router.get(
    "/",
    response_model=list[BusResponse]
)
def get_buses(
    db: Session = Depends(get_db)
):
    buses = db.query(Bus).all()

    return buses


# -------------------------
# Get Bus by ID
# -------------------------

@router.get(
    "/{bus_id}",
    response_model=BusResponse
)
def get_bus(
    bus_id: int,
    db: Session = Depends(get_db)
):

    bus = db.query(Bus).filter(
        Bus.id == bus_id
    ).first()

    if not bus:
        raise HTTPException(
            status_code=404,
            detail="Bus not found"
        )

    return bus


# -------------------------
# Update Bus
# -------------------------

@router.put(
    "/{bus_id}",
    response_model=BusResponse
)
def update_bus(
    bus_id: int,
    bus_data: BusCreate,
    db: Session = Depends(get_db)
):

    bus = db.query(Bus).filter(
        Bus.id == bus_id
    ).first()

    if not bus:
        raise HTTPException(
            status_code=404,
            detail="Bus not found"
        )

    existing_bus = db.query(Bus).filter(
        Bus.bus_number == bus_data.bus_number,
        Bus.id != bus_id
    ).first()

    if existing_bus:
        raise HTTPException(
            status_code=400,
            detail="Bus number already exists"
        )

    bus.operator_name = bus_data.operator_name
    bus.bus_number = bus_data.bus_number
    bus.bus_type = bus_data.bus_type
    bus.total_seats = bus_data.total_seats
    bus.amenities = bus_data.amenities

    db.commit()
    db.refresh(bus)

    return bus

# -------------------------
# Delete Bus
# -------------------------

@router.delete("/{bus_id}")
def delete_bus(
    bus_id: int,
    db: Session = Depends(get_db)
):

    bus = db.query(Bus).filter(
        Bus.id == bus_id
    ).first()

    if not bus:
        raise HTTPException(
            status_code=404,
            detail="Bus not found"
        )

    active_trips = [
        trip for trip in bus.trips
        if trip.status == "scheduled"
    ]

    if active_trips:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete bus with active trips"
        )

    db.delete(bus)
    db.commit()

    return {
        "message": "Bus deleted successfully"
    }