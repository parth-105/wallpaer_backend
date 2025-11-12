import createHttpError from 'http-errors';
import axios from 'axios';
import mongoose from 'mongoose';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { WallpaperModel } from '../models/Wallpaper.js';
import { createResponse } from '../utils/apiResponse.js';
import { shiftRanks } from '../services/rankService.js';
function parseStringArray(input) {
    if (!input)
        return [];
    if (Array.isArray(input)) {
        return input.flatMap((item) => item.split(',')).map((value) => value.trim()).filter(Boolean);
    }
    return input
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
}
function ensureWallpaperType(type) {
    if (type === 'static' || type === 'live') {
        return type;
    }
    throw createHttpError(400, 'Invalid wallpaper type. Expected "static" or "live".');
}
export async function createWallpaper(req, res, next) {
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
        let resolvedRank = null;
        if (rank) {
            resolvedRank = Number(rank);
            if (isNaN(resolvedRank) || resolvedRank < 1) {
                throw createHttpError(400, 'Rank must be a positive number');
            }
            await shiftRanks({
                type: wallpaperType,
                desiredRank: resolvedRank,
            });
        }
        const payload = {
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
    }
    catch (error) {
        next(error);
    }
}
export async function updateWallpaper(req, res, next) {
    try {
        const { id } = req.params;
        // Validate ObjectId format
        if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            throw createHttpError(400, 'Invalid wallpaper ID format');
        }
        const updates = {};
        const body = req.body ?? {};
        if (body.title)
            updates.title = body.title;
        if (body.description !== undefined)
            updates.description = body.description;
        if (body.status)
            updates.status = body.status === 'draft' ? 'draft' : 'published';
        let desiredRank;
        if (body.rank !== undefined) {
            desiredRank = body.rank ? Number(body.rank) : null;
            if (desiredRank !== null && (isNaN(desiredRank) || desiredRank < 1)) {
                throw createHttpError(400, 'Rank must be a positive number');
            }
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
        let resourceType;
        if (body.type) {
            const wallpaperType = ensureWallpaperType(body.type);
            updates.type = wallpaperType;
            resourceType = wallpaperType === 'live' ? 'video' : 'image';
        }
        const wallpaper = await WallpaperModel.findById(id).exec();
        if (!wallpaper) {
            throw createHttpError(404, 'Wallpaper not found');
        }
        // Ensure wallpaper has an ID
        if (!wallpaper._id) {
            throw createHttpError(500, 'Wallpaper ID is missing');
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
        let targetRank = desiredRank;
        if (desiredRank !== undefined) {
            const effectiveType = updates.type ?? wallpaper.type;
            if (desiredRank === null) {
                targetRank = null;
                updates.isFeatured = false;
            }
            else {
                if (wallpaper.rank !== desiredRank) {
                    if (wallpaper.rank != null) {
                        await WallpaperModel.updateOne({ _id: wallpaper._id }, { $set: { rank: null } }).exec();
                    }
                    await shiftRanks({
                        type: effectiveType,
                        desiredRank,
                        excludeId: wallpaper._id.toString(),
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
    }
    catch (error) {
        next(error);
    }
}
export async function clearWallpaperRank(req, res, next) {
    try {
        const { id } = req.params;
        // Validate ObjectId format
        if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            throw createHttpError(400, 'Invalid wallpaper ID format');
        }
        const updated = await WallpaperModel.findByIdAndUpdate(id, { $set: { rank: null }, $unset: { isFeatured: '' } }, { new: true })
            .lean()
            .exec();
        if (!updated) {
            throw createHttpError(404, 'Wallpaper not found');
        }
        res.json(createResponse({ data: updated }));
    }
    catch (error) {
        next(error);
    }
}
export async function deleteWallpaper(req, res, next) {
    try {
        const { id } = req.params;
        // Validate ObjectId format
        if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            throw createHttpError(400, 'Invalid wallpaper ID format');
        }
        const wallpaper = await WallpaperModel.findByIdAndDelete(id).lean().exec();
        if (!wallpaper) {
            throw createHttpError(404, 'Wallpaper not found');
        }
        // Validate media data exists
        if (!wallpaper.media || !wallpaper.media.publicId || !wallpaper.media.resourceType) {
            console.warn('Wallpaper deleted but media information is missing', wallpaper._id);
            return res.status(204).send();
        }
        try {
            await deleteFromCloudinary(wallpaper.media.publicId, wallpaper.media.resourceType);
        }
        catch (cloudinaryError) {
            // Log error but don't fail the request if Cloudinary deletion fails
            console.error('Failed to delete from Cloudinary', cloudinaryError);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}
export async function importWallpapers(req, res, next) {
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
            let fileBuffer = null;
            if (item.buffer) {
                fileBuffer = Buffer.from(item.buffer, 'base64');
            }
            else if (item.base64) {
                fileBuffer = Buffer.from(item.base64, 'base64');
            }
            else if (item.url) {
                const response = await axios.get(item.url, {
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
            let resolvedRank = null;
            if (item.rank) {
                resolvedRank = Number(item.rank);
                if (isNaN(resolvedRank) || resolvedRank < 1) {
                    throw createHttpError(400, `Rank must be a positive number for item: ${item.title || 'unknown'}`);
                }
                await shiftRanks({
                    type: wallpaperType,
                    desiredRank: resolvedRank,
                });
            }
            const payload = {
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=adminWallpaperController.js.map