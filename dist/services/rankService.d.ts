interface ShiftRankOptions {
    type: 'static' | 'live';
    desiredRank: number;
    excludeId?: string;
}
/**
 * Shifts ranks downwards (rank += 1) starting from the desired rank to maintain unique ranks per type.
 */
export declare function shiftRanks({ type, desiredRank, excludeId }: ShiftRankOptions): Promise<void>;
export {};
//# sourceMappingURL=rankService.d.ts.map