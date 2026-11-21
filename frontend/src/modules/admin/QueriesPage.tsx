import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '@/shared/api/endpoints';
import type { EnquiryStatus } from '@/shared/api/types';
import { EmptyState, ErrorState, Loading } from '@/shared/ui/Status';
import { formatDateTime } from '@/shared/utils/format';
import { countries } from '@/shared/config';

type Filter = EnquiryStatus | 'all';

function dialCode(countryCode: string): string {
  return countries.find((c) => c.code === countryCode)?.dial ?? countryCode;
}

/** Customer enquiries — the "sales inbox" when no email provider is configured. */
export function QueriesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['admin', 'enquiries', filter, page],
    queryFn: ({ signal }) => adminApi.enquiries(filter, page, signal),
    placeholderData: keepPreviousData,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => adminApi.setEnquiryStatus(id, 'read'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin', 'enquiries'] }),
  });

  return (
    <section>
      <h1 className="page__title">Customer queries</h1>
      <div className="toolbar" role="group" aria-label="Filter by status">
        {(['all', 'new', 'read'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`btn ${filter === f ? 'btn--primary' : 'btn--ghost'}`}
            aria-pressed={filter === f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {query.isPending && <Loading />}
      {query.isError && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {query.data &&
        (query.data.data.length === 0 ? (
          <EmptyState>No enquiries yet.</EmptyState>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Received</th>
                  <th scope="col">Product</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Query</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {query.data.data.map((e) => (
                  <tr key={e.id} data-testid="admin-enquiry-row" className={e.status === 'new' ? 'is-new' : undefined}>
                    <td>{formatDateTime(e.enquiredAt)}</td>
                    <td>{e.productTitle}</td>
                    <td>
                      {e.firstName} {e.lastName}
                    </td>
                    <td>
                      <a href={`mailto:${e.email}`}>{e.email}</a>
                      <br />
                      {dialCode(e.countryCode)} {e.phone}
                    </td>
                    <td className="table__query">{e.query}</td>
                    <td>
                      {e.status === 'new' ? (
                        <button
                          type="button"
                          className="btn btn--ghost"
                          disabled={markRead.isPending}
                          onClick={() => markRead.mutate(e.id)}
                        >
                          Mark read
                        </button>
                      ) : (
                        'Read'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {query.data.meta.last_page > 1 && (
              <div className="pager">
                <button type="button" className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <span>
                  Page {query.data.meta.current_page} of {query.data.meta.last_page}
                </span>
                <button
                  type="button"
                  className="btn"
                  disabled={page >= query.data.meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ))}
    </section>
  );
}
