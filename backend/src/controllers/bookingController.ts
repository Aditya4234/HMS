import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { generateBookingReference, calculateNights, parsePagination } from '../utils/helpers';
import { sendBookingConfirmation } from '../config/nodemailer';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId, checkIn, checkOut, guests, specialRequests, source } = req.body;
    const userId = req.user!.userId;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room) throw new AppError('Room not found', 404);
    if (room.status === 'OCCUPIED' || room.status === 'MAINTENANCE') {
      throw new AppError('Room is not available', 400);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      throw new AppError('Check-out must be after check-in', 400);
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    const totalAmount = nights * room.pricePerNight;
    const taxRate = room.hotel.taxRate || 0;
    const taxAmount = totalAmount * (taxRate / 100);
    const grandTotal = totalAmount + taxAmount;

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    });

    if (conflictingBooking) {
      throw new AppError('Room is already booked for these dates', 409);
    }

    const booking = await prisma.booking.create({
      data: {
        bookingReference: generateBookingReference(),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guests || 1,
        specialRequests,
        totalAmount: grandTotal,
        taxAmount,
        source: source || 'ONLINE',
        roomId,
        userId,
      },
      include: {
        room: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${room.hotelId}`).emit('new-booking', booking);
    }

    try {
      await sendBookingConfirmation(booking.user.email, booking.user.fullName, {
        reference: booking.bookingReference,
        hotelName: room.hotel.name,
        roomNumber: room.roomNumber,
        checkIn: checkInDate.toLocaleDateString(),
        checkOut: checkOutDate.toLocaleDateString(),
        totalAmount: grandTotal,
      });
    } catch (emailError) {
      console.error('Booking confirmation email failed:', emailError);
    }

    return ApiResponse.success(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, startDate, endDate } = req.query;

    const where: any = { deletedAt: null };

    if (req.user?.role === 'CUSTOMER') {
      where.userId = req.user.userId;
    } else if (req.user?.hotelId) {
      where.room = { hotelId: req.user.hotelId };
    }

    if (status) where.status = status as string;
    if (startDate) where.checkIn = { ...(where.checkIn || {}), gte: new Date(startDate as string) };
    if (endDate) where.checkOut = { ...(where.checkOut || {}), lte: new Date(endDate as string) };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          room: { select: { id: true, roomNumber: true, roomType: true, pricePerNight: true } },
          user: { select: { id: true, fullName: true, email: true, phoneNumber: true } },
          payments: { select: { id: true, amount: true, status: true, method: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return ApiResponse.paginated(res, bookings, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { id, deletedAt: null },
      include: {
        room: { include: { hotel: { select: { id: true, name: true, address: true } } } },
        user: { select: { id: true, fullName: true, email: true, phoneNumber: true } },
        payments: true,
      },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    return ApiResponse.success(res, booking);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    if (status === 'CHECKED_IN') {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { status: 'OCCUPIED' },
      });
    } else if (status === 'CHECKED_OUT' || status === 'CANCELLED') {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { status: 'AVAILABLE' },
      });
    }

    const io = req.app.get('io');
    if (io && booking.room.hotelId) {
      io.to(`hotel-${booking.room.hotelId}`).emit('booking-status-update', {
        bookingId: id,
        status,
      });
    }

    return ApiResponse.success(res, updatedBooking, 'Booking status updated');
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true, payments: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status === 'CHECKED_OUT' || booking.status === 'CANCELLED') {
      throw new AppError('Booking cannot be cancelled', 400);
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await prisma.room.update({
      where: { id: booking.roomId },
      data: { status: 'AVAILABLE' },
    });

    if (booking.payments.length > 0) {
      await prisma.payment.updateMany({
        where: { bookingId: id },
        data: { status: 'REFUNDED' },
      });
    }

    return ApiResponse.success(res, cancelledBooking, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const getBookingStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;

    const where: any = {};
    if (hotelId) where.room = { hotelId };

    const [totalBookings, confirmedBookings, checkedIn, todayCheckIns, revenue] = await Promise.all([
      prisma.booking.count({ where: { ...where, deletedAt: null } }),
      prisma.booking.count({ where: { ...where, status: 'CONFIRMED', deletedAt: null } }),
      prisma.booking.count({ where: { ...where, status: 'CHECKED_IN', deletedAt: null } }),
      prisma.booking.count({
        where: {
          ...where,
          checkIn: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          checkOut: { lte: new Date(new Date().setHours(23, 59, 59, 999)) },
          deletedAt: null,
        },
      }),
      prisma.payment.aggregate({
        where: { booking: where, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return ApiResponse.success(res, {
      totalBookings,
      confirmedBookings,
      checkedIn,
      todayCheckIns,
      revenue: revenue._sum.amount || 0,
    });
  } catch (error) {
    next(error);
  }
};
