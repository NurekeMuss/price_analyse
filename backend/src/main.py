from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.db.database import engine, init_db
from src.core.logger import get_logger
from src.routers.router import router as api_router
from src.core.config import get_backend_config

config = get_backend_config()

logger = get_logger(__name__)


app = FastAPI(
    title="FastAPI Template",
    description="A FastAPI template with SQLAlchemy, Alembic, and JWT authentication.",
    version="0.1.0",
)


# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_HOSTS,  # Update this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await init_db()
    logger.info("Database initialized")


@app.on_event("shutdown")
async def shutdown():
    """
    Shutdown event handler.
    """
    # Add any shutdown tasks here
    engine.dispose()
    logger.info("Database connection closed")

# Include routers
app.include_router(api_router)
