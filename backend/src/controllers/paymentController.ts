import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { createPaymentIntent } from '../config/stripe';
import { createRazorpayOrder, getRazorpay } from '../config/razorpay';
import { createPayPalOrder } from '../config/paypal';
import { generateInvoiceNumber } from '../utils/helpers';
import { assertPaymentAccess } from '../utils/authorization';
import { createNotification } from './notificationController';

export const createPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId, method } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    if (req.user?.role === 'CUSTOMER' && booking.userId !== req.user.userId) {
      throw new AppError('Access denied', 403);
    }
    if (
      req.user?.role !== 'SUPER_ADMIN' &&
      req.user?.role !== 'CUSTOMER' &&
      req.user?.hotelId &&
      booking.room.hotelId !== req.user.hotelId
    ) {
      throw new AppError('Access denied', 403);
    }

    const remainingAmount = booking.totalAmount - booking.paidAmount;
    if (remainingAmount <= 0) throw new AppError('Booking is already fully paid', 400);

    let paymentIntent;
    if (method === 'STRIPE') {
      paymentIntent = await createPaymentIntent(
        remainingAmount,
        booking.currency,
        { bookingId: booking.id, bookingReference: booking.bookingReference }
      );
    } else if (method === 'RAZORPAY') {
      const razorpayOrder = await createRazorpayOrder(remainingAmount, booking.currency, booking.bookingReference);
      paymentIntent = { id: razorpayOrder.id, client_secret: razorpayOrder.id };
    } else if (method === 'PAYPAL') {
      const paypalOrder = await createPayPalOrder(remainingAmount, booking.currency);
      paymentIntent = { id: paypalOrder.result.id, client_secret: paypalOrder.result.id };
    }

    const payment = await prisma.payment.create({
      data: {
        amount: remainingAmount,
        currency: booking.currency,
        method,
        status: method === 'CASH' ? 'COMPLETED' : 'PENDING',
        transactionId: paymentIntent?.id,
        paymentIntentId: paymentIntent?.id,
        bookingId,
      },
    });

    if (method === 'CASH') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paidAmount: { increment: remainingAmount } },
      });
    }

    return ApiResponse.success(res, {
      payment,
      clientSecret: paymentIntent?.client_secret,
    }, 'Payment initiated', 201);
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentId, transactionId } = req.body;

    await assertPaymentAccess(req.user!, paymentId);
    const existingPayment = await prisma.payment.findUnique({ where: { id: paymentId } });

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        transactionId: transactionId || existingPayment?.transactionId,
      },
      include: { booking: true },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paidAmount: { increment: payment.amount },
        status: payment.booking.status === 'PENDING' ? 'CONFIRMED' : payment.booking.status,
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        amount: payment.amount,
        totalAmount: payment.amount,
        status: 'PAID',
        dueDate: new Date(),
        paidAt: new Date(),
        bookingId: payment.bookingId,
        paymentId: payment.id,
      },
    });

    await createNotification(
      payment.booking.userId,
      'Payment Received',
      `Payment of ${payment.amount} ${payment.currency} confirmed for your booking.`,
      'PAYMENT',
      `/dashboard/payments`
    ).catch(() => {});

    return ApiResponse.success(res, { payment, invoice }, 'Payment confirmed');
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (req.user?.role === 'CUSTOMER') {
      where.booking = { userId: req.user.userId };
    } else if (req.user?.hotelId) {
      where.booking = { room: { hotelId: req.user.hotelId } };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              room: { select: { roomNumber: true, roomType: true } },
              user: { select: { fullName: true, email: true } },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return ApiResponse.paginated(res, payments, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const processRefund = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    await assertPaymentAccess(req.user!, id);
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new AppError('Payment not found', 404);
    if (payment.status !== 'COMPLETED') throw new AppError('Payment cannot be refunded', 400);

    const refundAmount = amount || payment.amount;

    if (payment.method === 'RAZORPAY' && process.env.RAZORPAY_KEY_ID && payment.transactionId) {
      await getRazorpay().payments.refund(payment.transactionId, {
        amount: Math.round(refundAmount * 100),
      });
    }

    await prisma.payment.update({
      where: { id },
      data: {
        status: refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount,
        refundReason: reason,
      },
    });

    return ApiResponse.success(res, null, 'Refund processed successfully');
  } catch (error) {
    next(error);
  }
};

export const getPaymentStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    const where: any = {};
    if (hotelId) where.booking = { room: { hotelId } };

    const [totalRevenue, completedPayments, pendingPayments, refundedAmount] = await Promise.all([
      prisma.payment.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.payment.count({ where: { ...where, status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: { ...where, status: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] } },
        _sum: { refundAmount: true },
      }),
    ]);

    return ApiResponse.success(res, {
      totalRevenue: totalRevenue._sum.amount || 0,
      completedPayments,
      pendingPayments,
      totalRefunded: refundedAmount._sum.refundAmount || 0,
    });
  } catch (error) {
    next(error);
  }
};
