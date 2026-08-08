import NodeCache from 'node-cache';
const cache = new NodeCache({
    stdTTL: 3600,
    maxKeys: 500,
    checkperiod: 120,
});
export const getCachedSearch = (query, type, page) => {
    return cache.get(`search:${query}:${type}:${page}`);
};
export const setCachedSearch = (query, type, page, results) => {
    cache.set(`search:${query}:${type}:${page}`, results);
};
export const getCachedCategories = () => {
    return cache.get('categories');
};
export const setCachedCategories = (categories) => {
    cache.set('categories', categories, 21600); // 6 hours
};
export const clearSearchCache = () => {
    const keys = cache.keys();
    const searchKeys = keys.filter(key => key.startsWith('search:'));
    cache.del(searchKeys);
};
export const getCacheStats = () => {
    const stats = cache.getStats();
    return {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
    };
};
//# sourceMappingURL=searchCache.js.map