import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { parsePagination } from '../utils/helpers';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rating, comment, hotelId, roomId } = req.body;
    const userId = req.user!.userId;

    const existing = await prisma.review.findFirst({
      where: { userId, hotelId: hotelId || undefined, roomId: roomId || undefined },
    });
    if (existing) throw new AppError('You have already reviewed this', 400);

    const review = await prisma.review.create({
      data: { rating: parseInt(rating), comment, userId, hotelId, roomId },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
    });

    return ApiResponse.success(res, review, 'Review created', 201);
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { hotelId, roomId, userId } = req.query;

    const where: any = {};
    if (hotelId) where.hotelId = hotelId as string;
    if (roomId) where.roomId = roomId as string;
    if (userId) where.userId = userId as string;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, fullName: true, avatar: true } } },
      }),
      prisma.review.count({ where }),
    ]);

    const avgRating = await prisma.review.aggregate({
      where: hotelId ? { hotelId: hotelId as string } : roomId ? { roomId: roomId as string } : {},
      _avg: { rating: true },
    });

    return ApiResponse.paginated(res, reviews, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({
      where: { id },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
    });
    if (!review) throw new AppError('Review not found', 404);
    return ApiResponse.success(res, review);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== req.user!.userId) throw new AppError('Not authorized', 403);

    const updated = await prisma.review.update({
      where: { id },
      data: { rating: rating ? parseInt(rating) : undefined, comment },
    });

    return ApiResponse.success(res, updated, 'Review updated');
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== req.user!.userId && req.user!.role === 'CUSTOMER') {
      throw new AppError('Not authorized', 403);
    }

    await prisma.review.delete({ where: { id } });
    return ApiResponse.success(res, null, 'Review deleted');
  } catch (error) {
    next(error);
  }
};
