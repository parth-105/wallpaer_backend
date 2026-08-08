import type { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse.js';
import { searchAllSources } from '../services/searchAggregator.js';
import { getCachedSearch, setCachedSearch } from '../services/searchCache.js';
import { WallpaperModel } from '../models/Wallpaper.js';
import type { ExternalWallpaper } from '../types/externalWallpaper.js';

export const searchWallpapers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q = (req.query.q as string | undefined)?.trim() || 'popular';
        const type = (req.query.type as 'static' | 'live' | 'all') || 'all';
        const page = parseInt(req.query.page as string, 10) || 1;
        const sourcesParam = req.query.sources as string | undefined;
        const sourcesArray = sourcesParam ? sourcesParam.split(',') : ['pexels', 'pixabay', 'wallhaven'];

        const cached = getCachedSearch(q, type, page);
        if (cached) {
            return res.json(createResponse({ 
                data: { items: cached, query: q, type, page, sources: sourcesArray } 
            }));
        }

        const results = await searchAllSources(q, type, page, sourcesArray);
        setCachedSearch(q, type, page, results);

        return res.json(createResponse({ 
            data: { items: results, query: q, type, page, sources: sourcesArray } 
        }));
    } catch (error) {
        next(error);
    }
};

const CATEGORIES = [
    { name: 'Nature', icon: '🌿', query: 'nature landscape' },
    { name: 'Abstract', icon: '🎨', query: 'abstract colorful' },
    { name: 'Anime', icon: '⛩️', query: 'anime wallpaper' },
    { name: 'Dark', icon: '🌙', query: 'dark moody' },
    { name: 'Space', icon: '🚀', query: 'space galaxy nebula' },
    { name: 'Animals', icon: '🦁', query: 'animals wildlife' },
    { name: 'City', icon: '🏙️', query: 'city skyline urban' },
    { name: 'Minimal', icon: '◻️', query: 'minimal simple clean' },
    { name: 'Cars', icon: '🏎️', query: 'sports car supercar' },
    { name: 'Ocean', icon: '🌊', query: 'ocean beach waves' },
    { name: 'Mountains', icon: '⛰️', query: 'mountains peaks' },
    { name: 'Flowers', icon: '🌸', query: 'flowers botanical' },
];

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        return res.json(createResponse({ data: CATEGORIES }));
    } catch (error) {
        next(error);
    }
};

export const getTrending = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = (req.query.type as 'static' | 'live') || 'static';
        let limit = parseInt(req.query.limit as string, 10) || 20;
        if (limit > 50) limit = 50;

        const items = await WallpaperModel.find({ type, status: 'published' })
            .sort({ 'metrics.clickCount': -1 })
            .limit(limit);

        return res.json(createResponse({ data: { items, type, limit } }));
    } catch (error) {
        next(error);
    }
};
