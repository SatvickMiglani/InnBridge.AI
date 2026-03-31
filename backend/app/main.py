from contextlib import asynccontextmanager
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import papers, users, feed, connect, projects
from app.db.database import Base, engine
from app.db import models  # ensures all models are registered

logger = logging.getLogger(__name__)
_executor = ThreadPoolExecutor(max_workers=1)


def _sync_create_tables():
    Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables in a background thread with a timeout so startup is never blocked
    loop = asyncio.get_event_loop()
    try:
        await asyncio.wait_for(
            loop.run_in_executor(_executor, _sync_create_tables),
            timeout=10.0
        )
        logger.info("Database tables created/verified successfully.")
    except asyncio.TimeoutError:
        logger.warning("Table creation timed out — hit /create-tables manually once DB is reachable.")
    except Exception as e:
        logger.warning(f"Could not create tables on startup: {e}")
    yield


app = FastAPI(title="InnoBridge.AI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(papers.router, prefix="/papers", tags=["papers"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(feed.router, prefix="/feed", tags=["feed"])
app.include_router(connect.router, prefix="/projects", tags=["enroll"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])

@app.get("/")
def root():
    return {"status": "InnoBridge.AI API is running"}

@app.get("/create-tables")
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        return {"status": "tables created", "tables": list(Base.metadata.tables.keys())}
    except Exception as e:
        return {"error": str(e)}