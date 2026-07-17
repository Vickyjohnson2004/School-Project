import { Request, Response, CookieOptions } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from '../models/User';
import Student from '../models/Student';
import Lecturer from '../models/Lecturer';
import Admin from '../models/Admin';
import { sendVerificationEmail } from '../emails/mailer';

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

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('token', accessToken, getCookieOptions(1000 * 60 * 15));
  res.cookie('refreshToken', refreshToken, getCookieOptions(1000 * 60 * 60 * 24 * 7));
}

function clearAuthCookies(res: Response) {
  const sameSite = (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as CookieOptions['sameSite'];
  res.clearCookie('token', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite });
  res.clearCookie('refreshToken', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite });
}

function signToken(payload: object, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role, additionalData } = req.body;
    
    // Validate role
    if (!['student', 'lecturer', 'admin'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ status: 'error', message: 'Email already registered' });

    // Create user
    const user = await User.create({ name, email, password, role, verified: false });

    // Create role-specific profile
    if (role === 'student') {
      await Student.create({
        userId: user._id,
        studentId: additionalData?.studentId || `STU-${user._id}`,
        email,
        name,
        department: additionalData?.department || 'General',
        // All self-registered students start at level 100. Only an admin can
        // change a student's level afterwards.
        level: '100'
      });
    } else if (role === 'lecturer') {
      await Lecturer.create({
        userId: user._id,
        lecturerId: additionalData?.lecturerId || `LEC-${user._id}`,
        email,
        name,
        department: additionalData?.department || 'General',
        specialization: additionalData?.specialization || 'General'
      });
    } else if (role === 'admin') {
      await Admin.create({
        userId: user._id,
        adminId: additionalData?.adminId || `ADM-${user._id}`,
        department: additionalData?.department || 'Administration',
        canCreateUsers: true,
        canEditSystem: true,
        canViewReports: true,
        canManageLecturers: true,
        canManageStudents: true
      });
    }

    // Send verification email
    await sendVerificationEmail(user.email, user.name);

    const token = signToken({ userId: user._id, role: user.role }, String(config.jwtSecret), String(config.jwtExpiresIn));
    const refreshToken = signToken({ userId: user._id, role: user.role }, String(config.jwtRefreshSecret), String(config.jwtRefreshExpiresIn));
    setAuthCookies(res, token, refreshToken);

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 'error', message: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return res.status(401).json({ status: 'error', message: 'Account locked. Try again later' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      await user.save();
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockoutUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = signToken({ userId: user._id, role: user.role }, String(config.jwtSecret), String(config.jwtExpiresIn));
    const refreshToken = signToken({ userId: user._id, role: user.role }, String(config.jwtRefreshSecret), String(config.jwtRefreshExpiresIn));

    setAuthCookies(res, token, refreshToken);

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Login failed' });
  }
}

export function logout(req: Request, res: Response) {
  clearAuthCookies(res);
  res.json({ status: 'success', message: 'Logged out' });
}

export function refreshToken(req: Request, res: Response) {
  const refresh = req.cookies?.refreshToken;
  if (!refresh) return res.status(401).json({ status: 'error', message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refresh, String(config.jwtRefreshSecret)) as { userId: string; role: string };
    const token = signToken({ userId: decoded.userId, role: decoded.role }, String(config.jwtSecret), String(config.jwtExpiresIn));
    res.cookie('token', token, getCookieOptions(1000 * 60 * 15));
    res.json({ status: 'success', message: 'Token refreshed', data: { token } });
  } catch (error) {
    clearAuthCookies(res);
    res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user' });
  }
}
