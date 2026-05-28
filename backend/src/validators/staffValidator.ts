import { z } from 'zod';

export const createStaffSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    phoneNumber: z.string().optional(),
    position: z.string().min(1, 'Position is required'),
    department: z.string().min(1, 'Department is required'),
    salary: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    address: z.string().optional(),
    shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']).optional(),
  }),
});
