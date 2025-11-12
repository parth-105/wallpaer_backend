import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { WallpaperModel } from '../models/Wallpaper.js';
import { buildWallpaperQuery } from '../utils/buildQuery.js';
import { createResponse } from '../utils/apiResponse.js';
import { fetchFallbackWallpapers } from '../services/fallbackService.js';
import mongoose from 'mongoose';

export async function listWallpapers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20', sort = 'rank', order = 'asc' } = req.query;

    const filters = buildWallpaperQuery({
      type: req.query.type as string | undefined,
      status: req.query.status as string | undefined,
      tags: req.query.tags as string | undefined,
      search: req.query.search as string | undefined,
    });

    const pageNumber = Math.max(1, Number(page));
    const pageSize = Math.min(100, Math.max(1, Number(limit)));

    const query = WallpaperModel.find(filters);

    if (sort === 'rank') {
      query.sort({ rank: order === 'desc' ? -1 : 1, updatedAt: -1 });
    } else {
      query.sort({ createdAt: -1 });
    }

    const [items, total] = await Promise.all([
      query.skip((pageNumber - 1) * pageSize).limit(pageSize).lean().exec(),
      WallpaperModel.countDocuments(filters).exec(),
    ]);

    res.json(
      createResponse({
        data: {
          items,
          pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
          },
        },
      })
    );
  } catch (error) {
    next(error);
  }
}

export async function getWallpaperById(req: Request, res: Response, next: NextFunction) {
  try {
    const wallpaper = await WallpaperModel.findById(req.params.id).lean().exec();
    if (!wallpaper) {
      throw createHttpError(404, 'Wallpaper not found');
    }

    res.json(createResponse({ data: wallpaper }));
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedWallpapers(req: Request, res: Response, next: NextFunction) {
  try {
    const type = (req.query.type as string) ?? 'static';
    const curated = await WallpaperModel.find({
      type,
      status: 'published',
      rank: { $exists: true, $ne: null },
    })
      .sort({ rank: 1 })
      .lean()
      .exec();

    if (curated.length === 0) {
      const fallback = await fetchFallbackWallpapers(type as 'static' | 'live');
      return res.json(
        createResponse({
          success: true,
          useFallback: true,
          data: fallback,
          message: 'No curated wallpapers found. Use fallback list.',
        })
      );
    }

    res.json(createResponse({ data: curated }));
  } catch (error) {
    next(error);
  }
}

export async function recordWallpaperClick(req: Request, res: Response, next: NextFunction) {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== 'string' || !mongoose.Types.ObjectId.isValid(idParam)) {
      throw createHttpError(400, 'Invalid wallpaper id');
    }
    const id = idParam;

    const updated = await WallpaperModel.findByIdAndUpdate(
      id,
      { $inc: { 'metrics.clickCount': 1 } },
      { new: true }
    ).exec();

    if (!updated) {
      throw createHttpError(404, 'Wallpaper not found');
    }

    res.json(
      createResponse({
        data: {
          clickCount: updated.metrics?.clickCount ?? 0,
          id: updated.id,
        },
      })
    );
  } catch (error) {
    next(error);
  }
}
