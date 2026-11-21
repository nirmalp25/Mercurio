import axios from 'axios';
import { env } from '@/shared/config/env';
import { toApiError } from './ApiError';

/**
 * The only HTTP client in the app. It talks to OUR API; the product source behind it
 * (Fake Store today) is invisible to the frontend.
 */
export const http = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true, // Sanctum session cookie
  withXSRFToken: true, // send XSRF-TOKEN cookie back as X-XSRF-TOKEN header
  headers: { Accept: 'application/json' },
  timeout: 15_000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

let csrfReady: Promise<void> | null = null;

/** Sanctum SPA auth: prime the CSRF cookie once before the first state-changing request. */
export function ensureCsrfCookie(): Promise<void> {
  csrfReady ??= http
    .get('/sanctum/csrf-cookie')
    .then(() => undefined)
    .catch((error) => {
      csrfReady = null; // allow a retry next time
      throw error;
    });
  return csrfReady;
}
