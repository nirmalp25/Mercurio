import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { catalogueApi } from '@/shared/api/endpoints';
import type { Category } from '@/shared/api/types';
import { homeConfig } from '@/shared/config';
import { ElementRenderer } from '@/shared/ui/renderer/ElementRenderer';
import { EmptyState, ErrorState, Loading } from '@/shared/ui/Status';
import { CategoryModal } from './CategoryModal';
import { ProductGrid } from './ProductGrid';

export function HomePage() {
  const [selected, setSelected] = useState<Category | null>(null);

  const featured = useQuery({ queryKey: ['top-rated'], queryFn: ({ signal }) => catalogueApi.topRated(signal) });
  const categories = useQuery({ queryKey: ['categories'], queryFn: ({ signal }) => catalogueApi.categories(signal) });

  return (
    <div className="page">
      <section aria-labelledby="featured-heading" className="section">
        <h1 id="featured-heading" className="section__title">
          {homeConfig.featured.title}
        </h1>
        {featured.isPending && <Loading />}
        {featured.isError && <ErrorState error={featured.error} onRetry={() => featured.refetch()} />}
        {featured.data &&
          (featured.data.length === 0 ? (
            <EmptyState>No featured products yet.</EmptyState>
          ) : (
            <ProductGrid products={featured.data} cardType={homeConfig.featured.cardType} testId="featured-product" />
          ))}
      </section>

      <section aria-labelledby="categories-heading" className="section">
        <h2 id="categories-heading" className="section__title">
          {homeConfig.categories.title}
        </h2>
        {categories.isPending && <Loading />}
        {categories.isError && <ErrorState error={categories.error} onRetry={() => categories.refetch()} />}
        {categories.data && (
          <div className="grid grid--categories">
            {categories.data.map((category) => (
              <ElementRenderer
                key={category.slug}
                type={homeConfig.categories.cardType}
                category={category}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}
      </section>

      {selected && <CategoryModal category={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
