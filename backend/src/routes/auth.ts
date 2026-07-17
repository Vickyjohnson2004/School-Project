import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, refreshToken, getMe } from '../controllers/auth';
import { validateRequest } from '../middleware/validate-request';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'lecturer', 'student']).withMessage('Invalid role'),
  body('additionalData').optional().isObject().withMessage('Additional data must be an object')
], validateRequest, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, login);

router.post('/logout', authMiddleware, logout);
router.get('/refresh', refreshToken);
router.get('/me', authMiddleware, getMe);

export default router;
