from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BusSeat(Base):
    __tablename__ = "bus_seats"
    __table_args__ = (
        UniqueConstraint("bus_id", "seat_number", name="uq_bus_seat_number"),
        UniqueConstraint("bus_id", "seat_label", name="uq_bus_seat_label"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    bus_id: Mapped[int] = mapped_column(ForeignKey("buses.id"), nullable=False, index=True)
    seat_number: Mapped[int] = mapped_column(Integer, nullable=False)
    seat_label: Mapped[str] = mapped_column(String(12), nullable=False)
    seat_type: Mapped[str] = mapped_column(String(20), nullable=False)
    row_index: Mapped[int] = mapped_column(Integer, nullable=False)
    column_index: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="AVAILABLE")

    bus = relationship("Bus", back_populates="seats")
