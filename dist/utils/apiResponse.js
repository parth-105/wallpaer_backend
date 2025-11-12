export function createResponse(payload = {}) {
    const response = {
        success: payload.success ?? true,
    };
    if ('message' in payload) {
        response.message = payload.message;
    }
    if ('data' in payload) {
        response.data = payload.data;
    }
    if ('useFallback' in payload) {
        response.useFallback = payload.useFallback;
    }
    return response;
}
//# sourceMappingURL=apiResponse.js.map