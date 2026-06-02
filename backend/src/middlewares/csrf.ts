import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AppError } from './errorHandler';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const setCsrfCookie = (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies[CSRF_COOKIE]) {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
  next();
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string;

  if (!cookieToken || !headerToken) {
    throw new AppError('CSRF token missing', 403);
  }

  if (cookieToken !== headerToken) {
    throw new AppError('CSRF token mismatch', 403);
  }

  next();
};

export const csrfTokenEndpoint = (req: Request, res: Response) => {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ success: true, data: { csrfToken: token } });
};