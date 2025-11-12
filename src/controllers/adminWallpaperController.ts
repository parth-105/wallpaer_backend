import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import axios from 'axios';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { IWallpaper, MediaInfo, WallpaperModel } from '../models/Wallpaper.js';
import { createResponse } from '../utils/apiResponse.js';
import { shiftRanks } from '../services/rankService.js';

function parseStringArray(input?: string | string[]): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.flatMap((item) => item.split(',')).map((value) => value.trim()).filter(Boolean);
  }
  return input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function ensureWallpaperType(type?: string): 'static' | 'live' {
  if (type === 'static' || type === 'live') {
    return type;
  }
  throw createHttpError(400, 'Invalid wallpaper type. Expected "static" or "live".');
}

export async function createWallpaper(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, type, status, rank, tags, categories, isFeatured } = req.body;

    if (!title) {
      throw createHttpError(400, 'Title is required');
    }

    const wallpaperType = ensureWallpaperType(type);

    if (!req.file) {
      throw createHttpError(400, 'Media file is required');
    }

    const resourceType = wallpaperType === 'live' ? 'video' : 'image';
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      resourceType,
      folder: wallpaperType === 'live' ? 'wallpapers/live' : 'wallpapers/static',
    });

    let resolvedRank: number | null = null;
    if (rank) {
      resolvedRank = Number(rank);
      await shiftRanks({
        type: wallpaperType,
        desiredRank: resolvedRank,
      });
    }

    const payload: Partial<IWallpaper> & { media: MediaInfo; type: 'static' | 'live' } = {
      title,
      type: wallpaperType,
      status: status === 'draft' ? 'draft' : 'published',
      tags: parseStringArray(tags),
      categories: parseStringArray(categories),
      isFeatured: isFeatured === 'true' || isFeatured === true,
      media: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        resourceType,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration,
        thumbnailUrl: uploadResult.thumbnail_url ?? uploadResult.secure_url,
      },
      metrics: {
        clickCount: 0,
      },
    };

    if (description !== undefined) {
      payload.description = description;
    }
    if (status !== 'draft') {
      payload.publishedAt = new Date();
    }
    if (resolvedRank != null) {
      payload.rank = resolvedRank;
      payload.isFeatured = true;
    }

    const wallpaper = await WallpaperModel.create(payload);

    res.status(201).json(createResponse({ data: wallpaper }));
  } catch (error) {
    next(error);
  }
}

export async function updateWallpaper(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updates: Record<string, unknown> = {};
    const body = req.body ?? {};

    if (body.title) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status) updates.status = body.status === 'draft' ? 'draft' : 'published';
    let desiredRank: number | null | undefined;
    if (body.rank !== undefined) {
      desiredRank = body.rank ? Number(body.rank) : null;
    }
    if (body.isFeatured !== undefined) {
      updates.isFeatured = body.isFeatured === 'true' || body.isFeatured === true;
    }
    if (body.tags !== undefined) {
      updates.tags = parseStringArray(body.tags);
    }
    if (body.categories !== undefined) {
      updates.categories = parseStringArray(body.categories);
    }

    let resourceType: 'image' | 'video' | undefined;
    if (body.type) {
      const wallpaperType = ensureWallpaperType(body.type);
      updates.type = wallpaperType;
      resourceType = wallpaperType === 'live' ? 'video' : 'image';
    }

    const wallpaper = await WallpaperModel.findById(id).exec();
    if (!wallpaper) {
      throw createHttpError(404, 'Wallpaper not found');
    }

    if (req.file) {
      const targetType = resourceType ?? (wallpaper.type === 'live' ? 'video' : 'image');
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        resourceType: targetType,
        folder: wallpaper.type === 'live' ? 'wallpapers/live' : 'wallpapers/static',
        publicId: wallpaper.media.publicId,
      });

      updates.media = {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        resourceType: targetType,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration,
        thumbnailUrl: uploadResult.thumbnail_url ?? uploadResult.secure_url,
      };
    }

    if (updates.status === 'published' && !wallpaper.publishedAt) {
      updates.publishedAt = new Date();
    }

    let targetRank: number | null | undefined = desiredRank;
    if (desiredRank !== undefined) {
      const effectiveType = (updates.type as 'static' | 'live') ?? wallpaper.type;
      if (desiredRank === null) {
        targetRank = null;
        updates.isFeatured = false;
      } else {
        if (wallpaper.rank !== desiredRank) {
          if (wallpaper.rank != null) {
            await WallpaperModel.updateOne({ _id: wallpaper.id }, { $set: { rank: null } }).exec();
          }

          await shiftRanks({
            type: effectiveType,
            desiredRank,
            excludeId: wallpaper.id,
          });
        }
        targetRank = desiredRank;
        updates.isFeatured = true;
      }
    }

    if (targetRank !== undefined) {
      updates.rank = targetRank;
    }

    const updated = await WallpaperModel.findByIdAndUpdate(id, updates, { new: true }).lean().exec();

    res.json(createResponse({ data: updated }));
  } catch (error) {
    next(error);
  }
}

