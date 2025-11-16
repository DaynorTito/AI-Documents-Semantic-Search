from typing import List, Optional, Dict, Any
import logging
from src.domain.entities import (
    Document, Chunk, SearchResult, ProcessingStatus, 
    ClusterInfo, AnomalyResult, QualityAssessment
)
from src.domain.repositories import IDocumentRepository, IVectorRepository, IModelRepository
from src.application.services import (
    IEmbeddingService, IChunkingService, IClusteringService,
    IAnomalyDetectionService, IQualityClassificationService
)

logger = logging.getLogger(__name__)


class IngestDocumentUseCase:
    # orchestrates document ingestion pipeline
    
    def __init__(
        self,
        doc_repo: IDocumentRepository,
        vector_repo: IVectorRepository,
        chunking_service: IChunkingService,
        embedding_service: IEmbeddingService
    ):
        self.doc_repo = doc_repo
        self.vector_repo = vector_repo
        self.chunking_service = chunking_service
        self.embedding_service = embedding_service
    
    def execute(self, document: Document) -> Document:
        # input: document entity; processes and stores; output: processed document
        try:
            document.status = ProcessingStatus.PROCESSING
            document = self.doc_repo.save(document)
            
            chunks = self.chunking_service.chunk_text(document.content, document.id)
            
            for chunk in chunks:
                chunk.embedding = self.embedding_service.embed_text(chunk.content)
            
            self.vector_repo.add_chunks(chunks)
            
            document.status = ProcessingStatus.COMPLETED
            document.metadata['chunks_count'] = len(chunks)
            document = self.doc_repo.save(document)
            
            logger.info(f"Document {document.id} ingested successfully")
            return document
            
        except Exception as e:
            logger.error(f"Error ingesting document {document.id}: {str(e)}")
            document.status = ProcessingStatus.FAILED
            document.metadata['error'] = str(e)
            self.doc_repo.save(document)
            raise


