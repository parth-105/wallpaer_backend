export function buildWallpaperQuery(query) {
    const conditions = {};
    if (query.type) {
        conditions.type = query.type;
    }
    if (query.status && query.status !== 'all') {
        conditions.status = query.status;
    }
    else if (!query.status) {
        conditions.status = 'published';
    }
    if (query.tags) {
        const tagList = query.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        if (tagList.length > 0) {
            conditions.tags = { $in: tagList };
        }
    }
    if (query.search) {
        conditions.$text = { $search: query.search };
    }
    return conditions;
}
//# sourceMappingURL=buildQuery.js.map