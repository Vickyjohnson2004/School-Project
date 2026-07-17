import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { submitPrediction, getPredictions } from '../controllers/prediction';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('admin', 'lecturer', 'advisor'), submitPrediction);
router.get('/', authMiddleware, roleMiddleware('admin', 'lecturer', 'advisor', 'student'), getPredictions);

export default router;
