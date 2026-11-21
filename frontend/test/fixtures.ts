import type { Product } from '@/shared/api/types';

export function makeProduct(overrides: Partial<Product> = {}): Product {
  const id = overrides.id ?? Math.floor(Math.random() * 100_000);
  return {
    id,
    title: `Product ${id}`,
    price: 19.99,
    description: 'A product',
    category: { name: 'electronics', slug: 'electronics' },
    image: null,
    rating: { rate: 4.2, count: 10 },
    isTopRated: false,
    ...overrides,
  };
}
