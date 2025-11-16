from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # application configuration settings

    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    chroma_persist_dir: str = "./data/chroma_db"
    documents_dir: str = "./data/documents"
    models_dir: str = "./data/models"
    documents_db_dir: str = "./data/documents_db"

    chunk_size: int = 512
    chunk_overlap: int = 50

    min_quality_score: float = 0.6
    anomaly_contamination: float = 0.1
    n_clusters: int = 5

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    log_level: str = "INFO"

    max_upload_size: int = 10 * 1024 * 1024

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
