import { Link, Outlet } from 'react-router-dom';
import { ElementRenderer } from '@/shared/ui/renderer/ElementRenderer';

export function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="app-header">
        <Link to="/" className="brand">
          Mercurio
        </Link>
        <ElementRenderer type="search" />
        <nav aria-label="Main">
          <Link to="/admin/queries" className="nav-link">
            Admin
          </Link>
        </nav>
      </header>
      <main id="main" className="app-main">
        <Outlet />
      </main>
    </>
  );
}
