// Single place that touches import.meta.env (Vite-only). Jest maps this module to test/envMock.ts.
export const env = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000',
};
