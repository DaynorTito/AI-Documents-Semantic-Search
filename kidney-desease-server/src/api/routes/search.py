from fastapi import APIRouter, Depends, HTTPException, status
import logging
from src.api.models import SearchRequest, SearchResponse, SearchResultResponse
from src.api.dependencies import get_search_use_case

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/search", tags=["search"])


@router.post("/", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest, search_use_case=Depends(get_search_use_case)
):
    # input: search request; performs semantic search; output: search results
    try:
        filter_metadata = None
        if request.filter_document_id:
            filter_metadata = {"document_id": request.filter_document_id}

        results = search_use_case.execute(
            query=request.query, top_k=request.top_k, filters=filter_metadata
        )

        search_results = [
            SearchResultResponse(
                chunk_id=result.chunk_id,
                document_id=result.document_id,
                content=result.content,
                score=result.score,
                metadata=result.metadata,
            )
            for result in results
        ]

        logger.info(
            f"Search completed: query='{request.query}', results={len(search_results)}"
        )

        return SearchResponse(
            query=request.query,
            results=search_results,
            total_results=len(search_results),
        )

    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}",
        )
