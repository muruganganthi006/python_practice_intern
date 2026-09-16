from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Review, Trip, User, Booking
from app.schemas import ReviewCreate, ReviewResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == review.trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    booking = (
        db.query(Booking)
        .filter(
            Booking.user_id == current_user.id,
            Booking.trip_id == review.trip_id,
            Booking.status == "confirmed"
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=400,
            detail="You can only review a trip you have booked"
        )

    new_review = Review(
        user_id=current_user.id,
        trip_id=review.trip_id,
        rating=review.rating,
        comment=review.comment
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review

@router.get("/trip/{trip_id}", response_model=list[ReviewResponse])
def get_trip_reviews(
    trip_id: int,
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    reviews = (
        db.query(Review)
        .filter(Review.trip_id == trip_id)
        .all()
    )

    return reviews