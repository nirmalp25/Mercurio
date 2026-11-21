import { useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '@/shared/api/endpoints';
import { ME_QUERY_KEY } from './useCurrentUser';

export function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function logout() {
    await authApi.logout().catch(() => undefined);
    queryClient.setQueryData(ME_QUERY_KEY, null);
    navigate('/admin/login');
  }

  return (
    <div className="page">
      <nav className="admin-nav" aria-label="Admin">
        <NavLink to="/admin/queries">Queries</NavLink>
        <NavLink to="/admin/products">Top rated</NavLink>
        <button type="button" className="btn btn--ghost" onClick={logout}>
          Sign out
        </button>
      </nav>
      <Outlet />
    </div>
  );
}
