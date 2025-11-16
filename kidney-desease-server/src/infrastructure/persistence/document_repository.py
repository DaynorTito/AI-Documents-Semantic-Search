from typing import List, Optional, Dict
import json
import logging
from pathlib import Path
from src.domain.entities import Document
from src.domain.repositories import IDocumentRepository

logger = logging.getLogger(__name__)


class InMemoryDocumentRepository(IDocumentRepository):
    # in-memory document storage implementation

    def __init__(self):
        # input: none; initializes storage; output: none
        self.documents: Dict[str, Document] = {}

    def save(self, document: Document) -> Document:
        # input: document entity; saves document; output: saved document
        self.documents[document.id] = document
        logger.debug(f"Saved document {document.id}")
        return document

    def get_by_id(self, doc_id: str) -> Optional[Document]:
        # input: document id; retrieves document; output: document or None
        return self.documents.get(doc_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Document]:
        # input: pagination params; retrieves documents; output: document list
        docs = list(self.documents.values())
        return docs[skip : skip + limit]

    def delete(self, doc_id: str) -> bool:
        # input: document id; deletes document; output: success status
        if doc_id in self.documents:
            del self.documents[doc_id]
            logger.info(f"Deleted document {doc_id}")
            return True
        return False


class FileDocumentRepository(IDocumentRepository):
    # file-based document storage implementation

    def __init__(self, storage_dir: str = "./data/documents_db"):
        # input: storage directory; initializes; output: none
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Document repository initialized at {self.storage_dir}")

    def save(self, document: Document) -> Document:
        # input: document entity; saves to file; output: saved document
        file_path = self.storage_dir / f"{document.id}.json"

        doc_dict = {
            "id": document.id,
            "filename": document.filename,
            "doc_type": document.doc_type.value,
            "content": document.content,
            "created_at": document.created_at.isoformat(),
            "status": document.status.value,
            "metadata": document.metadata,
        }

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(doc_dict, f, ensure_ascii=False, indent=2)

        logger.debug(f"Saved document {document.id} to {file_path}")
        return document

    def get_by_id(self, doc_id: str) -> Optional[Document]:
        # input: document id; retrieves from file; output: document or None
        file_path = self.storage_dir / f"{doc_id}.json"

        if not file_path.exists():
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                doc_dict = json.load(f)

            from datetime import datetime
            from src.domain.entities import DocumentType, ProcessingStatus

            document = Document(
                id=doc_dict["id"],
                filename=doc_dict["filename"],
                doc_type=DocumentType(doc_dict["doc_type"]),
                content=doc_dict["content"],
                created_at=datetime.fromisoformat(doc_dict["created_at"]),
                status=ProcessingStatus(doc_dict["status"]),
                metadata=doc_dict["metadata"],
            )
            return document

        except Exception as e:
            logger.error(f"Error loading document {doc_id}: {str(e)}")
            return None

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Document]:
        # input: pagination params; retrieves documents; output: document list
        documents = []

        for file_path in sorted(self.storage_dir.glob("*.json")):
            doc_id = file_path.stem
            document = self.get_by_id(doc_id)
            if document:
                documents.append(document)

        return documents[skip : skip + limit]

    def delete(self, doc_id: str) -> bool:
        # input: document id; deletes file; output: success status
        file_path = self.storage_dir / f"{doc_id}.json"

        if file_path.exists():
            file_path.unlink()
            logger.info(f"Deleted document {doc_id}")
            return True
        return False
