from typing import List, Tuple, Optional
import numpy as np
from sklearn.ensemble import IsolationForest
import logging
from src.application.services import IAnomalyDetectionService
from src.domain.repositories import IModelRepository

logger = logging.getLogger(__name__)


class AnomalyDetectionService(IAnomalyDetectionService):
    # detects anomalies using isolation forest
    
    def __init__(self):
        # input: none; initializes model; output: none
        self.model: Optional[IsolationForest] = None
    
    def fit_predict(
        self,
        embeddings: List[List[float]],
        contamination: float = 0.1
    ) -> Tuple[List[int], List[float]]:
        # input: embeddings, contamination; detects anomalies; output: labels and scores
        logger.info(f"Starting anomaly detection with contamination={contamination}")
        
        if not embeddings:
            raise ValueError("No embeddings provided for anomaly detection")
        
        X = np.array(embeddings)
        
        if X.shape[0] == 0:
            raise ValueError("Empty embeddings array")
        
        logger.info(f"Processing {X.shape[0]} embeddings with shape {X.shape[1]}")
        
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        
        predictions = self.model.fit_predict(X)
        
        scores = self.model.score_samples(X)
        
        n_anomalies = int(np.sum(predictions == -1))
        logger.info(f"Anomaly detection completed: {n_anomalies} anomalies detected")
        
        return predictions.tolist(), scores.tolist()
    
    def save_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; persists model; output: success status
        if self.model:
            return model_repo.save_model(self.model, "isolation_forest_anomaly")
        return False
    
    def load_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; loads model; output: success status
        model = model_repo.load_model("isolation_forest_anomaly")
        if model:
            self.model = model
            return True
        return False
    