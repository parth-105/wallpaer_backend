import { WallpaperModel } from '../models/Wallpaper.js';
/**
 * Shifts ranks downwards (rank += 1) starting from the desired rank to maintain unique ranks per type.
 */
export async function shiftRanks({ type, desiredRank, excludeId }) {
    if (!Number.isInteger(desiredRank) || desiredRank < 1) {
        return;
    }
    const query = {
        type,
        rank: { $gte: desiredRank },
    };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    await WallpaperModel.updateMany(query, {
        $inc: { rank: 1 },
        $set: { isFeatured: true },
    }).exec();
}
//# sourceMappingURL=rankService.js.map