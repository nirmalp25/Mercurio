import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/modules/catalogue/HomePage';
import { ProductDetailPage } from '@/modules/catalogue/ProductDetailPage';
import { SearchResultsPage } from '@/modules/search/SearchResultsPage';
import { EmptyState, Loading } from '@/shared/ui/Status';
import { Layout } from './Layout';

// The admin area is only for staff, so it ships as a separate chunk.
const AdminLayout = lazy(() => import('@/modules/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const LoginPage = lazy(() => import('@/modules/admin/LoginPage').then((m) => ({ default: m.LoginPage })));
const QueriesPage = lazy(() => import('@/modules/admin/QueriesPage').then((m) => ({ default: m.QueriesPage })));
const RequireAdmin = lazy(() => import('@/modules/admin/RequireAdmin').then((m) => ({ default: m.RequireAdmin })));
const TopRatedManager = lazy(() =>
  import('@/modules/admin/TopRatedManager').then((m) => ({ default: m.TopRatedManager })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="admin/login" element={<LoginPage />} />
          <Route path="admin" element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="queries" replace />} />
              <Route path="queries" element={<QueriesPage />} />
              <Route path="products" element={<TopRatedManager />} />
            </Route>
          </Route>
          <Route path="*" element={<EmptyState>Page not found.</EmptyState>} />
        </Route>
      </Routes>
    </Suspense>
  );
}
