import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { catalogueApi } from '@/shared/api/endpoints';
import type { Category } from '@/shared/api/types';
import { homeConfig } from '@/shared/config';
import { Modal } from '@/shared/ui/Modal';
import { EmptyState, ErrorState, Loading } from '@/shared/ui/Status';
import { ProductGrid } from './ProductGrid';

interface CategoryModalProps {
  category: Pick<Category, 'slug' | 'name'>;
  onClose: () => void;
  previewCount?: number;
}

/**
 * Near-fullscreen category view. Section 1: the category's top rated products (with
 * "Show more" when long). Section 2: every product in the category, top rated ones badged.
 */
export function CategoryModal({
  category,
  onClose,
  previewCount = homeConfig.categoryModal.topRatedPreviewCount,
}: CategoryModalProps) {
  const [showAll, setShowAll] = useState(false);
  const query = useQuery({
    queryKey: ['category', category.slug],
    queryFn: ({ signal }) => catalogueApi.categoryProducts(category.slug, signal),
  });

  const topRated = query.data?.topRated ?? [];
  const visibleTopRated = showAll ? topRated : topRated.slice(0, previewCount);

  return (
    <Modal title={category.name} onClose={onClose} size="full" testId="category-modal">
      {query.isPending && <Loading />}
      {query.isError && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {query.data && (
        <>
          <section aria-labelledby="cat-top-rated" className="section" data-testid="category-top-rated">
            <h3 id="cat-top-rated" className="section__title">
              Top rated
            </h3>
            {topRated.length === 0 ? (
              <EmptyState>No top rated products in this category yet.</EmptyState>
            ) : (
              <ProductGrid products={visibleTopRated} testId="category-top-rated-product" />
            )}
            {topRated.length > previewCount && (
              <button
                type="button"
                className="btn btn--ghost show-more"
                aria-expanded={showAll}
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? 'Show less ▴' : `Show more (${topRated.length - previewCount}) ▾`}
              </button>
            )}
          </section>

          <section aria-labelledby="cat-all" className="section" data-testid="category-all">
            <h3 id="cat-all" className="section__title">
              All products in {query.data.category.name}
            </h3>
            <ProductGrid products={query.data.products} showBadge testId="category-product" />
          </section>
        </>
      )}
    </Modal>
  );
}
