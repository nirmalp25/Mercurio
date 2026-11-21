import { isApiError } from '@/shared/api/ApiError';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <p className="status status--loading" role="status">
      {label}
    </p>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = isApiError(error) ? error.message : 'Something went wrong.';
  return (
    <div className="status status--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="status status--empty">{children}</p>;
}
