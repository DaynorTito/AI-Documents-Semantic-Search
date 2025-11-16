from typing import List, Tuple, Dict, Optional
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import logging
from src.application.services import IQualityClassificationService
from src.domain.entities import QualityLabel
from src.domain.repositories import IModelRepository

logger = logging.getLogger(__name__)


class QualityClassificationService(IQualityClassificationService):
    # classifies document quality using random forest

    def __init__(self):
        # input: none; initializes model; output: none
        self.model: Optional[RandomForestClassifier] = None
        self.label_mapping = {
            "high": QualityLabel.HIGH,
            "medium": QualityLabel.MEDIUM,
            "low": QualityLabel.LOW,
            "anomalous": QualityLabel.ANOMALOUS,
        }
        self.reverse_mapping = {v: k for k, v in self.label_mapping.items()}

    def train(
        self, embeddings: List[List[float]], labels: List[str]
    ) -> Dict[str, float]:
        # input: embeddings, labels; trains classifier; output: performance metrics
        logger.info(
            f"Starting quality classifier training with {len(embeddings)} samples"
        )

        X = np.array(embeddings)
        y = np.array([self._encode_label(label) for label in labels])

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        self.model = RandomForestClassifier(
            n_estimators=100, random_state=42, max_depth=10, min_samples_split=5
        )

        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)

        accuracy = accuracy_score(y_test, y_pred)
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average="weighted", zero_division=0
        )

        metrics = {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "n_samples": len(embeddings),
        }

        logger.info(f"Training completed: accuracy={accuracy:.3f}, f1={f1:.3f}")
        return metrics

    def predict(
        self, embeddings: List[List[float]]
    ) -> Tuple[List[QualityLabel], List[float]]:
        # input: embeddings; predicts quality; output: labels and confidences
        if not self.is_trained():
            raise ValueError("Model not trained. Call train() first.")

        X = np.array(embeddings)

        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)

        confidences = probabilities.max(axis=1)

        labels = [self._decode_label(pred) for pred in predictions]

        logger.info(f"Predicted quality for {len(embeddings)} samples")
        return labels, confidences.tolist()

    def is_trained(self) -> bool:
        # input: none; checks if trained; output: trained boolean
        return self.model is not None

    def save_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; persists model; output: success status
        if self.model:
            return model_repo.save_model(self.model, "quality_classifier")
        return False

    def load_model(self, model_repo: IModelRepository) -> bool:
        # input: model repo; loads model; output: success status
        model = model_repo.load_model("quality_classifier")
        if model:
            self.model = model
            return True
        return False

    def _encode_label(self, label: str) -> int:
        # input: label string; encodes label; output: integer label
        label_lower = label.lower()
        if label_lower == "high":
            return 0
        elif label_lower == "medium":
            return 1
        elif label_lower == "low":
            return 2
        else:
            return 3

    def _decode_label(self, encoded: int) -> QualityLabel:
        # input: integer label; decodes label; output: quality label enum
        mapping = {
            0: QualityLabel.HIGH,
            1: QualityLabel.MEDIUM,
            2: QualityLabel.LOW,
            3: QualityLabel.ANOMALOUS,
        }
        return mapping.get(encoded, QualityLabel.LOW)
