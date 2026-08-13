import * as pixabayService from './pixabayService.js';
import * as wallhavenService from './wallhavenService.js';
import * as pexelsService from './pexelsService.js';
/**
 * Merge results with weighted priority.
 * For static: Wallhaven (best for wallpapers) > Pexels > Pixabay
 * For video: Pexels (best quality) > Pixabay
 */
const weightedMerge = (resultSets, weights) => {
    const merged = [];
    const seen = new Set();
    // Calculate how many items to take from each source based on weight
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const maxItems = 80;
    for (let setIdx = 0; setIdx < resultSets.length; setIdx++) {
        const weight = weights[setIdx] ?? 0;
        const proportion = weight / totalWeight;
        const itemsToTake = Math.ceil(maxItems * proportion);
        const source = resultSets[setIdx];
        if (!source)
            continue;
        for (let i = 0; i < Math.min(itemsToTake, source.length); i++) {
            const item = source[i];
            if (!item)
                continue;
            const key = `${item.externalSource}-${item.externalId}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(item);
            }
        }
    }
    // Fill remaining slots with any leftover items from all sources
    for (const source of resultSets) {
        for (const item of source) {
            if (merged.length >= maxItems)
                break;
            const key = `${item.externalSource}-${item.externalId}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(item);
            }
        }
    }
    return merged.slice(0, maxItems);
};
export const searchAllSources = async (query, type = 'all', page = 1, sources = ['pexels', 'pixabay', 'wallhaven'], sort) => {
    const includePexels = sources.includes('pexels');
    const includePixabay = sources.includes('pixabay');
    const includeWallhaven = sources.includes('wallhaven');
    let staticResults = [];
    let liveResults = [];
    // Fetch static images with priority: Wallhaven > Pexels > Pixabay
    if (type === 'static' || type === 'all') {
        const staticPromises = [];
        const staticWeights = [];
        if (includeWallhaven) {
            staticPromises.push(wallhavenService.searchWallpapers(query, page, 24, sort));
            staticWeights.push(50);
        }
        if (includePexels) {
            staticPromises.push(pexelsService.searchPhotos(query, page, 20, 'portrait', sort));
            staticWeights.push(30);
        }
        if (includePixabay) {
            staticPromises.push(pixabayService.searchImages(query, page, 20, sort));
            staticWeights.push(20);
        }
        const results = await Promise.allSettled(staticPromises);
        const sets = results.map(res => res.status === 'fulfilled' ? res.value : []);
        staticResults = weightedMerge(sets, staticWeights);
    }
    // Fetch live videos with priority: Pexels > Pixabay
    if (type === 'live' || type === 'all') {
        const livePromises = [];
        const liveWeights = [];
        if (includePexels) {
            livePromises.push(pexelsService.searchVideos(query, page, 20, sort));
            liveWeights.push(60);
        }
        if (includePixabay) {
            livePromises.push(pixabayService.searchVideos(query, page, 20, sort));
            liveWeights.push(40);
        }
        const results = await Promise.allSettled(livePromises);
        const sets = results.map(res => res.status === 'fulfilled' ? res.value : []);
        liveResults = weightedMerge(sets, liveWeights);
    }
    return [...staticResults, ...liveResults];
};
//# sourceMappingURL=searchAggregator.js.map