from fastapi import APIRouter, Depends, HTTPException, status
import logging
from src.api.models import VisualizationResponse
from src.api.dependencies import get_visualization_use_case

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/visualization", tags=["visualization"])


@router.get("/data", response_model=VisualizationResponse)
async def get_visualization_data(
    visualization_use_case=Depends(get_visualization_use_case),
):
    # input: none; prepares visualization data; output: 2D embeddings and metadata
    try:
        viz_data = visualization_use_case.execute()

        logger.info(
            f"Visualization data prepared: {len(viz_data['embeddings_2d'])} points"
        )

        return VisualizationResponse(
            embeddings_2d=viz_data["embeddings_2d"],
            labels=viz_data["labels"],
            texts=viz_data["texts"],
            chunk_ids=viz_data["chunk_ids"],
            document_ids=viz_data["document_ids"],
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Visualization error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Visualization data generation failed: {str(e)}",
        )
