from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from pathlib import Path
from src.config.settings import settings
from src.api.routes import (
    documents,
    search,
    clustering,
    anomaly,
    quality,
    visualization,
    status,
)

logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Kidney Disease Knowledge Base API",
    description="API for managing and exploring medical documents about kidney disease",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(search.router)
app.include_router(clustering.router)
app.include_router(anomaly.router)
app.include_router(quality.router)
app.include_router(visualization.router)
app.include_router(status.router)


@app.on_event("startup")
async def startup_event():
    # input: none; initializes directories; output: none
    logger.info("Starting Kidney Disease Knowledge Base API")

    Path(settings.documents_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.models_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.documents_db_dir).mkdir(parents=True, exist_ok=True)

    logger.info("Directories initialized")
    logger.info(f"Embedding model: {settings.embedding_model}")
    logger.info(f"Chunk size: {settings.chunk_size}")


@app.get("/")
async def root():
    # input: none; returns welcome message; output: api info
    return {
        "message": "Kidney Disease Knowledge Base API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    # input: none; checks health; output: health status
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app", host=settings.api_host, port=settings.api_port, reload=True
    )
