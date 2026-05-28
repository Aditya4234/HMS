import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    roomNumber: z.string().min(1, 'Room number is required'),
    roomType: z.string().min(1, 'Room type is required'),
    floor: z.string().optional(),
    description: z.string().optional(),
    pricePerNight: z.string().min(1, 'Price is required'),
    capacity: z.string().optional(),
    size: z.string().optional(),
    beds: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).optional(),
  }),
});
