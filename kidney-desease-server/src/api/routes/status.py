from fastapi import APIRouter, Depends, HTTPException, status
import logging
from src.api.models import SystemStatusResponse
from src.api.dependencies import get_status_use_case

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/status", tags=["status"])


@router.get("/", response_model=SystemStatusResponse)
async def get_system_status(status_use_case=Depends(get_status_use_case)):
    # input: none; retrieves system stats; output: system status
    try:
        status_data = status_use_case.execute()

        return SystemStatusResponse(
            total_documents=status_data["total_documents"],
            total_chunks=status_data["total_chunks"],
            status_breakdown=status_data["status_breakdown"],
            average_chunks_per_document=status_data["average_chunks_per_document"],
        )

    except Exception as e:
        logger.error(f"Status error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve system status: {str(e)}",
        )
