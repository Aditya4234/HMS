import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoUser } from '../models/MongoUser';
import { AppError } from '../middlewares/errorHandler';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const generateAccessToken = (payload: { userId: string; email: string; role: string }): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
  });
};

const generateRefreshToken = (payload: { userId: string; email: string; role: string }): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  });
};

const sanitizeUser = (user: any) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName || user.email.split('@')[0],
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await MongoUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await MongoUser.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName: fullName || email.split('@')[0],
    });

    const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: sanitizeUser(user), accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    let user = await MongoUser.findOne({ email: normalizedEmail }).select('+password +refreshToken');

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 12);

      user = await MongoUser.create({
        email: normalizedEmail,
        password: hashedPassword,
        fullName: normalizedEmail.split('@')[0],
      });

      const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        message: 'Account created and logged in successfully',
        data: { user: sanitizeUser(user), accessToken, isNewUser: true },
      });
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: sanitizeUser(user), accessToken, isNewUser: false },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await MongoUser.findById(req.user!.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await MongoUser.findByIdAndUpdate(req.user!.userId, { refreshToken: null });

    res.clearCookie('refreshToken');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      throw new AppError('Refresh token not provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    const user = await MongoUser.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};
