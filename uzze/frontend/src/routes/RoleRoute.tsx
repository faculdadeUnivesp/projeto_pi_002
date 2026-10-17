import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Usuario } from '../types/auth';

interface RoleRouteProps {
  roles: Array<Usuario['tipo']>;
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p className="empty">Carregando...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !roles.includes(user.tipo)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
