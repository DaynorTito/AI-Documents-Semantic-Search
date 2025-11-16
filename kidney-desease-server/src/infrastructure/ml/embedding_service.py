from typing import List
from sentence_transformers import SentenceTransformer
import logging
from src.application.services import IEmbeddingService

logger = logging.getLogger(__name__)


class EmbeddingService(IEmbeddingService):
    # generates embeddings using sentence transformers

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        # input: model name; loads model; output: none
        self.model_name = model_name
        logger.info(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        logger.info("Embedding model loaded successfully")

    def embed_text(self, text: str) -> List[float]:
        # input: text string; generates embedding; output: embedding vector
        if not text or not text.strip():
            logger.warning("Empty text provided for embedding")
            return [0.0] * self.model.get_sentence_embedding_dimension()

        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        # input: text list; generates embeddings; output: embedding matrix
        if not texts:
            logger.warning("Empty text list provided for batch embedding")
            return []

        clean_texts = [text if text and text.strip() else " " for text in texts]

        embeddings = self.model.encode(
            clean_texts,
            convert_to_numpy=True,
            batch_size=32,
            show_progress_bar=len(clean_texts) > 100,
        )

        logger.info(f"Generated {len(embeddings)} embeddings")
        return embeddings.tolist()

    def get_embedding_dimension(self) -> int:
        # input: none; returns dimension; output: embedding dimension
        return self.model.get_sentence_embedding_dimension()
