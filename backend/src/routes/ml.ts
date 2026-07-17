import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { trainModel, predictRisk, datasetPredictions, retrainModel, metrics, health } from '../controllers/ml';

const router = Router();

router.post('/train', trainModel);
router.post('/predict', predictRisk);
router.post('/retrain', retrainModel);
router.get('/metrics', metrics);
router.get('/health', health);
router.get('/dataset', authMiddleware, roleMiddleware('admin', 'lecturer'), datasetPredictions);

export default router;
