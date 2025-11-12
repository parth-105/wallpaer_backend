export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    useFallback?: boolean;
}
export declare function createResponse<T>(payload?: Partial<ApiResponse<T>>): ApiResponse<T>;
//# sourceMappingURL=apiResponse.d.ts.map