from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
from .database import connect_to_mongo, close_mongo_connection
from .config import settings
from .api import wines, admin, health, status
from .scheduler import start_scheduler, shutdown_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    start_scheduler()
    yield
    # Shutdown
    shutdown_scheduler()
    await close_mongo_connection()


app = FastAPI(
    title="Wine Discovery API",
    description="API for discovering good wines from Dutch supermarkets",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(wines.router, prefix="/api", tags=["wines"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(status.router, prefix="/api", tags=["status"])

# Mount static files for wine images
static_path = Path(__file__).parent.parent / "static"
static_path.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")


@app.get("/")
async def root():
    return {"message": "Wine Discovery API - Visit /docs for API documentation"}

