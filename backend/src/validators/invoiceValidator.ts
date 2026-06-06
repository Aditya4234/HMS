import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid('Invalid booking ID'),
    amount: z.number().positive('Amount must be positive'),
    taxAmount: z.number().min(0).optional(),
    totalAmount: z.number().positive('Total amount must be positive'),
    dueDate: z.string().min(1, 'Due date is required'),
    notes: z.string().optional(),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    taxAmount: z.number().min(0).optional(),
    totalAmount: z.number().positive('Total amount must be positive').optional(),
    dueDate: z.string().min(1, 'Due date is required').optional(),
    notes: z.string().optional(),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']).optional(),
  }),
});
