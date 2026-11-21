import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorState, Loading } from '@/shared/ui/Status';
import { useCurrentUser } from './useCurrentUser';

/** Route guard for /admin/*. UI convenience only — the API enforces the role on every request. */
export function RequireAdmin() {
  const location = useLocation();
  const me = useCurrentUser();

  if (me.isPending) return <Loading label="Checking your session…" />;
  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />;
  if (!me.data) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (me.data.role !== 'admin') {
    return (
      <p className="status status--error" role="alert">
        You do not have access to this area.
      </p>
    );
  }
  return <Outlet />;
}
