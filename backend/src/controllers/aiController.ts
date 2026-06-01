import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { searchRoomsWithAI } from '../services/aiService';

export const aiSearchRooms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const hotelId = req.user?.hotelId;
    const result = await searchRoomsWithAI(query, hotelId);

    return ApiResponse.success(res, result, 'AI search completed');
  } catch (error) {
    next(error);
  }
};

export const aiChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const hotelId = req.user?.hotelId;
    const result = await searchRoomsWithAI(message, hotelId);

    return ApiResponse.success(res, {
      reply: result.params.summary || 'Here are the available rooms matching your search.',
      rooms: result.rooms,
      total: result.total,
    }, 'AI response generated');
  } catch (error) {
    next(error);
  }
};
