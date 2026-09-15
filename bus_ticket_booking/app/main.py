from fastapi import FastAPI

from app.database import engine, Base
from app import models

from app.routers import auth, buses, routes, trips


Base.metadata.create_all(bind=engine)


app = FastAPI(title="Bus Ticket Booking System")


app.include_router(auth.router)
app.include_router(buses.router)
app.include_router(routes.router)
app.include_router(trips.router)


@app.get("/")
def root():
    return {"message": "Bus Ticket Booking System API"}