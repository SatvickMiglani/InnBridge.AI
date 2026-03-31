from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings

# NullPool disables SQLAlchemy's connection pool.
# This is required when using Supabase's PgBouncer pooler (port 5432, transaction mode),
# which is incompatible with persistent SQLAlchemy sessions.
# pool_pre_ping=True checks if a connection is alive before using it.
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()