import { ensureCsrfCookie, http } from './httpClient';
import type {
  AdminProducts,
  Category,
  CategoryProducts,
  Enquiry,
  EnquiryCreated,
  EnquiryPayload,
  EnquiryStatus,
  Paginated,
  Product,
  Suggestion,
  User,
} from './types';

type Data<T> = { data: T };

// Typed endpoint functions: the single seam the UI depends on (and tests mock).

export const catalogueApi = {
  topRated: (signal?: AbortSignal) =>
    http.get<Data<Product[]>>('/api/products/top-rated', { signal }).then((r) => r.data.data),

  categories: (signal?: AbortSignal) =>
    http.get<Data<Category[]>>('/api/categories', { signal }).then((r) => r.data.data),

  categoryProducts: (slug: string, signal?: AbortSignal) =>
    http
      .get<Data<CategoryProducts>>(`/api/categories/${encodeURIComponent(slug)}/products`, { signal })
      .then((r) => r.data.data),

  search: (q: string, signal?: AbortSignal) =>
    http.get<Data<Product[]>>('/api/products/search', { params: { q }, signal }).then((r) => r.data.data),

  suggest: (q: string, limit: number, signal?: AbortSignal) =>
    http
      .get<Data<Suggestion[]>>('/api/products/suggest', { params: { q, limit }, signal })
      .then((r) => r.data.data),

  product: (id: number, signal?: AbortSignal) =>
    http.get<Data<Product>>(`/api/products/${id}`, { signal }).then((r) => r.data.data),
};

export const enquiryApi = {
  submit: async (payload: EnquiryPayload) => {
    await ensureCsrfCookie();
    return http.post<EnquiryCreated>('/api/enquiries', payload).then((r) => r.data);
  },
};

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    await ensureCsrfCookie();
    return http.post<Data<User>>('/api/auth/login', credentials).then((r) => r.data.data);
  },
  me: (signal?: AbortSignal) => http.get<Data<User>>('/api/auth/me', { signal }).then((r) => r.data.data),
  logout: async () => {
    await ensureCsrfCookie();
    await http.post('/api/auth/logout');
  },
};

export const adminApi = {
  products: (signal?: AbortSignal) =>
    http.get<AdminProducts>('/api/admin/products', { signal }).then((r) => r.data),

  setTopRated: async (id: number, isTopRated: boolean) => {
    await ensureCsrfCookie();
    return http
      .patch<Data<Product>>(`/api/admin/products/${id}/top-rated`, { isTopRated })
      .then((r) => r.data.data);
  },

  enquiries: (status: EnquiryStatus | 'all', page = 1, signal?: AbortSignal) =>
    http
      .get<Paginated<Enquiry>>('/api/admin/enquiries', {
        params: { page, ...(status === 'all' ? {} : { status }) },
        signal,
      })
      .then((r) => r.data),

  setEnquiryStatus: async (id: number, status: EnquiryStatus) => {
    await ensureCsrfCookie();
    return http.patch<Data<Enquiry>>(`/api/admin/enquiries/${id}`, { status }).then((r) => r.data.data);
  },
};
