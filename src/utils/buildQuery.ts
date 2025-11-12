import { FilterQuery } from 'mongoose';
import { IWallpaperDocument } from '../models/Wallpaper.js';

type QueryOptions = Partial<{
  type: string | null | undefined;
  status: string | null | undefined;
  tags: string | null | undefined;
  search: string | null | undefined;
}>;

export function buildWallpaperQuery(query: QueryOptions): FilterQuery<IWallpaperDocument> {
  const conditions: FilterQuery<IWallpaperDocument> = {};

  if (query.type) {
    conditions.type = query.type as IWallpaperDocument['type'];
  }

  if (query.status && query.status !== 'all') {
    conditions.status = query.status as IWallpaperDocument['status'];
  } else if (!query.status) {
    conditions.status = 'published';
  }

  if (query.tags) {
    const tagList = query.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    if (tagList.length > 0) {
      conditions.tags = { $in: tagList };
    }
  }

  if (query.search) {
    conditions.$text = { $search: query.search };
  }

  return conditions;
}
