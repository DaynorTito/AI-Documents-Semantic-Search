from functools import lru_cache
from src.config.settings import settings
from src.infrastructure.ml.embedding_service import EmbeddingService
from src.infrastructure.ml.chunking_service import ChunkingService
from src.infrastructure.ml.clustering_service import ClusteringService
from src.infrastructure.ml.anomaly_service import AnomalyDetectionService
from src.infrastructure.ml.quality_service import QualityClassificationService
from src.infrastructure.persistence.document_repository import FileDocumentRepository
from src.infrastructure.persistence.vector_repository import ChromaVectorRepository
from src.infrastructure.persistence.model_repository import FileModelRepository
from src.infrastructure.document.document_processor import DocumentProcessor
from src.application.use_cases import (
    IngestDocumentUseCase,
    SearchDocumentsUseCase,
    ClusterDocumentsUseCase,
    DetectAnomaliesUseCase,
    ClassifyQualityUseCase,
    GetVisualizationDataUseCase,
    GetSystemStatusUseCase,
)


@lru_cache()
def get_embedding_service() -> EmbeddingService:
    # input: none; creates singleton embedding service; output: service instance
    return EmbeddingService(settings.embedding_model)


@lru_cache()
def get_chunking_service() -> ChunkingService:
    # input: none; creates singleton chunking service; output: service instance
    return ChunkingService(settings.chunk_size, settings.chunk_overlap)


@lru_cache()
def get_clustering_service() -> ClusteringService:
    # input: none; creates singleton clustering service; output: service instance
    return ClusteringService()


@lru_cache()
def get_anomaly_service() -> AnomalyDetectionService:
    # input: none; creates singleton anomaly service; output: service instance
    return AnomalyDetectionService()


@lru_cache()
def get_quality_service() -> QualityClassificationService:
    # input: none; creates singleton quality service; output: service instance
    return QualityClassificationService()


@lru_cache()
def get_document_repository() -> FileDocumentRepository:
    # input: none; creates singleton document repository; output: repository instance
    return FileDocumentRepository(settings.documents_db_dir)


@lru_cache()
def get_vector_repository() -> ChromaVectorRepository:
    # input: none; creates singleton vector repository; output: repository instance
    return ChromaVectorRepository(settings.chroma_persist_dir)


@lru_cache()
def get_model_repository() -> FileModelRepository:
    # input: none; creates singleton model repository; output: repository instance
    return FileModelRepository(settings.models_dir)


@lru_cache()
def get_document_processor() -> DocumentProcessor:
    # input: none; creates singleton document processor; output: processor instance
    return DocumentProcessor()


def get_ingest_use_case() -> IngestDocumentUseCase:
    # input: none; creates ingest use case with dependencies; output: use case instance
    return IngestDocumentUseCase(
        get_document_repository(),
        get_vector_repository(),
        get_chunking_service(),
        get_embedding_service(),
    )


def get_search_use_case() -> SearchDocumentsUseCase:
    # input: none; creates search use case with dependencies; output: use case instance
    return SearchDocumentsUseCase(get_vector_repository(), get_embedding_service())


def get_cluster_use_case() -> ClusterDocumentsUseCase:
    # input: none; creates cluster use case with dependencies; output: use case instance
    return ClusterDocumentsUseCase(
        get_vector_repository(), get_clustering_service(), get_model_repository()
    )


def get_anomaly_use_case() -> DetectAnomaliesUseCase:
    # input: none; creates anomaly use case with dependencies; output: use case instance
    return DetectAnomaliesUseCase(
        get_vector_repository(), get_anomaly_service(), get_model_repository()
    )


def get_quality_use_case() -> ClassifyQualityUseCase:
    # input: none; creates quality use case with dependencies; output: use case instance
    return ClassifyQualityUseCase(
        get_vector_repository(), get_quality_service(), get_model_repository()
    )


def get_visualization_use_case() -> GetVisualizationDataUseCase:
    # input: none; creates visualization use case with dependencies; output: use case instance
    return GetVisualizationDataUseCase(
        get_vector_repository(), get_clustering_service()
    )


def get_status_use_case() -> GetSystemStatusUseCase:
    # input: none; creates status use case with dependencies; output: use case instance
    return GetSystemStatusUseCase(get_document_repository(), get_vector_repository())
