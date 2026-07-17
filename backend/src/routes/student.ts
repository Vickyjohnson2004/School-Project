import { Router } from 'express';
import { authMiddleware, studentOnly } from '../middleware/auth';
import { getStudentDashboard, updateStudentProfile, getStudentPredictions } from '../controllers/student';

const router = Router();

// All student routes require authentication and student role
router.use(authMiddleware, studentOnly);

router.get('/dashboard', getStudentDashboard);
router.put('/profile', updateStudentProfile);
router.get('/predictions', getStudentPredictions);

export default router;
