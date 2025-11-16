from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings
import logging
from src.domain.entities import Chunk, SearchResult
from src.domain.repositories import IVectorRepository

logger = logging.getLogger(__name__)


class ChromaVectorRepository(IVectorRepository):
    # chromadb vector storage implementation

    def __init__(self, persist_directory: str = "./data/chroma_db"):
        # input: persist directory; initializes chromadb; output: none
        logger.info(f"Initializing ChromaDB at {persist_directory}")

        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False, allow_reset=True),
        )

        self.collection = self.client.get_or_create_collection(
            name="kidney_disease_docs", metadata={"hnsw:space": "cosine"}
        )

        logger.info("ChromaDB initialized successfully")

    def add_chunks(self, chunks: List[Chunk]) -> bool:
        # input: chunks with embeddings; stores vectors; output: success status
        if not chunks:
            logger.warning("No chunks to add")
            return False

        try:
            ids = [chunk.id for chunk in chunks]
            embeddings = [chunk.embedding for chunk in chunks]
            documents = [chunk.content for chunk in chunks]
            metadatas = [
                {
                    "document_id": chunk.document_id,
                    "chunk_index": chunk.chunk_index,
                    **chunk.metadata,
                }
                for chunk in chunks
            ]

            self.collection.add(
                ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas
            )

            logger.info(f"Added {len(chunks)} chunks to vector database")
            return True

        except Exception as e:
            logger.error(f"Error adding chunks to vector database: {str(e)}")
            raise

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[SearchResult]:
        # input: query vector, k, filters; performs search; output: top results
        try:
            where_filter = filter_metadata if filter_metadata else None

            results = self.collection.query(
                query_embeddings=[query_embedding], n_results=top_k, where=where_filter
            )

            search_results = []

            if results["ids"] and len(results["ids"]) > 0:
                for i in range(len(results["ids"][0])):
                    result = SearchResult(
                        chunk_id=results["ids"][0][i],
                        document_id=results["metadatas"][0][i].get("document_id", ""),
                        content=results["documents"][0][i],
                        score=float(1 - results["distances"][0][i]),
                        metadata=results["metadatas"][0][i],
                    )
                    search_results.append(result)

            logger.info(f"Search completed: {len(search_results)} results")
            return search_results

        except Exception as e:
            logger.error(f"Error searching vector database: {str(e)}")
            raise

    def get_all_chunks(self, document_id: Optional[str] = None) -> List[Chunk]:
        # input: optional doc id filter; retrieves chunks; output: chunk list
        try:
            where_filter = {"document_id": document_id} if document_id else None

            results = self.collection.get(
                where=where_filter, include=["embeddings", "documents", "metadatas"]
            )

            chunks = []

            has_embeddings = (
                results["embeddings"] is not None and len(results["embeddings"]) > 0
            )

            for i in range(len(results["ids"])):
                chunk = Chunk(
                    id=results["ids"][i],
                    document_id=results["metadatas"][i].get("document_id", ""),
                    content=results["documents"][i],
                    chunk_index=results["metadatas"][i].get("chunk_index", 0),
                    embedding=results["embeddings"][i] if has_embeddings else None,
                    metadata=results["metadatas"][i],
                )
                chunks.append(chunk)

            logger.info(f"Retrieved {len(chunks)} chunks")
            return chunks

        except Exception as e:
            logger.error(f"Error retrieving chunks: {str(e)}")
            raise

    def delete_by_document(self, document_id: str) -> bool:
        # input: document id; deletes related chunks; output: success status
        try:
            self.collection.delete(where={"document_id": document_id})
            logger.info(f"Deleted chunks for document {document_id}")
            return True

        except Exception as e:
            logger.error(f"Error deleting chunks for document {document_id}: {str(e)}")
            return False

    def get_all_embeddings(self) -> List[List[float]]:
        # input: none; retrieves all embeddings; output: embedding matrix
        try:
            results = self.collection.get(include=["embeddings"])

            if results["embeddings"] is not None and len(results["embeddings"]) > 0:
                logger.info(f"Retrieved {len(results['embeddings'])} embeddings")
                return results["embeddings"]

            return []

        except Exception as e:
            logger.error(f"Error retrieving embeddings: {str(e)}")
            raise
