import axios from 'axios';
import { logInfo, logError } from '../utils/logger.js';
export const searchImages = async (query, page = 1, perPage = 20) => {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
        logInfo('Pixabay API key not configured');
        return [];
    }
    try {
        const cleanQuery = query.toLowerCase().trim();
        // Category-specific parameter mapping for Pixabay
        const PIXABAY_CATEGORY_PARAMS = {
            'trending': {},
            'popular': {},
            'daily best': {},
            'dark oled': { colors: 'black' },
            'dark': { colors: 'black' },
            '4k ultra': { minWidth: 3840 },
            '4k': { minWidth: 3840 },
            'ocean': { category: 'nature', colors: 'blue,turquoise', q: 'ocean' },
            'nature': { category: 'nature' },
            'abstract': { category: 'backgrounds', q: 'abstract' },
            'anime': { q: 'anime' },
            'city': { category: 'buildings', q: 'city' },
            'supercars': { category: 'transportation', q: 'supercar' },
        };
        const categoryConfig = PIXABAY_CATEGORY_PARAMS[cleanQuery];
        const minW = categoryConfig?.minWidth || 1080;
        let url = `https://pixabay.com/api/?key=${apiKey}&image_type=photo&orientation=vertical&min_width=${minW}&min_height=1920&per_page=${perPage}&page=${page}&order=popular&safesearch=true`;
        if (['trending', 'popular', 'daily best'].includes(cleanQuery)) {
            url += `&editors_choice=true`;
        }
        else {
            const searchQuery = categoryConfig?.q || query;
            url += `&q=${encodeURIComponent(searchQuery)}`;
        }
        if (categoryConfig?.category)
            url += `&category=${categoryConfig.category}`;
        if (categoryConfig?.colors)
            url += `&colors=${categoryConfig.colors}`;
        const response = await axios.get(url, { timeout: 5000 });
        return response.data.hits.map((hit) => ({
            externalId: String(hit.id),
            externalSource: 'pixabay',
            title: hit.tags || '',
            previewUrl: hit.webformatURL,
            sourceUrl: hit.largeImageURL,
            type: 'static',
            width: hit.imageWidth,
            height: hit.imageHeight,
            photographer: hit.user,
            tags: hit.tags ? hit.tags.split(',').map((t) => t.trim()) : [],
        }));
    }
    catch (error) {
        logError('Pixabay searchImages failed', { error });
        return [];
    }
};
export const searchVideos = async (query, page = 1, perPage = 20) => {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
        logInfo('Pixabay API key not configured');
        return [];
    }
    try {
        const cleanQuery = query.toLowerCase().trim();
        let url = `https://pixabay.com/api/videos/?key=${apiKey}&per_page=${perPage}&page=${page}&order=popular&safesearch=true&video_type=film`;
        if (['trending', 'popular', 'daily best'].includes(cleanQuery)) {
            url += `&editors_choice=true`;
        }
        else {
            url += `&q=${encodeURIComponent(query)}`;
        }
        const response = await axios.get(url, { timeout: 5000 });
        return response.data.hits
            .filter((hit) => {
            const v = hit.videos?.large || hit.videos?.medium || hit.videos?.small;
            return v && v.height >= v.width;
        })
            .map((hit) => ({
            externalId: String(hit.id),
            externalSource: 'pixabay',
            previewUrl: (hit.videos?.tiny?.thumbnail && !hit.videos.tiny.thumbnail.includes('undefined'))
                ? hit.videos.tiny.thumbnail
                : (hit.picture_id ? `https://i.vimeocdn.com/video/${hit.picture_id}_295x166.jpg` : (hit.userImageURL || '')),
            sourceUrl: hit.videos?.large?.url || hit.videos?.medium?.url || hit.videos?.small?.url || '',
            streamUrl: hit.videos?.medium?.url || hit.videos?.small?.url || hit.videos?.large?.url || '',
            type: 'live',
            width: hit.videos?.large?.width || hit.videos?.medium?.width,
            height: hit.videos?.large?.height || hit.videos?.medium?.height,
            duration: hit.duration,
            photographer: hit.user,
            tags: hit.tags ? hit.tags.split(',').map((t) => t.trim()) : [],
        }));
    }
    catch (error) {
        logError('Pixabay searchVideos failed', { error });
        return [];
    }
};
//# sourceMappingURL=pixabayService.js.map