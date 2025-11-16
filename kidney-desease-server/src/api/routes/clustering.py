from fastapi import APIRouter, Depends, HTTPException, status
import logging
from src.api.models import ClusterRequest, ClusterResponse, ClusterInfoResponse
from src.api.dependencies import get_cluster_use_case

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/clustering", tags=["clustering"])


@router.post("/cluster", response_model=ClusterResponse)
async def perform_clustering(
    request: ClusterRequest, cluster_use_case=Depends(get_cluster_use_case)
):
    # input: cluster request; performs clustering; output: cluster information
    try:
        cluster_info = cluster_use_case.execute(n_clusters=request.n_clusters)

        cluster_responses = [
            ClusterInfoResponse(
                cluster_id=info.cluster_id,
                size=info.size,
                top_terms=info.top_terms,
                representative_chunks=info.representative_chunks,
            )
            for info in cluster_info
        ]

        total_chunks = sum(info.size for info in cluster_info)

        logger.info(
            f"Clustering completed: {len(cluster_responses)} clusters, {total_chunks} chunks"
        )

        return ClusterResponse(clusters=cluster_responses, total_chunks=total_chunks)

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Clustering error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Clustering failed: {str(e)}",
        )
