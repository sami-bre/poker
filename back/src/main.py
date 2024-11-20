import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router
from .repositories.postgres_repository import PostgresHandRepository


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://poker:poker@db:5432/poker",
    )
    repo = PostgresHandRepository(database_url)
    repo.init_tables()
    yield
    # Shutdown (if needed)


app = FastAPI(lifespan=lifespan)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
