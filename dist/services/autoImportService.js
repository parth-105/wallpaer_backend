import * as pexelsService from './pexelsService.js';
import * as pixabayService from './pixabayService.js';
import * as wallhavenService from './wallhavenService.js';
import { WallpaperModel } from '../models/Wallpaper.js';
import { logInfo, logError } from '../utils/logger.js';
const TRENDING_QUERIES = ['nature', 'abstract', 'dark wallpaper', 'space galaxy', 'ocean', 'city night', 'minimal'];
export const autoImportFromAPIs = async (config) => {
    const limits = {
        pexelsPhotos: config?.pexelsPhotos ?? 10,
        pexelsVideos: config?.pexelsVideos ?? 5,
        pixabayPhotos: config?.pixabayPhotos ?? 10,
        pixabayVideos: config?.pixabayVideos ?? 5,
        wallhavenPhotos: config?.wallhavenPhotos ?? 10,
    };
    const query = TRENDING_QUERIES[Math.floor(Math.random() * TRENDING_QUERIES.length)];
    if (!query)
        return;
    let importedCount = 0;
    const processResults = async (results, type) => {
        for (const result of results) {
            const exists = await WallpaperModel.findOne({
                externalSource: result.externalSource,
                externalId: result.externalId
            });
            if (!exists) {
                await WallpaperModel.create({
                    title: result.title || query,
                    type,
                    status: 'published',
                    tags: result.tags || [],
                    media: {
                        url: result.sourceUrl,
                        publicId: `external_${result.externalSource}_${result.externalId}`,
                        resourceType: type === 'live' ? 'video' : 'image',
                        thumbnailUrl: result.previewUrl
                    },
                    externalSource: result.externalSource,
                    externalId: result.externalId,
                    storageProvider: 'external'
                });
                importedCount++;
            }
        }
    };
    // Pexels
    try {
        if (limits.pexelsPhotos > 0) {
            const photos = await pexelsService.searchPhotos(query, 1, limits.pexelsPhotos);
            await processResults(photos, 'static');
        }
        if (limits.pexelsVideos > 0) {
            const videos = await pexelsService.searchVideos(query, 1, limits.pexelsVideos);
            await processResults(videos, 'live');
        }
    }
    catch (err) {
        logError('Error importing from Pexels', err);
    }
    // Pixabay
    try {
        if (limits.pixabayPhotos > 0) {
            const photos = await pixabayService.searchImages(query, 1, limits.pixabayPhotos);
            await processResults(photos, 'static');
        }
        if (limits.pixabayVideos > 0) {
            const videos = await pixabayService.searchVideos(query, 1, limits.pixabayVideos);
            await processResults(videos, 'live');
        }
    }
    catch (err) {
        logError('Error importing from Pixabay', err);
    }
    // Wallhaven
    try {
        if (limits.wallhavenPhotos > 0) {
            const photos = await wallhavenService.searchWallpapers(query, 1, limits.wallhavenPhotos);
            await processResults(photos, 'static');
        }
    }
    catch (err) {
        logError('Error importing from Wallhaven', err);
    }
    logInfo(`Auto-import completed. Imported ${importedCount} items.`);
};
//# sourceMappingURL=autoImportService.js.map