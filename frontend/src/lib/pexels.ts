const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PIXEL_API_KEY;
const PEXELS_API_URL = 'https://api.pexels.com/v1';

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large: string;
    large2x: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
  };
  alt: string;
  photographer: string;
  photographer_url: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

export async function searchPexelsImages(
  query: string = 'hotel room luxury',
  perPage: number = 1
): Promise<PexelsPhoto[]> {
  if (!PEXELS_API_KEY) return [];

  try {
    const response = await fetch(
      `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: { Authorization: PEXELS_API_KEY },
      }
    );
    if (!response.ok) throw new Error(`Pexels API error: ${response.status}`);
    const data: PexelsResponse = await response.json();
    return data.photos || [];
  } catch {
    return [];
  }
}

export const FALLBACK_IMAGES = [
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export const HERO_FALLBACK = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200';
