import { Router } from 'express';
import { authMiddleware, lecturerOnly } from '../middleware/auth';
import {
  getLecturerDashboard,
  updateLecturerProfile,
  getAdvisedStudents,
  searchStudents,
  getStudentDetails
} from '../controllers/lecturer';

const router = Router();

// All lecturer routes require authentication and lecturer role
router.use(authMiddleware, lecturerOnly);

router.get('/dashboard', getLecturerDashboard);
router.put('/profile', updateLecturerProfile);
router.get('/students', getAdvisedStudents);
router.get('/students/search', searchStudents);
router.get('/students/:studentId', getStudentDetails);

export default router;
