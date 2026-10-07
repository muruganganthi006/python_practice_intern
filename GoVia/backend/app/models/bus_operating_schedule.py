from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BusOperatingSchedule(Base):
    __tablename__ = "bus_operating_schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    bus_id: Mapped[int] = mapped_column(
        ForeignKey("buses.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    operating_days: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVE",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    bus = relationship("Bus", back_populates="operating_schedule")
    trips = relationship(
        "Trip",
        back_populates="schedule",
        cascade="all, delete-orphan",
    )
