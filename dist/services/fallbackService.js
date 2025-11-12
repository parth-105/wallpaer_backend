import axios from 'axios';
export async function fetchFallbackWallpapers(type, limit = 10) {
    // Placeholder fallback implementation. In production, configure Unsplash/Pexels keys and fetch real data.
    if (process.env.UNSPLASH_ACCESS_KEY) {
        try {
            const response = await axios.get('https://api.unsplash.com/photos/random', {
                params: {
                    count: limit,
                    query: type === 'static' ? 'wallpaper' : 'live wallpaper',
                },
                headers: {
                    Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
                },
            });
            const data = Array.isArray(response.data) ? response.data : [response.data];
            return data.map((item) => ({
                id: item.id,
                title: item.description ?? item.alt_description ?? 'Unsplash Wallpaper',
                url: item.urls?.full ?? item.urls?.regular,
                thumbnailUrl: item.urls?.small,
                type,
                source: 'unsplash',
            }));
        }
        catch (error) {
            console.warn('Unsplash fallback request failed', error);
        }
    }
    return [];
}
//# sourceMappingURL=fallbackService.js.map