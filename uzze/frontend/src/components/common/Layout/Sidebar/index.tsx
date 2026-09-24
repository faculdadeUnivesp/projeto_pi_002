import { NavLink } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h1>UZZE</h1>
      </div>
      <nav className="sidebar__nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/vendas"
          className={({ isActive }) =>
            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
          }
        >
          Vendas
        </NavLink>
        <NavLink
          to="/estoque"
          className={({ isActive }) =>
            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
          }
        >
          Estoque
        </NavLink>
        <NavLink
          to="/fornecedores"
          className={({ isActive }) =>
            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
          }
        >
          Fornecedores
        </NavLink>
        <NavLink
          to="/usuarios"
          className={({ isActive }) =>
            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
          }
        >
          Usuários
        </NavLink>
      </nav>
    </aside>
  );
}
