import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Vendas } from '../pages/Vendas';
import { Relatorios } from '../pages/Relatorios';
import { NotFound } from '../pages/NotFound';
import { PrivateRoute } from './PrivateRoute';
import { Layout } from '../components/common/Layout';

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/vendas"
            element={<Vendas />}
          />

          <Route
            path="/relatorios"
            element={<Relatorios />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}