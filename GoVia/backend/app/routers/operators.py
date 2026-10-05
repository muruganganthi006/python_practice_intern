from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.operator import BusOperator
from app.schemas.operators import OperatorCreate, OperatorResponse


router = APIRouter(
    prefix="/api/operators",
    tags=["operators"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=OperatorResponse, status_code=201)
def create_operator(
    payload: OperatorCreate,
    db: Session = Depends(get_db),
):
    existing_operator = db.scalar(
        select(BusOperator).where(
            BusOperator.name == payload.name
        )
    )

    if existing_operator:
        raise HTTPException(
            status_code=409,
            detail="Operator already exists.",
        )

    operator = BusOperator(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
    )

    db.add(operator)
    db.commit()
    db.refresh(operator)

    return operator


@router.get("/", response_model=list[OperatorResponse])
def get_operators(db: Session = Depends(get_db)):
    return db.scalars(
        select(BusOperator).order_by(BusOperator.id)
    ).all()


@router.get("/{operator_id}", response_model=OperatorResponse)
def get_operator(
    operator_id: int,
    db: Session = Depends(get_db),
):
    operator = db.get(BusOperator, operator_id)

    if operator is None:
        raise HTTPException(
            status_code=404,
            detail="Operator not found.",
        )

    return operator