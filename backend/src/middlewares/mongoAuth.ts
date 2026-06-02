import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { MongoUser } from '../models/MongoUser';
import { AppError } from './errorHandler';

export interface MongoAuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: MongoAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    const user = await MongoUser.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or deactivated', 401);
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
};
