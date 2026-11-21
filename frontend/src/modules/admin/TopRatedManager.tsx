import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '@/shared/api/endpoints';
import { isApiError } from '@/shared/api/ApiError';
import { ErrorState, Loading } from '@/shared/ui/Status';
import { formatPrice } from '@/shared/utils/format';

/** Admin chooses which products are featured as "top rated" (capped by the backend). */
export function TopRatedManager() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['admin', 'products'], queryFn: ({ signal }) => adminApi.products(signal) });

  const mutation = useMutation({
    mutationFn: ({ id, isTopRated }: { id: number; isTopRated: boolean }) => adminApi.setTopRated(id, isTopRated),
    onMutate: () => setMessage(null),
    onError: (error) => setMessage(isApiError(error) ? error.message : 'Could not update the product.'),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      // Public views depend on top-rated flags.
      queryClient.invalidateQueries({ queryKey: ['top-rated'] });
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
  });

  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const { data: products, meta } = query.data;

  return (
    <section>
      <h1 className="page__title">Top rated products</h1>
      <p data-testid="top-rated-count">
        Featured {meta.topRatedCount} of {meta.maxTopRated} allowed.
      </p>
      {message && (
        <p className="form__error" role="alert">
          {message}
        </p>
      )}
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Category</th>
            <th scope="col">Price</th>
            <th scope="col">Rating</th>
            <th scope="col">Featured</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} data-testid="admin-product-row">
              <td>{p.title}</td>
              <td>{p.category.name}</td>
              <td>{formatPrice(p.price)}</td>
              <td>★ {p.rating.rate.toFixed(1)}</td>
              <td>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={p.isTopRated}
                    disabled={mutation.isPending}
                    aria-label={`Feature ${p.title}`}
                    onChange={(e) => mutation.mutate({ id: p.id, isTopRated: e.target.checked })}
                  />
                  <span>{p.isTopRated ? 'Yes' : 'No'}</span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
