import { FilterQuery } from 'mongoose';
import { IWallpaperDocument, WallpaperModel } from '../models/Wallpaper.js';

interface ShiftRankOptions {
  type: 'static' | 'live';
  desiredRank: number;
  excludeId?: string;
}

/**
 * Shifts ranks downwards (rank += 1) starting from the desired rank to maintain unique ranks per type.
 */
export async function shiftRanks({ type, desiredRank, excludeId }: ShiftRankOptions): Promise<void> {
  if (!Number.isInteger(desiredRank) || desiredRank < 1) {
    return;
  }

  const query: FilterQuery<IWallpaperDocument> = {
    type,
    rank: { $gte: desiredRank },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  await WallpaperModel.updateMany(
    query,
    {
      $inc: { rank: 1 },
      $set: { isFeatured: true },
    }
  ).exec();
}


