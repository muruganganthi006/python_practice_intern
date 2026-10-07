from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import check_database_connection, init_db
from app.routers.buses import router as buses_router
from app.routers.admin import router as admin_router
from app.routers.admin_management import router as admin_management_router
from app.routers.auth import router as auth_router
from app.routers.bookings import router as bookings_router
from app.routers.operators import router as operators_router
from app.routers.travel import router as travel_router
from app.routers.routes import router as routes_router
from app.routers.trips import router as trips_router
from app.utils.seed_demo_travel_data import seed_demo_travel_data
from app.utils.seed_demo_users import seed_demo_users


app = FastAPI(
    title="GoVia API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routers
app.include_router(auth_router)
app.include_router(travel_router)
app.include_router(bookings_router)
app.include_router(admin_router)
app.include_router(admin_management_router)
app.include_router(operators_router)
app.include_router(buses_router)
app.include_router(routes_router)
app.include_router(trips_router)


@app.on_event("startup")
def startup_event() -> None:
    init_db()
    seed_demo_users()
    seed_demo_travel_data()


@app.get("/")
def read_root():
    return {
        "message": "Welcome to GoVia API"
    }


@app.get("/api/health")
def health_check():
    connected, details = check_database_connection()

    return {
        "status": "healthy",
        "service": "GoVia API",
        "database": {
            "connected": connected,
            "details": details,
        },
    }