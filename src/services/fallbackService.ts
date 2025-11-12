import axios from 'axios';

interface ExternalWallpaper {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  type: 'static' | 'live';
  source: string;
}

export async function fetchFallbackWallpapers(
  type: 'static' | 'live',
  limit = 10
): Promise<ExternalWallpaper[]> {
  // Validate limit
  const validatedLimit = Math.max(1, Math.min(50, Number(limit) || 10));

  // Placeholder fallback implementation. In production, configure Unsplash/Pexels keys and fetch real data.
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const response = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          count: validatedLimit,
          query: type === 'static' ? 'wallpaper' : 'live wallpaper',
        },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
        timeout: 5000, // 5 second timeout
      });

      const data = Array.isArray(response.data) ? response.data : [response.data];
      return data
        .filter((item: any) => item && item.id && item.urls)
        .map((item: any) => ({
          id: item.id,
          title: item.description ?? item.alt_description ?? 'Unsplash Wallpaper',
          url: item.urls?.full ?? item.urls?.regular ?? '',
          thumbnailUrl: item.urls?.small,
          type,
          source: 'unsplash',
        }))
        .filter((item: ExternalWallpaper) => item.url); // Filter out items without URLs
    } catch (error) {
      console.warn('Unsplash fallback request failed', error instanceof Error ? error.message : error);
    }
  }

  return [];
}
