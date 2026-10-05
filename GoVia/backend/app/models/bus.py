from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Bus(Base):
    __tablename__ = "buses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    operator_id: Mapped[int] = mapped_column(
        ForeignKey("operators.id"),
        nullable=False,
    )

    bus_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    registration_number: Mapped[str | None] = mapped_column(
        String(50),
        unique=True,
        nullable=True,
    )

    bus_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    total_seats: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    amenities: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="ACTIVE",
    )

    operator = relationship(
        "BusOperator",
        back_populates="buses",
    )

    trips = relationship(
        "Trip",
        back_populates="bus",
        cascade="all, delete-orphan",
    )