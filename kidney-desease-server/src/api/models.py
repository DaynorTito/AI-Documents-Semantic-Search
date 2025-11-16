from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from src.domain.entities import DocumentType, ProcessingStatus, QualityLabel


class DocumentUploadResponse(BaseModel):
    # response model for document upload
    document_id: str
    filename: str
    status: ProcessingStatus
    message: str


class DocumentResponse(BaseModel):
    # response model for document details
    id: str
    filename: str
    doc_type: DocumentType
    created_at: datetime
    status: ProcessingStatus
    metadata: Dict[str, Any]


class SearchRequest(BaseModel):
    # request model for semantic search
    query: str = Field(..., min_length=1, description="Search query text")
    top_k: int = Field(10, ge=1, le=100, description="Number of results to return")
    filter_document_id: Optional[str] = Field(None, description="Filter by document ID")


class SearchResultResponse(BaseModel):
    # response model for search results
    chunk_id: str
    document_id: str
    content: str
    score: float
    metadata: Dict[str, Any]


class SearchResponse(BaseModel):
    # response model for search endpoint
    query: str
    results: List[SearchResultResponse]
    total_results: int


class ClusterRequest(BaseModel):
    # request model for clustering
    n_clusters: int = Field(5, ge=2, le=20, description="Number of clusters")


class ClusterInfoResponse(BaseModel):
    # response model for cluster information
    cluster_id: int
    size: int
    top_terms: List[str]
    representative_chunks: List[str]


class ClusterResponse(BaseModel):
    # response model for clustering endpoint
    clusters: List[ClusterInfoResponse]
    total_chunks: int


class AnomalyRequest(BaseModel):
    # request model for anomaly detection
    contamination: float = Field(
        0.1, ge=0.01, le=0.5, description="Expected anomaly rate"
    )


class AnomalyResultResponse(BaseModel):
    # response model for anomaly detection result
    chunk_id: str
    is_anomaly: bool
    anomaly_score: float
    metadata: Dict[str, Any]


class AnomalyResponse(BaseModel):
    # response model for anomaly detection endpoint
    results: List[AnomalyResultResponse]
    total_anomalies: int
    total_chunks: int


class QualityTrainingRequest(BaseModel):
    # request model for quality classifier training
    training_data: List[Dict[str, Any]] = Field(
        ..., description="List of training samples with 'chunk_id' and 'label' fields"
    )


class QualityTrainingResponse(BaseModel):
    # response model for training results
    message: str
    metrics: Dict[str, float]


class QualityAssessmentResponse(BaseModel):
    # response model for quality assessment
    chunk_id: str
    quality_label: QualityLabel
    confidence: float
    features: Dict[str, float]


class QualityPredictionResponse(BaseModel):
    # response model for quality prediction endpoint
    assessments: List[QualityAssessmentResponse]
    total_assessed: int


class VisualizationResponse(BaseModel):
    # response model for visualization data
    embeddings_2d: List[List[float]]
    labels: List[int]
    texts: List[str]
    chunk_ids: List[str]
    document_ids: List[str]


class SystemStatusResponse(BaseModel):
    # response model for system status
    total_documents: int
    total_chunks: int
    status_breakdown: Dict[str, int]
    average_chunks_per_document: float


class ErrorResponse(BaseModel):
    # response model for errors
    error: str
    detail: Optional[str] = None


class MessageResponse(BaseModel):
    # generic message response
    message: str
    details: Optional[Dict[str, Any]] = None
