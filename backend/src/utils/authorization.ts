import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

type AuthUser = {
  userId: string;
  role: string;
  hotelId?: string | null;
};

export const assertBookingAccess = async (
  user: AuthUser,
  bookingId: string
) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, deletedAt: null },
    include: { room: { select: { hotelId: true } } },
  });

  if (!booking) throw new AppError('Booking not found', 404);

  if (user.role === 'CUSTOMER' && booking.userId !== user.userId) {
    throw new AppError('Access denied', 403);
  }

  if (
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'CUSTOMER' &&
    user.hotelId &&
    booking.room.hotelId !== user.hotelId
  ) {
    throw new AppError('Access denied', 403);
  }

  return booking;
};

export const assertInvoiceAccess = async (user: AuthUser, invoiceId: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { booking: { include: { room: { select: { hotelId: true } } } } },
  });

  if (!invoice) throw new AppError('Invoice not found', 404);

  if (user.role === 'CUSTOMER' && invoice.booking.userId !== user.userId) {
    throw new AppError('Access denied', 403);
  }

  if (
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'CUSTOMER' &&
    user.hotelId &&
    invoice.booking.room.hotelId !== user.hotelId
  ) {
    throw new AppError('Access denied', 403);
  }

  return invoice;
};

export const assertPaymentAccess = async (user: AuthUser, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { include: { room: { select: { hotelId: true } } } } },
  });

  if (!payment) throw new AppError('Payment not found', 404);

  if (user.role === 'CUSTOMER' && payment.booking.userId !== user.userId) {
    throw new AppError('Access denied', 403);
  }

  if (
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'CUSTOMER' &&
    user.hotelId &&
    payment.booking.room.hotelId !== user.hotelId
  ) {
    throw new AppError('Access denied', 403);
  }

  return payment;
};
