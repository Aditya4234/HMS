import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { generateEmployeeId, parsePagination } from '../utils/helpers';

export const createStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    if (!hotelId) throw new AppError('Hotel not found', 404);

    const { fullName, email, phoneNumber, position, department, salary, gender, address, shift } = req.body;

    const existingStaff = await prisma.staff.findUnique({ where: { email } });
    if (existingStaff) throw new AppError('Staff with this email already exists', 400);

    const staff = await prisma.staff.create({
      data: {
        employeeId: generateEmployeeId(),
        fullName,
        email,
        phoneNumber,
        position,
        department,
        salary: salary ? parseFloat(salary) : undefined,
        gender,
        address,
        shift,
        hotelId,
      },
    });

    return ApiResponse.success(res, staff, 'Staff created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.user?.hotelId;
    if (!hotelId) throw new AppError('Hotel not found', 404);

    const { page, limit, skip } = parsePagination(req.query);
    const { department, position, isActive } = req.query;

    const where: any = { hotelId, deletedAt: null };
    if (department) where.department = department as string;
    if (position) where.position = position as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [staff, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take: limit,
        orderBy: { joiningDate: 'desc' },
      }),
      prisma.staff.count({ where }),
    ]);

    return ApiResponse.paginated(res, staff, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getStaffById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const staff = await prisma.staff.findFirst({
      where: { id, deletedAt: null },
    });
    if (!staff) throw new AppError('Staff not found', 404);
    return ApiResponse.success(res, staff);
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const staff = await prisma.staff.findFirst({ where: { id } });
    if (!staff) throw new AppError('Staff not found', 404);

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: req.body,
    });

    return ApiResponse.success(res, updatedStaff, 'Staff updated');
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.staff.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return ApiResponse.success(res, null, 'Staff deleted');
  } catch (error) {
    next(error);
  }
};
