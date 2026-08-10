import axios from 'axios';
import { logInfo, logError } from '../utils/logger.js';
export const searchImages = async (query, page = 1, perPage = 20) => {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
        logInfo('Pixabay API key not configured');
        return [];
    }
    try {
        let url = `https://pixabay.com/api/?key=${apiKey}&image_type=photo&orientation=vertical&min_width=1080&per_page=${perPage}&page=${page}&order=popular`;
        const cleanQuery = query.toLowerCase().trim();
        if (['trending', 'popular', 'daily best'].includes(cleanQuery)) {
            url += `&editors_choice=true`;
        }
        else {
            url += `&q=${encodeURIComponent(query)}`;
        }
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
        let url = `https://pixabay.com/api/videos/?key=${apiKey}&per_page=${perPage}&page=${page}&order=popular`;
        const cleanQuery = query.toLowerCase().trim();
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