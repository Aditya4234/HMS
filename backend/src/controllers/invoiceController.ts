import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { parsePagination } from '../utils/helpers';
import { assertInvoiceAccess } from '../utils/authorization';

export const getInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const where: any = {};
    if (req.user?.role === 'CUSTOMER') {
      where.booking = { userId: req.user.userId };
    } else if (req.user?.hotelId) {
      where.booking = { room: { hotelId: req.user.hotelId } };
    }
    if (status) where.status = status as string;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              bookingReference: true,
              checkIn: true,
              checkOut: true,
              room: { select: { roomNumber: true, roomType: true } },
              user: { select: { fullName: true, email: true } },
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return ApiResponse.paginated(res, invoices, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await assertInvoiceAccess(req.user!, id);
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            room: { include: { hotel: { select: { name: true, address: true } } } },
            user: { select: { fullName: true, email: true, phoneNumber: true } },
            payments: true,
          },
        },
      },
    });

    if (!invoice) throw new AppError('Invoice not found', 404);
    return ApiResponse.success(res, invoice);
  } catch (error) {
    next(error);
  }
};
