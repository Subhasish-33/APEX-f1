import numpy as np
from sklearn.isotonic import IsotonicRegression
import structlog

logger = structlog.get_logger()

class ProbabilityLayer:
    """Converts ranking scores into calibrated probabilities."""
    
    def __init__(self):
        self.win_calibrator = IsotonicRegression(out_of_bounds='clip')
        self.podium_calibrator = IsotonicRegression(out_of_bounds='clip')
        self.top10_calibrator = IsotonicRegression(out_of_bounds='clip')
        self.is_fitted = False

    def fit(self, scores: np.ndarray, positions: np.ndarray):
        """Fit calibration models on validation set."""
        logger.info("Fitting Probability Calibration Layer...")
        
        # Binary targets
        y_win = (positions == 1).astype(int)
        y_podium = (positions <= 3).astype(int)
        y_top10 = (positions <= 10).astype(int)
        
        self.win_calibrator.fit(scores, y_win)
        self.podium_calibrator.fit(scores, y_podium)
        self.top10_calibrator.fit(scores, y_top10)
        self.is_fitted = True
        logger.info("Calibration fitting complete.")

    def predict_probabilities(self, scores: np.ndarray) -> dict:
        """Return calibrated probabilities."""
        if not self.is_fitted:
            raise ValueError("ProbabilityLayer must be fitted before prediction.")
            
        return {
            "win_prob": self.win_calibrator.predict(scores),
            "podium_prob": self.podium_calibrator.predict(scores),
            "top10_prob": self.top10_calibrator.predict(scores)
        }
