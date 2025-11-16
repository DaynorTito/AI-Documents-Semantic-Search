from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
import logging
from src.api.models import (
    QualityTrainingRequest,
    QualityTrainingResponse,
    QualityPredictionResponse,
    QualityAssessmentResponse,
)
from src.api.dependencies import get_quality_use_case, get_vector_repository

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/quality", tags=["quality"])


@router.post("/train", response_model=QualityTrainingResponse)
async def train_quality_classifier(
    request: QualityTrainingRequest,
    quality_use_case=Depends(get_quality_use_case),
    vector_repo=Depends(get_vector_repository),
):
    try:
        training_samples = []
        
        chunks = vector_repo.get_all_chunks()
        chunks_dict = {c.id: c for c in chunks}

        for item in request.training_data:
            chunk_id = item.get("chunk_id")
            label = item.get("label")

            if not chunk_id or not label:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Each training item must have 'chunk_id' and 'label' fields",
                )

            chunk = chunks_dict.get(chunk_id)

            if chunk is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Chunk {chunk_id} not found",
                )
            
            if chunk.embedding is None or (hasattr(chunk.embedding, '__len__') and len(chunk.embedding) == 0):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Chunk {chunk_id} has no embedding",
                )

            embedding = chunk.embedding
            if hasattr(embedding, 'tolist'):
                embedding = embedding.tolist()

            training_samples.append({"embedding": embedding, "label": label})

        if len(training_samples) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Need at least 2 training samples, got {len(training_samples)}. Please provide more labeled data.",
            )

        metrics = quality_use_case.train(training_samples)

        logger.info(f"Quality classifier trained with {len(training_samples)} samples")

        return QualityTrainingResponse(
            message=f"Quality classifier trained successfully with {len(training_samples)} samples",
            metrics=metrics,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Training error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training failed: {str(e)}",
        )


@router.post("/predict", response_model=QualityPredictionResponse)
async def predict_quality(
    chunk_ids: Optional[List[str]] = None,
    quality_use_case=Depends(get_quality_use_case),
):
    # input: optional chunk ids; predicts quality; output: quality assessments
    try:
        assessments = quality_use_case.predict(chunk_ids=chunk_ids)

        assessment_responses = [
            QualityAssessmentResponse(
                chunk_id=assessment.chunk_id,
                quality_label=assessment.quality_label,
                confidence=assessment.confidence,
                features=assessment.features,
            )
            for assessment in assessments
        ]

        logger.info(
            f"Quality prediction completed for {len(assessment_responses)} chunks"
        )

        return QualityPredictionResponse(
            assessments=assessment_responses, total_assessed=len(assessment_responses)
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quality prediction failed: {str(e)}",
        )
    