export async function clearWallpaperRank(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updated = await WallpaperModel.findByIdAndUpdate(
      id,
      { $set: { rank: null }, $unset: { isFeatured: '' } },
      { new: true }
    )
      .lean()
      .exec();

    if (!updated) {
      throw createHttpError(404, 'Wallpaper not found');
    }

    res.json(createResponse({ data: updated }));
  } catch (error) {
    next(error);
  }
}

export async function deleteWallpaper(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const wallpaper = await WallpaperModel.findByIdAndDelete(id).lean().exec();
    if (!wallpaper) {
      throw createHttpError(404, 'Wallpaper not found');
    }

    await deleteFromCloudinary(wallpaper.media.publicId, wallpaper.media.resourceType);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function importWallpapers(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      throw createHttpError(400, 'Import payload must include a non-empty \"items\" array');
    }

    const created = [];

    for (const item of items) {
      const wallpaperType = ensureWallpaperType(item.type);
      if (!item.buffer && !item.base64 && !item.url) {
        throw createHttpError(400, 'Each item must include a url, buffer, or base64 field');
      }

      let fileBuffer: Buffer | null = null;

      if (item.buffer) {
        fileBuffer = Buffer.from(item.buffer, 'base64');
      } else if (item.base64) {
        fileBuffer = Buffer.from(item.base64, 'base64');
      } else if (item.url) {
        const response = await axios.get<ArrayBuffer>(item.url, {
          responseType: 'arraybuffer',
        });
        fileBuffer = Buffer.from(response.data);
      }

      if (!fileBuffer) {
        throw createHttpError(400, 'Could not resolve media buffer for import item');
      }

      const resourceType = wallpaperType === 'live' ? 'video' : 'image';
      const uploadResult = await uploadBufferToCloudinary(fileBuffer, {
        resourceType,
        folder: wallpaperType === 'live' ? 'wallpapers/live' : 'wallpapers/static',
      });

      let resolvedRank: number | null = null;
      if (item.rank) {
        resolvedRank = Number(item.rank);
        await shiftRanks({
          type: wallpaperType,
          desiredRank: resolvedRank,
        });
      }

      const payload: Partial<IWallpaper> & { media: MediaInfo; type: 'static' | 'live' } = {
        title: item.title ?? 'Imported Wallpaper',
        description: item.description,
        type: wallpaperType,
        status: 'published',
        tags: parseStringArray(item.tags),
        categories: parseStringArray(item.categories),
        rank: resolvedRank,
        isFeatured: resolvedRank != null,
        media: {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          resourceType,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height,
          duration: uploadResult.duration,
          thumbnailUrl: uploadResult.thumbnail_url ?? uploadResult.secure_url,
        },
        externalSource: item.source,
        externalId: item.externalId,
        metadata: item.metadata,
        publishedAt: new Date(),
        metrics: {
          clickCount: 0,
        },
      };

      const wallpaper = await WallpaperModel.create(payload);

      created.push(wallpaper);
    }

    res.status(201).json(createResponse({ data: created }));
  } catch (error) {
    next(error);
  }
}
