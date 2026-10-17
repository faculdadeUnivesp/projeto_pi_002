import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import {
  IconDashboard,
  IconVendas,
  IconEstoque,
  IconFornecedores,
  IconRelatorios,
  IconUsuarios,
  IconSettings,
  IconLogout,
} from '../../Icons';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <strong>UZZE</strong>
        <span>Modas e acessórios</span>
      </div>

      <nav className="nav" aria-label="Menu principal">
        <NavLink to="/" end>
          <IconDashboard />
          Dashboard
        </NavLink>

        <NavLink to="/vendas">
          <IconVendas />
          Vendas
        </NavLink>

        <NavLink to="/estoque">
          <IconEstoque />
          Estoque
        </NavLink>

        <NavLink to="/fornecedores">
          <IconFornecedores />
          Fornecedores
        </NavLink>

        <NavLink to="/relatorios">
          <IconRelatorios />
          Relatórios
        </NavLink>

        {user?.tipo === 'admin' && (
          <NavLink to="/usuarios">
            <IconUsuarios />
            Usuários
          </NavLink>
        )}

        <NavLink to="/configuracoes">
          <IconSettings />
          Configurações
        </NavLink>
      </nav>

      <button className="logout" type="button" onClick={() => void handleLogout()}>
        <IconLogout />
        Sair
      </button>
    </aside>
  );
}
