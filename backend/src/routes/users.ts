import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { getProfile, getUsers } from '../controllers/user';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.get('/', authMiddleware, roleMiddleware('admin'), getUsers);

export default router;
