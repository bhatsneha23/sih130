export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Array<{ path: string; message: string }>;
    request_id: string;
  };
}
