from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import SessionLocal
from app.models import Booking, Trip, User, Bus
from app.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
def get_booking_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    total_bookings = db.query(Booking).count()

    total_revenue = (
        db.query(func.sum(Booking.total_amount))
        .filter(Booking.status == "confirmed")
        .scalar()
        or 0
    )

    total_users = db.query(User).count()
    total_trips = db.query(Trip).count()

    return {
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "total_users": total_users,
        "total_trips": total_trips
    }

@router.get("/occupancy")
def get_occupancy_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    trips = db.query(Trip).all()

    report = []

    for trip in trips:
        bus = db.query(Bus).filter(Bus.id == trip.bus_id).first()

        booked_seats = bus.total_seats - trip.available_seats

        occupancy_percentage = (
            booked_seats / bus.total_seats
        ) * 100

        report.append({
            "trip_id": trip.id,
            "bus_id": bus.id,
            "total_seats": bus.total_seats,
            "booked_seats": booked_seats,
            "available_seats": trip.available_seats,
            "occupancy_percentage": round(occupancy_percentage, 2)
        })

    return report

@router.get("/revenue")
def get_revenue_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    confirmed_bookings = (
        db.query(Booking)
        .filter(Booking.status == "confirmed")
        .all()
    )

    total_revenue = sum(
        booking.total_amount
        for booking in confirmed_bookings
    )

    return {
        "total_confirmed_bookings": len(confirmed_bookings),
        "total_revenue": total_revenue
    }