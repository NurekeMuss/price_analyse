import os
import pathlib

from dotenv import load_dotenv
from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from src.core.logger import get_logger

load_dotenv()


logger = get_logger(__name__)


DATABASE_URL = os.getenv("DATABASE_URL")
DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
# Create the SQLAlchemy engine
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_timeout=60,
    echo=False
)
# Create a sessionmaker with AsyncSession
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)
Base = declarative_base()


async def init_db():
    """
    Initializes the database by creating all tables and populating with mock data.
    """
    try:
        async with engine.begin() as conn:
            await conn.execute(text('DROP TABLE product'))
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully.")

            mock_sql_path = pathlib.Path(__file__).parent / "./default_data/mock_products.sql"
            if mock_sql_path.exists():
                with open(mock_sql_path, "r", encoding="utf-8") as f:
                    sql_statements = f.read()

                for statement in sql_statements.strip().split(";\n"):
                    if statement.strip():
                        await conn.execute(text(statement))  # <-- FIX: wrap in text()
                logger.info("Default product data loaded successfully.")
            else:
                logger.warning("mock_products.sql file not found.")

    except Exception as e:
        logger.error(f"Error initializing database: {e}")


async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except SQLAlchemyError as e:
            logger.error(e)
            await session.rollback()
            raise HTTPException(status_code=500, detail="Database error")
        finally:
            if session:
                await session.close()
                logger.info("Session closed")
