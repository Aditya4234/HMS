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
    const hotelId = req.user?.hotelId || req.body.hotelId;
    if (!hotelId) throw new AppError('No hotel associated with your account', 400);

    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: req.body,
    });
    return ApiResponse.success(res, hotel, 'Hotel updated');
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, email, phone, address, city, state, country, zipCode, currency, timezone, taxRate, checkInTime, checkOutTime, amenities, logo, rating } = req.body;

    if (!name) throw new AppError('Hotel name is required', 400);

    const hotel = await prisma.hotel.create({
      data: {
        name,
        description,
        email,
        phone,
        address,
        city,
        state,
        country,
        zipCode,
        currency: currency || 'USD',
        timezone: timezone || 'UTC',
        taxRate: taxRate || 0,
        checkInTime: checkInTime || '14:00',
        checkOutTime: checkOutTime || '11:00',
        amenities: amenities || [],
        logo,
        rating: rating || 0,
      },
    });

    return ApiResponse.success(res, hotel, 'Hotel created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotel.findFirst({ where: { id, deletedAt: null } });
    if (!hotel) throw new AppError('Hotel not found', 404);

    await prisma.hotel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return ApiResponse.success(res, null, 'Hotel deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getHotelSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    if (!hotelId) throw new AppError('No hotel associated with your account', 400);

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
