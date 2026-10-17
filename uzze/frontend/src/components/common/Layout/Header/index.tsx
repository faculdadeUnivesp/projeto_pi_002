import { useAuth } from '../../../../hooks/useAuth';

export function Header() {
  const { user } = useAuth();

  const iniciais =
    user?.nome
      ?.split(' ')
      .filter((parte) => parte.length > 0)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  const perfil = user?.tipo === 'admin' ? 'Administrador' : 'Vendedor';

  return (
    <header className="topbar">
      <div className="user">
        <div className="avatar">{iniciais}</div>
        <div>
          <b>{user?.nome}</b>
          <small>{perfil}</small>
        </div>
      </div>
    </header>
  );
}
