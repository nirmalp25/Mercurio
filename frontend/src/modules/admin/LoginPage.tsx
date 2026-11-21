import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/shared/api/endpoints';
import { loginForm } from '@/shared/config';
import { FormRenderer } from '@/shared/ui/renderer/FormRenderer';
import { ME_QUERY_KEY } from './useCurrentUser';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/queries';

  async function handleSubmit(values: { email: string; password: string }) {
    const user = await authApi.login(values);
    queryClient.setQueryData(ME_QUERY_KEY, user);
    navigate(from, { replace: true });
  }

  return (
    <section className="page page--narrow">
      <h1 className="page__title">{loginForm.title}</h1>
      <FormRenderer config={loginForm} onSubmit={handleSubmit} testId="login-form" />
    </section>
  );
}
