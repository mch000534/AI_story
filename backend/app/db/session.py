"""
AI Story Backend - Database Session Management
"""
from typing import Generator
from sqlalchemy.orm import Session

from .base import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Get database session dependency for FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
