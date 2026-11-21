import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { catalogueApi } from '@/shared/api/endpoints';
import { ProductGrid } from '@/modules/catalogue/ProductGrid';
import { EmptyState, ErrorState, Loading } from '@/shared/ui/Status';

export function SearchResultsPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();

  const query = useQuery({
    queryKey: ['search', q],
    queryFn: ({ signal }) => catalogueApi.search(q, signal),
    enabled: q.length > 0,
  });

  if (!q) return <EmptyState>Type something in the search bar and press Search.</EmptyState>;

  return (
    <section className="page">
      <h1 className="page__title">
        Results for “{q}”
        {query.data && <span className="page__subtitle"> · {query.data.length} found</span>}
      </h1>
      {query.isPending && <Loading />}
      {query.isError && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {query.data &&
        (query.data.length === 0 ? (
          <EmptyState>No products match “{q}”.</EmptyState>
        ) : (
          <ProductGrid products={query.data} testId="search-result" />
        ))}
    </section>
  );
}
