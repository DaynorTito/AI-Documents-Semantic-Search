from typing import List
import uuid
import logging
from src.application.services import IChunkingService
from src.domain.entities import Chunk

logger = logging.getLogger(__name__)


class ChunkingService(IChunkingService):
    # splits text into overlapping chunks

    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 50):
        # input: chunk size, overlap; initializes; output: none
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        logger.info(
            f"ChunkingService initialized: size={chunk_size}, overlap={chunk_overlap}"
        )

    def chunk_text(self, text: str, document_id: str) -> List[Chunk]:
        # input: text, doc id; splits into chunks; output: chunk list
        if not text or not text.strip():
            logger.warning(f"Empty text provided for chunking document {document_id}")
            return []

        text = self._clean_text(text)

        chunks = []
        start = 0
        chunk_index = 0

        while start < len(text):
            end = start + self.chunk_size
            chunk_text = text[start:end]

            if chunk_text.strip():
                chunk = Chunk(
                    id=str(uuid.uuid4()),
                    document_id=document_id,
                    content=chunk_text.strip(),
                    chunk_index=chunk_index,
                    metadata={
                        "start_pos": start,
                        "end_pos": end,
                        "length": len(chunk_text),
                    },
                )
                chunks.append(chunk)
                chunk_index += 1

            start += self.chunk_size - self.chunk_overlap

        logger.info(f"Created {len(chunks)} chunks from document {document_id}")
        return chunks

    def _clean_text(self, text: str) -> str:
        # input: raw text; cleans text; output: cleaned text
        text = " ".join(text.split())
        text = text.replace("\x00", "")
        return text
