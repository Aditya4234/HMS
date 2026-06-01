import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export const getRandomUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = req.query.results || '10';
    const response = await fetch(`https://randomuser.me/api/?results=${results}`);
    const data = (await response.json()) as { results: any[] };
    return ApiResponse.success(res, data.results);
  } catch (error) {
    next(error);
  }
};
