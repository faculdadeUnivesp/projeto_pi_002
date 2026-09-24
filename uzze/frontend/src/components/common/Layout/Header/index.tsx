import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__title">
        <span>Gestão de Estoque</span>
      </div>
      <div className="header__user">
        <span className="header__username">{user?.nome}</span>
        <span className="header__role">{user?.tipo}</span>
        <button
          className="header__logout"
          onClick={handleLogout}
          type="button"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
