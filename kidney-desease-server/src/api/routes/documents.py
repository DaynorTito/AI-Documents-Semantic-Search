from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from typing import List
import uuid
import shutil
from pathlib import Path
import logging
from src.api.models import (
    DocumentUploadResponse,
    DocumentResponse,
    MessageResponse,
    ErrorResponse,
)
from src.domain.entities import Document, DocumentType, ProcessingStatus
from src.api.dependencies import (
    get_ingest_use_case,
    get_document_repository,
    get_document_processor,
    get_vector_repository,
)
from src.config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["documents"])


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    ingest_use_case=Depends(get_ingest_use_case),
    doc_processor=Depends(get_document_processor),
):
    # input: uploaded file; processes and ingests; output: upload response
    try:
        file_extension = file.filename.split(".")[-1].lower()

        if file_extension not in ["pdf", "txt"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF and TXT files are supported",
            )

        doc_id = str(uuid.uuid4())
        upload_dir = Path(settings.documents_dir)
        upload_dir.mkdir(parents=True, exist_ok=True)

        file_path = upload_dir / f"{doc_id}.{file_extension}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"File uploaded: {file.filename} -> {file_path}")

        content = doc_processor.extract_text(str(file_path), file_extension)
        content = doc_processor.clean_text(content)

        document = Document(
            id=doc_id,
            filename=file.filename,
            doc_type=DocumentType.PDF if file_extension == "pdf" else DocumentType.TXT,
            content=content,
            status=ProcessingStatus.PENDING,
            metadata={"file_path": str(file_path)},
        )

        processed_doc = ingest_use_case.execute(document)

        return DocumentUploadResponse(
            document_id=processed_doc.id,
            filename=processed_doc.filename,
            status=processed_doc.status,
            message=f"Document uploaded and processed successfully. Created {processed_doc.metadata.get('chunks_count', 0)} chunks.",
        )

    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}",
        )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, doc_repo=Depends(get_document_repository)):
    # input: document id; retrieves document; output: document response
    document = doc_repo.get_by_id(document_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found",
        )

    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        doc_type=document.doc_type,
        created_at=document.created_at,
        status=document.status,
        metadata=document.metadata,
    )


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    skip: int = 0, limit: int = 100, doc_repo=Depends(get_document_repository)
):
    # input: pagination params; retrieves documents; output: document list
    documents = doc_repo.get_all(skip=skip, limit=limit)

    return [
        DocumentResponse(
            id=doc.id,
            filename=doc.filename,
            doc_type=doc.doc_type,
            created_at=doc.created_at,
            status=doc.status,
            metadata=doc.metadata,
        )
        for doc in documents
    ]


@router.delete("/{document_id}", response_model=MessageResponse)
async def delete_document(
    document_id: str,
    doc_repo=Depends(get_document_repository),
    vector_repo=Depends(get_vector_repository),
):
    # input: document id; deletes document and chunks; output: success message
    document = doc_repo.get_by_id(document_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found",
        )

    vector_repo.delete_by_document(document_id)

    doc_repo.delete(document_id)

    if "file_path" in document.metadata:
        file_path = Path(document.metadata["file_path"])
        if file_path.exists():
            file_path.unlink()

    logger.info(f"Document {document_id} deleted successfully")

    return MessageResponse(message=f"Document {document_id} deleted successfully")
