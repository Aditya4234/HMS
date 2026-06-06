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
  try {
    const response = await fetch(
      `/api/pexels?query=${encodeURIComponent(query)}&per_page=${perPage}`
    );
    if (!response.ok) throw new Error('Failed to fetch images');
    const data: PexelsResponse = await response.json();
    return data.photos || [];
  } catch {
    return [];
  }
}

export function getImageUrl(
  images: string[] | undefined | null,
  fallbackUrl?: string
): string | null {
  if (images && images.length > 0 && images[0]) {
    return images[0];
  }
  return fallbackUrl || null;
}
