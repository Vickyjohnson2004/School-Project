import { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
  role?: string;
}

function getCookieOptions(maxAge: number): CookieOptions {
  const sameSite = (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as CookieOptions['sameSite'];

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite,
    path: '/',
    maxAge
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ status: 'error', message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, String(config.jwtSecret)) as { userId: string; role: string };
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ status: 'error', message: 'Invalid session' });

    if (!user.isActive) return res.status(401).json({ status: 'error', message: 'Account is inactive' });

    req.user = user;
    req.role = user.role;
    next();
  } catch (error) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ status: 'error', message: 'Invalid token' });

    try {
      const decoded = jwt.verify(refreshToken, String(config.jwtRefreshSecret)) as { userId: string; role: string };
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) return res.status(401).json({ status: 'error', message: 'Invalid session' });

      const newToken = jwt.sign({ userId: user._id, role: user.role }, String(config.jwtSecret) as any, { expiresIn: String(config.jwtExpiresIn) } as any);
      res.cookie('token', newToken, getCookieOptions(1000 * 60 * 15));
      req.user = user;
      req.role = user.role;
      next();
    } catch (refreshError) {
      res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
  }
}

export function roleMiddleware(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
    }
    next();
  };
}

// Role-specific middleware
export function studentOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ status: 'error', message: 'Student access only' });
  }
  next();
}

export function lecturerOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'lecturer') {
    return res.status(403).json({ status: 'error', message: 'Lecturer access only' });
  }
  next();
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Admin access only' });
  }
  next();
}
