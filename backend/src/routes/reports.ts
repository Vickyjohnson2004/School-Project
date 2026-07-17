import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { generateReport, getReports } from '../controllers/report';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('admin', 'lecturer', 'advisor'), generateReport);
router.get('/', authMiddleware, roleMiddleware('admin', 'lecturer', 'advisor', 'student'), getReports);

export default router;
