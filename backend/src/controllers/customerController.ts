import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { parsePagination } from '../utils/helpers';

export const getCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, role } = req.query;

    const where: any = {
      role: 'CUSTOMER',
      deletedAt: null,
    };

    if (req.user?.hotelId) {
      where.bookings = { some: { room: { hotelId: req.user.hotelId } } };
    } else if (req.query.hotelId) {
      where.bookings = { some: { room: { hotelId: req.query.hotelId as string } } };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phoneNumber: { contains: search as string } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          _count: { select: { bookings: true, reviews: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return ApiResponse.paginated(res, customers, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            room: { select: { roomNumber: true, roomType: true } },
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) throw new AppError('Customer not found', 404);

    return ApiResponse.success(res, customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fullName, phoneNumber, isActive } = req.body;

    const customer = await prisma.user.update({
      where: { id },
      data: { fullName, phoneNumber, isActive },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isActive: true,
      },
    });

    return ApiResponse.success(res, customer, 'Customer updated');
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return ApiResponse.success(res, null, 'Customer deleted');
  } catch (error) {
    next(error);
  }
};
