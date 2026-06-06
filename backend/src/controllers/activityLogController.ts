import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { parsePagination } from '../utils/helpers';

export const getActivityLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { action, entity, userId } = req.query;

    const where: any = {};

    if (req.user?.role === 'CUSTOMER') {
      where.userId = req.user.userId;
    } else if (req.user?.hotelId) {
      const hotelUserIds = await prisma.user.findMany({
        where: { hotelId: req.user.hotelId },
        select: { id: true },
      });
      where.userId = { in: hotelUserIds.map((u) => u.id) };
    }

    if (action) where.action = action as string;
    if (entity) where.entity = entity as string;
    if (userId && req.user?.role !== 'CUSTOMER') where.userId = userId as string;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { fullName: true, email: true, role: true },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return ApiResponse.paginated(res, logs, total, page, limit);
  } catch (error) {
    next(error);
  }
};
