from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum


class DocumentType(str, Enum):
    PDF = "pdf"
    TXT = "txt"
    DOCX = "docx"


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class QualityLabel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    ANOMALOUS = "anomalous"


@dataclass
class Document:
    # input: document metadata; output: domain document entity
    id: str
    filename: str
    doc_type: DocumentType
    content: str
    created_at: datetime = field(default_factory=datetime.now)
    status: ProcessingStatus = ProcessingStatus.PENDING
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Chunk:
    # input: text segment; output: chunk entity with metadata
    id: str
    document_id: str
    content: str
    chunk_index: int
    embedding: Optional[List[float]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchResult:
    # input: vector search output; output: enriched search result
    chunk_id: str
    document_id: str
    content: str
    score: float
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ClusterInfo:
    # input: clustering output; output: cluster metadata
    cluster_id: int
    size: int
    centroid: List[float]
    top_terms: List[str]
    representative_chunks: List[str]


@dataclass
class AnomalyResult:
    # input: chunk data; output: anomaly detection result
    chunk_id: str
    is_anomaly: bool
    anomaly_score: float
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class QualityAssessment:
    # input: chunk content; output: quality classification
    chunk_id: str
    quality_label: QualityLabel
    confidence: float
    features: Dict[str, float] = field(default_factory=dict)


@dataclass
class VisualizationData:
    # input: embeddings + metadata; output: visualization-ready data
    embeddings_2d: List[List[float]]
    labels: List[int]
    texts: List[str]
    metadata: Dict[str, Any] = field(default_factory=dict)
