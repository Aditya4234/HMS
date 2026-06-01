import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    hotelId: z.string().uuid().optional(),
    roomId: z.string().uuid().optional(),
  }),
});
