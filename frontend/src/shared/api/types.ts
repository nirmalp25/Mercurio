// API contract types. These mirror the backend's JSON resources (camelCase).

export interface Category {
  slug: string;
  name: string;
  productCount: number;
  image: string | null;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: { name: string; slug: string };
  image: string | null;
  rating: { rate: number; count: number };
  isTopRated: boolean;
}

export interface CategoryProducts {
  category: { slug: string; name: string };
  topRated: Product[];
  products: Product[];
}

export interface Suggestion {
  id: number;
  title: string;
  category: string;
}

export interface EnquiryPayload {
  productId: number;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  query: string;
  website?: string; // honeypot, must stay empty
}

export interface EnquiryCreated {
  data: { id: number; enquiredAt: string };
  message?: string;
}

export type EnquiryStatus = 'new' | 'read';

export interface Enquiry {
  id: number;
  productId: number | null;
  productTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  query: string;
  status: EnquiryStatus;
  enquiredAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
}

export type Role = 'admin' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AdminProducts {
  data: Product[];
  meta: { maxTopRated: number; topRatedCount: number };
}
