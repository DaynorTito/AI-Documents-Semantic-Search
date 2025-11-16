from fastapi import APIRouter, Depends, HTTPException, status
import logging
from src.api.models import (
    AnomalyRequest,
    AnomalyResponse,
    AnomalyResultResponse
)
from src.api.dependencies import get_anomaly_use_case

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/anomaly", tags=["anomaly"])


@router.post("/detect", response_model=AnomalyResponse)
async def detect_anomalies(
    request: AnomalyRequest,
    anomaly_use_case = Depends(get_anomaly_use_case)
):
    try:
        results = anomaly_use_case.execute(contamination=request.contamination)

        # Limit results to 1000 items
        if len(results) > 1000:
            results = results[:1000]

        anomaly_responses = [
            AnomalyResultResponse(
                chunk_id=result.chunk_id,
                is_anomaly=result.is_anomaly,
                anomaly_score=result.anomaly_score,
                metadata=result.metadata
            )
            for result in results
        ]
        
        total_anomalies = sum(1 for r in anomaly_responses if r.is_anomaly)
        
        logger.info(
            f"Anomaly detection completed: {total_anomalies}/{len(anomaly_responses)} anomalies "
            f"(limited to 1000 results)"
        )
        
        return AnomalyResponse(
            results=anomaly_responses,
            total_anomalies=total_anomalies,
            total_chunks=len(anomaly_responses)
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Anomaly detection failed: {str(e)}"
        )
