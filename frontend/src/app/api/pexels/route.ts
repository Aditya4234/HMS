import { NextRequest, NextResponse } from 'next/server';

const PEXELS_API_KEY = process.env.PIXEL_API_KEY;
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || 'hotel room luxury';
  const perPage = parseInt(searchParams.get('per_page') || '1');
  const page = parseInt(searchParams.get('page') || '1');

  if (!PEXELS_API_KEY) {
    return NextResponse.json({ error: 'PIXEL_API_KEY not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from Pexels' }, { status: 500 });
  }
}
