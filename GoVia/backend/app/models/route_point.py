from __future__ import annotations

from datetime import time

from sqlalchemy import ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RoutePoint(Base):
    __tablename__ = "route_points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id"), nullable=False, index=True)
    point_type: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    point_time: Mapped[time | None] = mapped_column(Time, nullable=True)

    route = relationship("Route", back_populates="points")
