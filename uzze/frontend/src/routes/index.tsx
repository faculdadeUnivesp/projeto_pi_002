import { Routes, Route } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Vendas } from '../pages/Vendas';
import { Relatorios } from '../pages/Relatorios';
import { NotFound } from '../pages/NotFound';
import { PrivateRoute } from './PrivateRoute';
import { RoleRoute } from './RoleRoute';
import { Layout } from '../components/common/Layout';

import { Fornecedores } from '../pages/Fornecedores';
import { CadastroFornecedores } from '../pages/CadastroFornecedores';

import { Clientes } from '../pages/Clientes';
import { CadastroCliente } from '../pages/CadastroCliente';

import { Estoque } from '../pages/Estoque';
import { CadastroEstoque } from '../pages/CadastroEstoque';

import { Usuarios } from '../pages/Usuarios';
import { CadastroUsuario } from '../pages/CadastroUsuario';
import { Configuracoes } from '../pages/Configuracoes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/vendas" element={<Vendas />} />
          <Route path="/relatorios" element={<Relatorios />} />

          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route
            path="/fornecedores/cadastrar"
            element={<CadastroFornecedores />}
          />
          <Route
            path="/fornecedores/:id/editar"
            element={<CadastroFornecedores />}
          />

          <Route path="/clientes" element={<Clientes />} />
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/clientes/cadastrar" element={<CadastroCliente />} />
            <Route path="/clientes/:id/editar" element={<CadastroCliente />} />
          </Route>

          <Route path="/estoque" element={<Estoque />} />
          <Route path="/estoque/cadastrar" element={<CadastroEstoque />} />
          <Route path="/estoque/:id/editar" element={<CadastroEstoque />} />

          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/usuarios/cadastrar" element={<CadastroUsuario />} />
            <Route path="/usuarios/:id/editar" element={<CadastroUsuario />} />
          </Route>

          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
