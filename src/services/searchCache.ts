import NodeCache from 'node-cache';
import type { ExternalWallpaper } from '../types/externalWallpaper.js';

const cache = new NodeCache({
  stdTTL: 3600,
  maxKeys: 500,
  checkperiod: 120,
});

export const getCachedSearch = (query: string, type: string, page: number): ExternalWallpaper[] | undefined => {
  return cache.get<ExternalWallpaper[]>(`search:${query}:${type}:${page}`);
};

export const setCachedSearch = (query: string, type: string, page: number, results: ExternalWallpaper[]): void => {
  cache.set(`search:${query}:${type}:${page}`, results);
};

export const getCachedCategories = (): string[] | undefined => {
  return cache.get<string[]>('categories');
};

export const setCachedCategories = (categories: string[]): void => {
  cache.set('categories', categories, 21600); // 6 hours
};

export const clearSearchCache = (): void => {
  const keys = cache.keys();
  const searchKeys = keys.filter(key => key.startsWith('search:'));
  cache.del(searchKeys);
};

export const getCacheStats = (): { keys: number; hits: number; misses: number } => {
  const stats = cache.getStats();
  return {
    keys: stats.keys,
    hits: stats.hits,
    misses: stats.misses,
  };
};
