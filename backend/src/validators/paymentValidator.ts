import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid('Invalid booking ID'),
    method: z.enum(['STRIPE', 'RAZORPAY', 'PAYPAL', 'CASH', 'CARD']),
  }),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().uuid('Invalid payment ID'),
    transactionId: z.string().optional(),
  }),
});
