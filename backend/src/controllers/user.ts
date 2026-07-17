import { Request, Response } from 'express';
import User from '../models/User';

export async function getProfile(req: Request, res: Response) {
  const user = await User.findById((req as any).user?.id).select('-password');
  res.json({ status: 'success', data: user });
}

export async function getUsers(req: Request, res: Response) {
  const users = await User.find().select('-password').limit(100);
  res.json({ status: 'success', data: users });
}
