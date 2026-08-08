import * as pixabayService from './pixabayService.js';
import * as wallhavenService from './wallhavenService.js';
import * as pexelsService from './pexelsService.js';
export const searchAllSources = async (query, type = 'all', page = 1, sources = ['pexels', 'pixabay', 'wallhaven']) => {
    const promises = [];
    const includePexels = sources.includes('pexels');
    const includePixabay = sources.includes('pixabay');
    const includeWallhaven = sources.includes('wallhaven');
    if (type === 'static' || type === 'all') {
        if (includePexels)
            promises.push(pexelsService.searchPhotos(query, page, 20, 'vertical'));
        if (includePixabay)
            promises.push(pixabayService.searchImages(query, page, 20));
        if (includeWallhaven)
            promises.push(wallhavenService.searchWallpapers(query, page, 20));
    }
    if (type === 'live' || type === 'all') {
        if (includePexels)
            promises.push(pexelsService.searchVideos(query, page, 20));
        if (includePixabay)
            promises.push(pixabayService.searchVideos(query, page, 20));
    }
    const results = await Promise.allSettled(promises);
    const allResultSets = results.map(res => res.status === 'fulfilled' ? res.value : []);
    // Interleave results
    const merged = [];
    const maxLen = Math.max(...allResultSets.map(set => set.length), 0);
    const seen = new Set();
    for (let i = 0; i < maxLen; i++) {
        for (const resultSet of allResultSets) {
            if (resultSet[i]) {
                const item = resultSet[i];
                const key = `${item.externalSource}-${item.externalId}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    merged.push(item);
                }
            }
        }
    }
    return merged.slice(0, 60);
};
//# sourceMappingURL=searchAggregator.js.map