import axios from 'axios';
import { logError } from '../utils/logger.js';
// Category-to-Wallhaven parameter mapping for smart filtering
const CATEGORY_PARAMS = {
    'trending': { sorting: 'hot' },
    'popular': { sorting: 'hot' },
    'daily best': { sorting: 'toplist', topRange: '1d' },
    'dark oled': { colors: '000000', sorting: 'toplist' },
    'dark': { colors: '000000', sorting: 'toplist' },
    '4k ultra': { atleast: '3840x2160', sorting: 'toplist' },
    '4k': { atleast: '3840x2160', sorting: 'toplist' },
    'ocean': { colors: '0066cc', q: 'ocean', sorting: 'relevance' },
    'nature': { q: 'nature landscape', sorting: 'relevance' },
    'abstract': { q: 'abstract colorful', sorting: 'relevance' },
    'anime': { q: 'anime', sorting: 'relevance' },
    'city': { q: 'city skyline urban night', sorting: 'relevance' },
    'supercars': { q: 'sports car supercar', sorting: 'relevance' },
};
export const searchWallpapers = async (query, page = 1, perPage = 24) => {
    try {
        const apiKey = process.env.WALLHAVEN_API_KEY;
        const cleanQuery = query.toLowerCase().trim();
        const categoryConfig = CATEGORY_PARAMS[cleanQuery];
        // Base URL — always request portrait ratios for phone wallpapers
        const minRes = categoryConfig?.atleast || '1920x1080';
        let url = `https://wallhaven.cc/api/v1/search?categories=111&purity=100&atleast=${minRes}&ratios=9x16,10x16,9x18&page=${page}`;
        if (categoryConfig) {
            // Use mapped params for known categories
            if (categoryConfig.sorting)
                url += `&sorting=${categoryConfig.sorting}`;
            if (categoryConfig.topRange)
                url += `&topRange=${categoryConfig.topRange}`;
            if (categoryConfig.colors)
                url += `&colors=${categoryConfig.colors}`;
            if (categoryConfig.q)
                url += `&q=${encodeURIComponent(categoryConfig.q)}`;
        }
        else {
            // Free-text search
            url += `&q=${encodeURIComponent(query)}&sorting=relevance`;
        }
        if (apiKey && apiKey !== 'your_wallhaven_api_key' && apiKey.trim().length > 0) {
            url += `&apikey=${apiKey}`;
        }
        const response = await axios.get(url, { timeout: 8000 });
        return response.data.data.map((item) => {
            let width = 0;
            let height = 0;
            if (item.resolution) {
                const parts = item.resolution.split('x');
                if (parts.length === 2) {
                    width = parseInt(parts[0], 10);
                    height = parseInt(parts[1], 10);
                }
            }
            // Build a meaningful title from tags if available
            const tagNames = item.tags ? item.tags.map((t) => t.name) : [];
            const title = tagNames.length > 0
                ? tagNames.slice(0, 3).join(', ')
                : `Wallhaven #${item.id}`;
            return {
                externalId: String(item.id),
                externalSource: 'wallhaven',
                title,
                previewUrl: item.thumbs?.large || item.thumbs?.original || '',
                sourceUrl: item.path || '',
                type: 'static',
                width,
                height,
                photographer: item.uploader?.username,
                tags: tagNames,
            };
        });
    }
    catch (error) {
        logError('Wallhaven searchWallpapers failed', { error });
        return [];
    }
};
//# sourceMappingURL=wallhavenService.js.map