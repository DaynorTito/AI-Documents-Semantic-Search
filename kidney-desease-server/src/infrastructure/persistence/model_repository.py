from typing import Optional, Any
import joblib
import logging
from pathlib import Path
from src.domain.repositories import IModelRepository

logger = logging.getLogger(__name__)


class FileModelRepository(IModelRepository):
    # file-based ML model persistence implementation

    def __init__(self, storage_dir: str = "./data/models"):
        # input: storage directory; initializes; output: none
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Model repository initialized at {self.storage_dir}")

    def save_model(self, model: Any, model_name: str) -> bool:
        # input: model object, name; persists model; output: success status
        try:
            file_path = self.storage_dir / f"{model_name}.joblib"
            joblib.dump(model, file_path)
            logger.info(f"Saved model {model_name} to {file_path}")
            return True

        except Exception as e:
            logger.error(f"Error saving model {model_name}: {str(e)}")
            return False

    def load_model(self, model_name: str) -> Optional[Any]:
        # input: model name; loads model; output: model object or None
        try:
            file_path = self.storage_dir / f"{model_name}.joblib"

            if not file_path.exists():
                logger.warning(f"Model {model_name} not found at {file_path}")
                return None

            model = joblib.load(file_path)
            logger.info(f"Loaded model {model_name} from {file_path}")
            return model

        except Exception as e:
            logger.error(f"Error loading model {model_name}: {str(e)}")
            return None

    def model_exists(self, model_name: str) -> bool:
        # input: model name; checks existence; output: exists boolean
        file_path = self.storage_dir / f"{model_name}.joblib"
        return file_path.exists()
