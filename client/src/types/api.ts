export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiError {
  response?: {
    status: number;
    data: {
      error: string;
    };
  };
} 