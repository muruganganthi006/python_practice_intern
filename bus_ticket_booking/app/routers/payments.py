from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Booking, User
from app.schemas import PaymentRequest, PaymentResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PaymentResponse)
def make_payment(
    payment: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == payment.booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot pay for someone else's booking"
        )

    if booking.status != "confirmed":
        raise HTTPException(
            status_code=400,
            detail="Booking is not eligible for payment"
        )

    return {
        "booking_id": booking.id,
        "payment_method": payment.payment_method,
        "amount": booking.total_amount,
        "status": "success",
        "message": "Payment successful"
    }