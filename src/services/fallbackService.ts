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
  // Placeholder fallback implementation. In production, configure Unsplash/Pexels keys and fetch real data.
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const response = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          count: limit,
          query: type === 'static' ? 'wallpaper' : 'live wallpaper',
        },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      });

      const data = Array.isArray(response.data) ? response.data : [response.data];
      return data.map((item: any) => ({
        id: item.id,
        title: item.description ?? item.alt_description ?? 'Unsplash Wallpaper',
        url: item.urls?.full ?? item.urls?.regular,
        thumbnailUrl: item.urls?.small,
        type,
        source: 'unsplash',
      }));
    } catch (error) {
      console.warn('Unsplash fallback request failed', error);
    }
  }

  return [];
}
