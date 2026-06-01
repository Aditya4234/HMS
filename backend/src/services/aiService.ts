import OpenAI from 'openai';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

let openai: OpenAI | null = null;

const getOpenAI = (): OpenAI => {
  if (!openai) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new AppError('OpenRouter API key not configured', 500);
    }
    openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'Hotel Management System',
      },
    });
  }
  return openai;
};

interface SearchParams {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  hotelName?: string;
  city?: string;
  summary?: string;
}

export const searchRoomsWithAI = async (query: string, hotelId?: string) => {
  const systemPrompt = `You are a hotel booking assistant. Extract search parameters from the user's query.

Respond with ONLY a valid JSON object (no markdown, no code blocks) with these possible fields:
{
  "checkIn": "YYYY-MM-DD" or null,
  "checkOut": "YYYY-MM-DD" or null,
  "guests": number of guests or null,
  "rooms": number of rooms or null,
  "roomType": "SINGLE/DOUBLE/SUITE/DELUXE/etc" or null,
  "minPrice": number or null,
  "maxPrice": number or null,
  "amenities": ["wifi", "ac", "tv", "balcony", etc] or [],
  "hotelName": "hotel name" or null,
  "city": "city name" or null,
  "summary": "A friendly one-line summary of what the user is looking for"
}

Examples:
Query: "2 rooms for 2 people each for 3 days from next Monday"
Response: {"checkIn":"2026-06-01","checkOut":"2026-06-04","guests":4,"rooms":2,"roomType":null,"minPrice":null,"maxPrice":null,"amenities":[],"hotelName":null,"city":null,"summary":"Looking for 2 rooms for 4 guests over 3 nights"}

Query: "show me available deluxe rooms under $200"
Response: {"checkIn":null,"checkOut":null,"guests":null,"rooms":null,"roomType":"DELUXE","minPrice":null,"maxPrice":200,"amenities":[],"hotelName":null,"city":null,"summary":"Searching for deluxe rooms under $200"}

Query: "AC room with wifi for 2 people tonight"
Response: {"checkIn":"2026-05-28","checkOut":"2026-05-29","guests":2,"rooms":1,"roomType":null,"minPrice":null,"maxPrice":null,"amenities":["ac","wifi"],"hotelName":null,"city":null,"summary":"AC room with wifi for 2 guests tonight"}

Today's date is ${new Date().toISOString().split('T')[0]}. Use it to calculate relative dates.`;

  const completion = await getOpenAI().chat.completions.create({
    model: 'openai/gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ],
    temperature: 0.1,
    max_tokens: 300,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new AppError('AI failed to process the query', 500);

  let params: SearchParams;
  try {
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    params = JSON.parse(cleaned);
  } catch {
    throw new AppError('AI returned invalid response format', 500);
  }

  const where: any = {
    status: 'AVAILABLE',
    deletedAt: null,
  };

  if (hotelId) where.hotelId = hotelId;
  if (params.roomType) where.roomType = { contains: params.roomType, mode: 'insensitive' };
  if (params.minPrice || params.maxPrice) {
    where.pricePerNight = {};
    if (params.minPrice) where.pricePerNight.gte = params.minPrice;
    if (params.maxPrice) where.pricePerNight.lte = params.maxPrice;
  }
  if (params.guests) where.capacity = { gte: params.guests };
  if (params.amenities && params.amenities.length > 0) {
    where.amenities = { hasSome: params.amenities };
  }
  if (params.hotelName) {
    where.hotel = { name: { contains: params.hotelName, mode: 'insensitive' } };
  }
  if (params.city) {
    where.hotel = {
      ...(where.hotel || {}),
      city: { contains: params.city, mode: 'insensitive' },
    };
  }

  if (params.checkIn && params.checkOut) {
    const bookedRoomIds = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        AND: [
          { checkIn: { lt: new Date(params.checkOut) } },
          { checkOut: { gt: new Date(params.checkIn) } },
        ],
      },
      select: { roomId: true },
    });

    const bookedIds = bookedRoomIds.map((b) => b.roomId);
    if (bookedIds.length > 0) {
      where.id = { notIn: bookedIds };
    }
  }

  let rooms = await prisma.room.findMany({
    where,
    include: {
      hotel: {
        select: { id: true, name: true, city: true, address: true, rating: true },
      },
    },
    orderBy: { pricePerNight: 'asc' },
  });

  if (params.rooms && params.rooms > 1) {
    rooms = rooms.slice(0, params.rooms * 3);
  }

  return {
    params,
    rooms,
    total: rooms.length,
  };
};
