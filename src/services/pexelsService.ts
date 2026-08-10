import axios from 'axios';
import { ExternalWallpaper } from '../types/externalWallpaper.js';
import { logInfo, logError } from '../utils/logger.js';

export const searchPhotos = async (query: string, page: number = 1, perPage: number = 15, orientation?: string): Promise<ExternalWallpaper[]> => {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    logInfo('Pexels API key not configured');
    return [];
  }

  try {
    let url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    const cleanQuery = query.toLowerCase().trim();
    if (['trending', 'popular', 'daily best'].includes(cleanQuery)) {
      url = `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`;
    } else if (orientation) {
      url += `&orientation=${orientation}`;
    }
    
    const response = await axios.get(url, { 
      headers: { Authorization: apiKey },
      timeout: 5000 
    });
    
    return response.data.photos.map((photo: any) => ({
      externalId: String(photo.id),
      externalSource: 'pexels',
      title: photo.alt || '',
      previewUrl: photo.src?.portrait || photo.src?.medium || '',
      sourceUrl: photo.src?.original || '',
      type: 'static',
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      tags: [],
    }));
  } catch (error) {
    logError('Pexels searchPhotos failed', { error });
    return [];
  }
};

export const searchVideos = async (query: string, page: number = 1, perPage: number = 15): Promise<ExternalWallpaper[]> => {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    logInfo('Pexels API key not configured');
    return [];
  }

  try {
    let url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&page=${page}&per_page=${perPage}`;
    const cleanQuery = query.toLowerCase().trim();
    if (['trending', 'popular', 'daily best'].includes(cleanQuery)) {
      url = `https://api.pexels.com/videos/popular?page=${page}&per_page=${perPage}`;
    }
    const response = await axios.get(url, { 
      headers: { Authorization: apiKey },
      timeout: 5000 
    });
    
    return response.data.videos
      .filter((video: any) => video.width < video.height || (video.video_files && video.video_files.some((f: any) => f.height > f.width)))
      .map((video: any) => {
        let highestQualityLink = '';
        let streamQualityLink = '';
        if (video.video_files && Array.isArray(video.video_files) && video.video_files.length > 0) {
          // Prefer vertical files (height > width)
          const verticalFiles = video.video_files.filter((v: any) => v.height >= v.width);
          const candidateFiles = verticalFiles.length > 0 ? verticalFiles : video.video_files;

          highestQualityLink = candidateFiles.sort((a: any, b: any) => (b.width * b.height) - (a.width * a.height))[0].link;
          
          const hdVideos = candidateFiles.filter((v: any) => v.quality === 'hd');
          if (hdVideos.length > 0) {
            streamQualityLink = hdVideos.sort((a: any, b: any) => (b.width * b.height) - (a.width * a.height))[0].link;
        } else {
          // Fallback to max quality if no HD is found
          streamQualityLink = highestQualityLink;
        }
      }
      
      return {
        externalId: String(video.id),
        externalSource: 'pexels',
        title: String(video.url?.split('/').pop()?.replace(/-/g, ' ') || ''),
        previewUrl: video.image || '',
        sourceUrl: highestQualityLink,
        streamUrl: streamQualityLink,
        type: 'live',
        width: video.width,
        height: video.height,
        duration: video.duration,
        photographer: video.user?.name,
        tags: [],
      };
    });
  } catch (error) {
    logError('Pexels searchVideos failed', { error });
    return [];
  }
};
