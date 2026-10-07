from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    origin: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    destination: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    distance_km: Mapped[int] = mapped_column(
        Integer,
        nullable=True,
    )

    estimated_duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ACTIVE")

    trips = relationship(
        "Trip",
        back_populates="route",
        cascade="all, delete-orphan",
    )

    points = relationship(
        "RoutePoint",
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="RoutePoint.id",
    )