class SearchDocumentsUseCase:
    # performs semantic search across document corpus
    
    def __init__(
        self,
        vector_repo: IVectorRepository,
        embedding_service: IEmbeddingService
    ):
        self.vector_repo = vector_repo
        self.embedding_service = embedding_service
    
    def execute(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        # input: query text, k, filters; searches; output: ranked results
        query_embedding = self.embedding_service.embed_text(query)
        results = self.vector_repo.search(query_embedding, top_k, filters)
        logger.info(f"Search completed with {len(results)} results")
        return results


class ClusterDocumentsUseCase:
    # performs clustering on document embeddings
    
    def __init__(
        self,
        vector_repo: IVectorRepository,
        clustering_service: IClusteringService,
        model_repo: IModelRepository
    ):
        self.vector_repo = vector_repo
        self.clustering_service = clustering_service
        self.model_repo = model_repo
    
    def execute(self, n_clusters: int = 5) -> List[ClusterInfo]:
        # input: number of clusters; clusters embeddings; output: cluster metadata
        chunks = self.vector_repo.get_all_chunks()
        
        if not chunks:
            raise ValueError("No chunks available for clustering")
        
        embeddings = [chunk.embedding for chunk in chunks]
        texts = [chunk.content for chunk in chunks]
        
        cluster_labels, cluster_info = self.clustering_service.fit_predict(
            embeddings, texts, n_clusters
        )
        
        for i, chunk in enumerate(chunks):
            chunk.metadata['cluster_id'] = int(cluster_labels[i])
        
        self.clustering_service.save_model(self.model_repo)
        
        logger.info(f"Clustering completed with {n_clusters} clusters")
        return cluster_info


class DetectAnomaliesUseCase:
    # detects anomalous documents in corpus
    
    def __init__(
        self,
        vector_repo: IVectorRepository,
        anomaly_service: IAnomalyDetectionService,
        model_repo: IModelRepository
    ):
        self.vector_repo = vector_repo
        self.anomaly_service = anomaly_service
        self.model_repo = model_repo
    
    def execute(self, contamination: float = 0.1) -> List[AnomalyResult]:
        # input: contamination rate; detects anomalies; output: anomaly results
        chunks = self.vector_repo.get_all_chunks()
        
        if not chunks:
            raise ValueError("No chunks available for anomaly detection")
        
        embeddings = [chunk.embedding for chunk in chunks]
        
        # Check if embeddings are valid
        if not embeddings or embeddings[0] is None:
            raise ValueError("Chunks do not have embeddings. Please ensure documents are processed correctly.")
        
        anomalies, scores = self.anomaly_service.fit_predict(
            embeddings, contamination
        )
        
        results = []
        for i, chunk in enumerate(chunks):
            result = AnomalyResult(
                chunk_id=chunk.id,
                is_anomaly=bool(anomalies[i] == -1),
                anomaly_score=float(scores[i]),
                metadata={"content_preview": chunk.content[:100]}
            )
            results.append(result)
        
        self.anomaly_service.save_model(self.model_repo)
        
        anomaly_count = sum(1 for a in anomalies if a == -1)
        logger.info(f"Anomaly detection completed: {anomaly_count} anomalies found")
        return results


class ClassifyQualityUseCase:
    # classifies document quality using supervised learning
    
    def __init__(
        self,
        vector_repo: IVectorRepository,
        quality_service: IQualityClassificationService,
        model_repo: IModelRepository
    ):
        self.vector_repo = vector_repo
        self.quality_service = quality_service
        self.model_repo = model_repo
    
    def train(self, training_data: List[Dict[str, Any]]) -> Dict[str, float]:
        # input: labeled training data; trains classifier; output: metrics
        embeddings = [item['embedding'] for item in training_data]
        labels = [item['label'] for item in training_data]
        
        metrics = self.quality_service.train(embeddings, labels)
        self.quality_service.save_model(self.model_repo)
        
        logger.info(f"Quality classifier trained with accuracy: {metrics.get('accuracy', 0)}")
        return metrics
    
    def predict(self, chunk_ids: Optional[List[str]] = None) -> List[QualityAssessment]:
        # input: optional chunk ids; predicts quality; output: quality assessments
        if not self.quality_service.is_trained():
            if not self.quality_service.load_model(self.model_repo):
                raise ValueError("Quality classifier not trained")
        
        chunks = self.vector_repo.get_all_chunks()
        
        if chunk_ids:
            chunks = [c for c in chunks if c.id in chunk_ids]
        
        embeddings = [chunk.embedding for chunk in chunks]
        
        predictions, confidences = self.quality_service.predict(embeddings)
        
        results = []
        for i, chunk in enumerate(chunks):
            assessment = QualityAssessment(
                chunk_id=chunk.id,
                quality_label=predictions[i],
                confidence=confidences[i],
                features={"content_length": len(chunk.content)}
            )
            results.append(assessment)
        
        logger.info(f"Quality classification completed for {len(results)} chunks")
        return results


class GetVisualizationDataUseCase:
    # prepares data for visualization
    
    def __init__(
        self,
        vector_repo: IVectorRepository,
        clustering_service: IClusteringService
    ):
        self.vector_repo = vector_repo
        self.clustering_service = clustering_service
    
    def execute(self) -> Dict[str, Any]:
        # input: none; prepares viz data; output: 2D embeddings and metadata
        chunks = self.vector_repo.get_all_chunks()
        
        if not chunks:
            raise ValueError("No chunks available for visualization")
        
        embeddings = [chunk.embedding for chunk in chunks]
        texts = [chunk.content[:100] for chunk in chunks]
        
        embeddings_2d = self.clustering_service.reduce_dimensions(embeddings, n_components=2)
        
        labels = [chunk.metadata.get('cluster_id', -1) for chunk in chunks]
        
        return {
            'embeddings_2d': embeddings_2d,
            'labels': labels,
            'texts': texts,
            'chunk_ids': [chunk.id for chunk in chunks],
            'document_ids': [chunk.document_id for chunk in chunks]
        }


class GetSystemStatusUseCase:
    # retrieves system status and statistics
    
    def __init__(
        self,
        doc_repo: IDocumentRepository,
        vector_repo: IVectorRepository
    ):
        self.doc_repo = doc_repo
        self.vector_repo = vector_repo
    
    def execute(self) -> Dict[str, Any]:
        # input: none; gathers stats; output: system status dictionary
        documents = self.doc_repo.get_all(limit=10000)
        chunks = self.vector_repo.get_all_chunks()
        
        status_counts = {}
        for doc in documents:
            status_counts[doc.status.value] = status_counts.get(doc.status.value, 0) + 1
        
        return {
            'total_documents': len(documents),
            'total_chunks': len(chunks),
            'status_breakdown': status_counts,
            'average_chunks_per_document': len(chunks) / len(documents) if documents else 0
        }
    