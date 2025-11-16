from typing import List, Tuple, Optional
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.feature_extraction.text import TfidfVectorizer
import logging
from src.application.services import IClusteringService
from src.domain.entities import ClusterInfo
from src.domain.repositories import IModelRepository

logger = logging.getLogger(__name__)


class ClusteringService(IClusteringService):
    # performs clustering and dimensionality reduction

    def __init__(self):
        # input: none; initializes models; output: none
        self.kmeans: Optional[KMeans] = None
        self.pca: Optional[PCA] = None
        self.tfidf: Optional[TfidfVectorizer] = None

    def fit_predict(
        self, embeddings: List[List[float]], texts: List[str], n_clusters: int
    ) -> Tuple[List[int], List[ClusterInfo]]:
        # input: embeddings, texts, k; clusters data; output: labels and cluster info
        logger.info(f"Starting clustering with {n_clusters} clusters")

        X = np.array(embeddings)

        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = self.kmeans.fit_predict(X)

        cluster_info = self._extract_cluster_info(labels, X, texts, n_clusters)

        logger.info(f"Clustering completed: {n_clusters} clusters formed")
        return labels.tolist(), cluster_info

    def reduce_dimensions(
        self, embeddings: List[List[float]], n_components: int = 2
    ) -> List[List[float]]:
        # input: embeddings, n_dims; reduces dimensions; output: reduced embeddings
        logger.info(f"Reducing dimensions to {n_components}")

        X = np.array(embeddings)

        self.pca = PCA(n_components=n_components, random_state=42)
        X_reduced = self.pca.fit_transform(X)

        logger.info(f"Dimension reduction completed: {X.shape} -> {X_reduced.shape}")
        return X_reduced.tolist()

    def _extract_cluster_info(
        self,
        labels: np.ndarray,
        embeddings: np.ndarray,
        texts: List[str],
        n_clusters: int,
    ) -> List[ClusterInfo]:
        # input: labels, embeddings, texts; extracts info; output: cluster metadata
        cluster_info = []

        self.tfidf = TfidfVectorizer(max_features=10, stop_words="english")

        for cluster_id in range(n_clusters):
            mask = labels == cluster_id
            cluster_texts = [texts[i] for i, m in enumerate(mask) if m]
            cluster_embeddings = embeddings[mask]

            if len(cluster_texts) == 0:
                continue

            centroid = cluster_embeddings.mean(axis=0)

            top_terms = []
            if len(cluster_texts) > 1:
                try:
                    tfidf_matrix = self.tfidf.fit_transform(cluster_texts)
                    feature_names = self.tfidf.get_feature_names_out()
                    top_indices = tfidf_matrix.sum(axis=0).A1.argsort()[-5:][::-1]
                    top_terms = [
                        feature_names[i] for i in top_indices if i < len(feature_names)
                    ]
                except:
                    top_terms = []

            representative_chunks = cluster_texts[:3]

            info = ClusterInfo(
                cluster_id=int(cluster_id),
                size=int(mask.sum()),
                centroid=centroid.tolist(),
                top_terms=top_terms,
                representative_chunks=representative_chunks,
            )
            cluster_info.append(info)

        return cluster_info

    def save_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; persists models; output: success status
        if self.kmeans:
            model_repo.save_model(self.kmeans, "kmeans_clustering")
        if self.pca:
            model_repo.save_model(self.pca, "pca_reduction")
        return True

    def load_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; loads models; output: success status
        kmeans = model_repo.load_model("kmeans_clustering")
        pca = model_repo.load_model("pca_reduction")

        if kmeans:
            self.kmeans = kmeans
        if pca:
            self.pca = pca

        return kmeans is not None or pca is not None
