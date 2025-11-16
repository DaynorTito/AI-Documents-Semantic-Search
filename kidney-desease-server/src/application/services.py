from abc import ABC, abstractmethod
from typing import List, Tuple, Optional, Any, Dict
from src.domain.entities import Chunk, ClusterInfo, QualityLabel
from src.domain.repositories import IModelRepository


class IEmbeddingService(ABC):
    # interface for text embedding generation

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        # input: text string; generates embedding; output: embedding vector
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        # input: text list; generates embeddings; output: embedding matrix
        pass


class IChunkingService(ABC):
    # interface for text chunking operations

    @abstractmethod
    def chunk_text(self, text: str, document_id: str) -> List[Chunk]:
        # input: text, doc id; splits into chunks; output: chunk list
        pass


class IClusteringService(ABC):
    # interface for clustering and dimensionality reduction

    @abstractmethod
    def fit_predict(
        self, embeddings: List[List[float]], texts: List[str], n_clusters: int
    ) -> Tuple[List[int], List[ClusterInfo]]:
        # input: embeddings, texts, k; clusters data; output: labels and cluster info
        pass

    @abstractmethod
    def reduce_dimensions(
        self, embeddings: List[List[float]], n_components: int = 2
    ) -> List[List[float]]:
        # input: embeddings, n_dims; reduces dimensions; output: reduced embeddings
        pass

    @abstractmethod
    def save_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; persists model; output: success status
        pass

    @abstractmethod
    def load_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; loads model; output: success status
        pass


class IAnomalyDetectionService(ABC):
    # interface for anomaly detection

    @abstractmethod
    def fit_predict(
        self, embeddings: List[List[float]], contamination: float = 0.1
    ) -> Tuple[List[int], List[float]]:
        # input: embeddings, contamination; detects anomalies; output: labels and scores
        pass

    @abstractmethod
    def save_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; persists model; output: success status
        pass

    @abstractmethod
    def load_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; loads model; output: success status
        pass


class IQualityClassificationService(ABC):
    # interface for quality classification

    @abstractmethod
    def train(
        self, embeddings: List[List[float]], labels: List[str]
    ) -> Dict[str, float]:
        # input: embeddings, labels; trains classifier; output: performance metrics
        pass

    @abstractmethod
    def predict(
        self, embeddings: List[List[float]]
    ) -> Tuple[List[QualityLabel], List[float]]:
        # input: embeddings; predicts quality; output: labels and confidences
        pass

    @abstractmethod
    def is_trained(self) -> bool:
        # input: none; checks if trained; output: trained boolean
        pass

    @abstractmethod
    def save_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; persists model; output: success status
        pass

    @abstractmethod
    def load_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; loads model; output: success status
        pass
