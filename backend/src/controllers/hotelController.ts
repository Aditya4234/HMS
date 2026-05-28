import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';

export const getHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true, deletedAt: null },
      include: {
        _count: { select: { rooms: true, staff: true } },
      },
    });
    return ApiResponse.success(res, hotels);
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotel.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { rooms: true, staff: true } },
        rooms: { where: { deletedAt: null }, take: 10 },
      },
    });
    if (!hotel) throw new AppError('Hotel not found', 404);
    return ApiResponse.success(res, hotel);
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    if (!hotelId) throw new AppError('Hotel not found', 404);

    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: req.body,
    });
    return ApiResponse.success(res, hotel, 'Hotel updated');
  } catch (error) {
    next(error);
  }
};

export const getHotelSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    if (!hotelId) throw new AppError('Hotel not found', 404);

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: {
        id: true,
        name: true,
        description: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        checkInTime: true,
        checkOutTime: true,
        taxRate: true,
        currency: true,
        timezone: true,
        logo: true,
        amenities: true,
      },
    });
    return ApiResponse.success(res, hotel);
  } catch (error) {
    next(error);
  }
};
