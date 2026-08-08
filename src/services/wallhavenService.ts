import axios from 'axios';
import { ExternalWallpaper } from '../types/externalWallpaper.js';
import { logError } from '../utils/logger.js';

export const searchWallpapers = async (query: string, page: number = 1, perPage: number = 24): Promise<ExternalWallpaper[]> => {
  try {
    const apiKey = process.env.WALLHAVEN_API_KEY;
    let url = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&categories=111&purity=100&atleast=1920x1080&sorting=toplist&page=${page}`;
    if (apiKey && apiKey !== 'your_wallhaven_api_key' && apiKey.trim().length > 0) {
      url += `&apikey=${apiKey}`;
    }

    const response = await axios.get(url, { timeout: 5000 });
    
    return response.data.data.map((item: any) => {
      let width = 0;
      let height = 0;
      if (item.resolution) {
        const parts = item.resolution.split('x');
        if (parts.length === 2) {
          width = parseInt(parts[0] as string, 10);
          height = parseInt(parts[1] as string, 10);
        }
      }
      
      return {
        externalId: String(item.id),
        externalSource: 'wallhaven',
        title: String(item.id), // Wallhaven doesn't provide standard titles
        previewUrl: item.thumbs?.large || '',
        sourceUrl: item.path || '',
        type: 'static',
        width,
        height,
        tags: item.tags ? item.tags.map((t: any) => t.name) : [],
      };
    });
  } catch (error) {
    logError('Wallhaven searchWallpapers failed', { error });
    return [];
  }
};
