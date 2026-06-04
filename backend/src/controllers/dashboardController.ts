import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;

    const roomWhere = hotelId ? { hotelId, deletedAt: null } : { deletedAt: null };
    const bookingWhere = hotelId ? { room: { hotelId }, deletedAt: null } : { deletedAt: null };
    const paymentWhere = hotelId ? { booking: { room: { hotelId } } } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      totalBookings,
      todayCheckIns,
      todayCheckOuts,
      activeBookings,
      totalCustomers,
      totalStaff,
      monthlyRevenue,
      todayRevenue,
    ] = await Promise.all([
      prisma.room.count({ where: roomWhere }),
      prisma.room.count({ where: { ...roomWhere, status: 'AVAILABLE' } }),
      prisma.room.count({ where: { ...roomWhere, status: 'OCCUPIED' } }),
      prisma.room.count({ where: { ...roomWhere, status: 'MAINTENANCE' } }),
      prisma.booking.count({ where: bookingWhere }),
      prisma.booking.count({
        where: {
          ...bookingWhere,
          checkIn: { gte: today },
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        },
      }),
      prisma.booking.count({
        where: {
          ...bookingWhere,
          checkOut: { gte: today },
          status: { in: ['CHECKED_IN', 'CONFIRMED'] },
        },
      }),
      prisma.booking.count({
        where: { ...bookingWhere, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
      }),
      hotelId
        ? prisma.user.count({
            where: {
              role: 'CUSTOMER',
              deletedAt: null,
              bookings: { some: { room: { hotelId } } },
            },
          })
        : prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
      hotelId ? prisma.staff.count({ where: { hotelId, deletedAt: null } }) : Promise.resolve(0),
      prisma.payment.aggregate({
        where: {
          ...paymentWhere,
          status: 'COMPLETED',
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          ...paymentWhere,
          status: 'COMPLETED',
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),
    ]);

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    return ApiResponse.success(res, {
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        maintenance: maintenanceRooms,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
      },
      bookings: {
        total: totalBookings,
        todayCheckIns,
        todayCheckOuts,
        active: activeBookings,
      },
      customers: totalCustomers,
      staff: totalStaff,
      revenue: {
        monthly: monthlyRevenue._sum.amount || 0,
        today: todayRevenue._sum.amount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    const months = parseInt(req.query.months as string) || 6;

    const paymentWhere: any = {
      status: 'COMPLETED',
    };
    if (hotelId) paymentWhere.booking = { room: { hotelId } };

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const payments = await prisma.payment.findMany({
      where: {
        ...paymentWhere,
        createdAt: { gte: startDate },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyData: { [key: string]: number } = {};
    payments.forEach((payment) => {
      const key = payment.createdAt.toISOString().substring(0, 7);
      monthlyData[key] = (monthlyData[key] || 0) + payment.amount;
    });

    const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return ApiResponse.success(res, chartData);
  } catch (error) {
    next(error);
  }
};

export const getBookingChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    const days = parseInt(req.query.days as string) || 30;

    const bookingWhere: any = { deletedAt: null };
    if (hotelId) bookingWhere.room = { hotelId };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await prisma.booking.findMany({
      where: {
        ...bookingWhere,
        createdAt: { gte: startDate },
      },
      select: { createdAt: true, status: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyData: { [key: string]: { booking: number; revenue: number; cancelled: number } } = {};
    bookings.forEach((booking) => {
      const key = booking.createdAt.toISOString().substring(0, 10);
      if (!dailyData[key]) dailyData[key] = { booking: 0, revenue: 0, cancelled: 0 };
      dailyData[key].booking += 1;
      if (booking.status === 'CANCELLED') {
        dailyData[key].cancelled += 1;
      } else {
        dailyData[key].revenue += booking.totalAmount;
      }
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    return ApiResponse.success(res, chartData);
  } catch (error) {
    next(error);
  }
};

export const getRecentActivities = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;

    const where: any = {};
    if (hotelId) where.room = { hotelId };

    const recentBookings = await prisma.booking.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { fullName: true } },
        room: { select: { roomNumber: true } },
      },
    });

    const activities = recentBookings.map((booking) => ({
      id: booking.id,
      type: 'booking',
      action: `New booking by ${booking.user.fullName}`,
      details: `Room ${booking.room.roomNumber} - ${new Date(booking.createdAt).toLocaleDateString()}`,
      timestamp: booking.createdAt,
      status: booking.status,
    }));

    return ApiResponse.success(res, activities);
  } catch (error) {
    next(error);
  }
};

export const getTopRooms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;

    const where: any = { deletedAt: null };
    if (hotelId) where.hotelId = hotelId;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        _count: { select: { bookings: true } },
      },
      orderBy: { bookings: { _count: 'desc' } },
      take: 5,
    });

    const topRooms = rooms.map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      status: room.status,
      totalBookings: room._count.bookings,
    }));

    return ApiResponse.success(res, topRooms);
  } catch (error) {
    next(error);
  }
};
