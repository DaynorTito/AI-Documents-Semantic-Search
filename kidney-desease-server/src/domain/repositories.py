from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from src.domain.entities import Document, Chunk, SearchResult


class IDocumentRepository(ABC):
    # interface for document persistence operations

    @abstractmethod
    def save(self, document: Document) -> Document:
        # input: document entity; saves document; output: saved document
        pass

    @abstractmethod
    def get_by_id(self, doc_id: str) -> Optional[Document]:
        # input: document id; retrieves document; output: document or None
        pass

    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Document]:
        # input: pagination params; retrieves documents; output: document list
        pass

    @abstractmethod
    def delete(self, doc_id: str) -> bool:
        # input: document id; deletes document; output: success status
        pass


class IVectorRepository(ABC):
    # interface for vector storage and retrieval operations

    @abstractmethod
    def add_chunks(self, chunks: List[Chunk]) -> bool:
        # input: chunks with embeddings; stores vectors; output: success status
        pass

    @abstractmethod
    def search(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[SearchResult]:
        # input: query vector, k, filters; performs search; output: top results
        pass

    @abstractmethod
    def get_all_chunks(self, document_id: Optional[str] = None) -> List[Chunk]:
        # input: optional doc id filter; retrieves chunks; output: chunk list
        pass

    @abstractmethod
    def delete_by_document(self, document_id: str) -> bool:
        # input: document id; deletes related chunks; output: success status
        pass

    @abstractmethod
    def get_all_embeddings(self) -> List[List[float]]:
        # input: none; retrieves all embeddings; output: embedding matrix
        pass


class IModelRepository(ABC):
    # interface for ML model persistence

    @abstractmethod
    def save_model(self, model: Any, model_name: str) -> bool:
        # input: model object, name; persists model; output: success status
        pass

    @abstractmethod
    def load_model(self, model_name: str) -> Optional[Any]:
        # input: model name; loads model; output: model object or None
        pass

    @abstractmethod
    def model_exists(self, model_name: str) -> bool:
        # input: model name; checks existence; output: exists boolean
        pass
