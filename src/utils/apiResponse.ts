export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  useFallback?: boolean;
}

export function createResponse<T>(payload: Partial<ApiResponse<T>> = {}): ApiResponse<T> {
  const response: ApiResponse<T> = {
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

