import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { generateInvoiceNumber, parsePagination } from '../utils/helpers';
import { assertInvoiceAccess } from '../utils/authorization';

export const createInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId, amount, taxAmount, totalAmount, dueDate, notes } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: { select: { hotelId: true } } },
    });
    if (!booking) throw new AppError('Booking not found', 404);

    if (req.user?.role !== 'SUPER_ADMIN') {
      if (!req.user?.hotelId || req.user.hotelId !== booking.room.hotelId) {
        throw new AppError('Not authorized to create invoice for this booking', 403);
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        amount,
        taxAmount: taxAmount || 0,
        totalAmount,
        dueDate: new Date(dueDate),
        notes,
        bookingId,
      },
    });

    return ApiResponse.success(res, invoice, 'Invoice created successfully', 201);
  } catch (error) {
    next(error);
  }
};

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
