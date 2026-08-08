export interface ExternalWallpaper {
  externalId: string;
  externalSource: 'pexels' | 'pixabay' | 'wallhaven' | 'unsplash';
  title: string;
  previewUrl: string;
  sourceUrl: string;
  streamUrl?: string;
  type: 'static' | 'live';
  width?: number;
  height?: number;
  duration?: number;
  photographer?: string;
  tags?: string[];
}
