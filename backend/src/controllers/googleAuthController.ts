import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { ApiResponse } from '../utils/apiResponse';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { verifyGoogleToken } from '../config/google';

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    if (!credential) throw new AppError('Google credential is required', 400);

    const payload = await verifyGoogleToken(credential);
    if (!payload || !payload.email) throw new AppError('Invalid Google token', 401);

    const { email, name, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName: name || email.split('@')[0],
          password: '',
          role: 'CUSTOMER',
          emailVerified: true,
          avatar: picture || null,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: picture || user.avatar,
          emailVerified: true,
          lastLogin: new Date(),
        },
      });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      hotelId: user.hotelId || undefined,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return ApiResponse.success(res, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        hotelId: user.hotelId,
        emailVerified: user.emailVerified,
      },
      accessToken,
    }, 'Google login successful');
  } catch (error) {
    next(error);
  }
};
