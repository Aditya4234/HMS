import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { parsePagination } from '../utils/helpers';

export const createRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    if (!hotelId) throw new AppError('Hotel not found', 404);

    const { roomNumber, roomType, floor, description, pricePerNight, capacity, size, beds, amenities, status } = req.body;

    const existingRoom = await prisma.room.findUnique({
      where: { hotelId_roomNumber: { hotelId, roomNumber } },
    });

    if (existingRoom) {
      throw new AppError('Room number already exists in this hotel', 400);
    }

    let images: string[] = [];
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      for (const file of files) {
        const result = await uploadToCloudinary(file, 'rooms');
        images.push(result.url);
      }
    }

    const room = await prisma.room.create({
      data: {
        roomNumber,
        roomType,
        floor: floor ? parseInt(floor) : undefined,
        description,
        pricePerNight: parseFloat(pricePerNight),
        capacity: capacity ? parseInt(capacity) : 2,
        size: size ? parseFloat(size) : undefined,
        beds: beds ? parseInt(beds) : 1,
        amenities: amenities || [],
        images,
        status: status || 'AVAILABLE',
        hotelId,
      },
    });

    return ApiResponse.success(res, room, 'Room created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    if (!hotelId) throw new AppError('Hotel not found', 404);

    const { page, limit, skip } = parsePagination(req.query);
    const { status, roomType, minPrice, maxPrice } = req.query;

    const where: any = { hotelId, deletedAt: null };
    if (status) where.status = status as string;
    if (roomType) where.roomType = roomType as string;
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice as string);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice as string);
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { roomNumber: 'asc' },
      }),
      prisma.room.count({ where }),
    ]);

    return ApiResponse.paginated(res, rooms, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const hotelId = req.user?.hotelId;

    const room = await prisma.room.findFirst({
      where: { id, hotelId, deletedAt: null },
      include: {
        bookings: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!room) throw new AppError('Room not found', 404);

    return ApiResponse.success(res, room);
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const hotelId = req.user?.hotelId;

    const room = await prisma.room.findFirst({ where: { id, hotelId } });
    if (!room) throw new AppError('Room not found', 404);

    const updateData: any = { ...req.body };

    if (req.files) {
      const files = req.files as Express.Multer.File[];
      const newImages: string[] = [];
      for (const file of files) {
        const result = await uploadToCloudinary(file, 'rooms');
        newImages.push(result.url);
      }
      updateData.images = [...(room.images || []), ...newImages];
    }

    if (updateData.pricePerNight) updateData.pricePerNight = parseFloat(updateData.pricePerNight);
    if (updateData.capacity) updateData.capacity = parseInt(updateData.capacity);
    if (updateData.beds) updateData.beds = parseInt(updateData.beds);

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: updateData,
    });

    return ApiResponse.success(res, updatedRoom, 'Room updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const hotelId = req.user?.hotelId;

    const room = await prisma.room.findFirst({ where: { id, hotelId } });
    if (!room) throw new AppError('Room not found', 404);

    await prisma.room.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return ApiResponse.success(res, null, 'Room deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const updateRoomStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: { status },
    });

    return ApiResponse.success(res, room, 'Room status updated');
  } catch (error) {
    next(error);
  }
};

export const getAvailableRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { checkIn, checkOut, hotelId, roomType } = req.query;

    const where: any = {
      status: 'AVAILABLE',
      deletedAt: null,
    };

    if (hotelId) where.hotelId = hotelId as string;
    if (roomType) where.roomType = roomType as string;

    if (checkIn && checkOut) {
      const bookedRoomIds = await prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          AND: [
            { checkIn: { lt: new Date(checkOut as string) } },
            { checkOut: { gt: new Date(checkIn as string) } },
          ],
        },
        select: { roomId: true },
      });

      where.id = { notIn: bookedRoomIds.map((b) => b.roomId) };
    }

    const rooms = await prisma.room.findMany({
      where,
      include: { hotel: { select: { name: true } } },
      orderBy: { pricePerNight: 'asc' },
    });

    return ApiResponse.success(res, rooms);
  } catch (error) {
    next(error);
  }
};
