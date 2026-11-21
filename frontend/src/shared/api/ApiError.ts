import { isAxiosError } from 'axios';

/** Normalised error every API call rejects with, so UI code never inspects axios internals. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string[]> = {},
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

interface ErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (isAxiosError<ErrorBody>(error)) {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const fallback =
      status === 0
        ? 'Cannot reach the server. Check your connection and try again.'
        : status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : 'Something went wrong. Please try again.';
    return new ApiError(body?.message ?? fallback, status, body?.errors ?? {}, body?.code);
  }

  return new ApiError('Something went wrong. Please try again.', 0);
}
