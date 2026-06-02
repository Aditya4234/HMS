import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateOTP } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';
import { sendWelcomeEmail, sendOTPEmail, sendEmailVerificationEmail } from '../config/nodemailer';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, password, phoneNumber, hotelName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationOtp = generateOTP();
    const verificationOtpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.$transaction(async (tx) => {
      let hotel;
      if (hotelName) {
        hotel = await tx.hotel.create({
          data: {
            name: hotelName,
            email,
            amenities: [],
            images: [],
          },
        });
      }

      const newUser = await tx.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          phoneNumber,
          role: hotel ? 'HOTEL_ADMIN' : 'CUSTOMER',
          hotelId: hotel?.id,
          otp: verificationOtp,
          otpExpiry: verificationOtpExpiry,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          hotelId: true,
          createdAt: true,
        },
      });

      await tx.activityLog.create({
        data: {
          action: 'USER_REGISTERED',
          entity: 'User',
          entityId: newUser.id,
          details: `New user registered: ${fullName} (${email})`,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || null,
          userId: newUser.id,
        },
      });

      return newUser;
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role, hotelId: user.hotelId || undefined };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    try {
      await sendEmailVerificationEmail(email, fullName, verificationOtp);
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
    }

    try {
      await sendWelcomeEmail(email, fullName);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    return ApiResponse.success(res, { user, accessToken, emailVerificationRequired: true }, 'Registration successful. Please verify your email.', 201);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.emailVerified) {
      return ApiResponse.success(res, null, 'Email already verified');
    }

    if (user.otp !== otp) {
      throw new AppError('Invalid verification code', 400);
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      throw new AppError('Verification code has expired. Request a new one.', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    return ApiResponse.success(res, null, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return ApiResponse.success(res, null, 'If the email exists, a verification code has been sent');
    }

    if (user.emailVerified) {
      return ApiResponse.success(res, null, 'Email already verified');
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    try {
      await sendEmailVerificationEmail(email, user.fullName, otp);
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
    }

    return ApiResponse.success(res, null, 'Verification code sent');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { hotel: true },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact support.', 401);
    }

    if (user.lockUntil && new Date() < user.lockUntil) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new AppError(`Account is locked. Try again in ${remainingMinutes} minute(s).`, 423);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const newAttempts = user.loginAttempts + 1;

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: newAttempts,
            lockUntil,
          },
        });

        await prisma.activityLog.create({
          data: {
            action: 'ACCOUNT_LOCKED',
            entity: 'User',
            entityId: user.id,
            details: `Account locked due to ${newAttempts} failed login attempts`,
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent'] || null,
            userId: user.id,
          },
        });

        throw new AppError(`Account locked due to ${MAX_LOGIN_ATTEMPTS} failed attempts. Try again in ${LOCK_DURATION_MINUTES} minutes.`, 423);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts },
      });

      throw new AppError('Invalid email or password', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date(),
      },
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role, hotelId: user.hotelId || undefined };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const cookieMaxAge = req.body.rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: cookieMaxAge,
    });

    const { password: _, refreshToken: __, otp, otpExpiry, resetToken, resetTokenExpiry, loginAttempts, lockUntil, ...userWithoutSensitive } = user;

    await prisma.activityLog.create({
      data: {
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        details: `User logged in: ${user.email}`,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        userId: user.id,
      },
    });

    return ApiResponse.success(res, { user: userWithoutSensitive, accessToken }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    await prisma.activityLog.create({
      data: {
        action: 'USER_LOGOUT',
        entity: 'User',
        entityId: userId,
        details: 'User logged out',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        userId,
      },
    });

    res.clearCookie('refreshToken');
    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      throw new AppError('Refresh token not provided', 401);
    }

    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role, hotelId: user.hotelId || undefined };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponse.success(res, { accessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: true,
        hotelId: true,
        emailVerified: true,
        hotel: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return ApiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const avatar = req.file ? (req as any).file.path : undefined;

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: true,
        emailVerified: true,
        lastLogin: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'PROFILE_UPDATED',
        entity: 'User',
        entityId: user.id,
        details: 'Profile updated',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        userId: user.id,
      },
    });

    return ApiResponse.success(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return ApiResponse.success(res, null, 'If the email exists, an OTP has been sent');
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('OTP email failed:', emailError);
    }

    return ApiResponse.success(res, { email }, 'OTP sent to your email');
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return ApiResponse.success(res, null, 'If the email exists, an OTP has been sent');
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('OTP email failed:', emailError);
    }

    return ApiResponse.success(res, null, 'OTP resent to your email');
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.otp !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      throw new AppError('OTP has expired', 400);
    }

    const resetToken = generateOTP() + generateOTP();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpiry: null,
        resetToken,
        resetTokenExpiry,
      },
    });

    return ApiResponse.success(res, { resetToken }, 'OTP verified successfully');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.resetToken !== resetToken) {
      throw new AppError('Invalid reset token', 400);
    }

    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      throw new AppError('Reset token has expired', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        refreshToken: null,
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: user.id,
        details: 'Password reset completed',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        userId: user.id,
      },
    });

    return ApiResponse.success(res, null, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError('New password must be different from current password', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.activityLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: user.id,
        details: 'Password changed successfully',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        userId: user.id,
      },
    });

    return ApiResponse.success(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        refreshToken: null,
        deletedAt: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'ACCOUNT_DELETED',
        entity: 'User',
        entityId: userId,
        details: 'Account soft-deleted by user',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        userId,
      },
    });

    res.clearCookie('refreshToken');
    return ApiResponse.success(res, null, 'Account deleted successfully');
  } catch (error) {
    next(error);
  }
};