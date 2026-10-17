import { useAuth } from '../../../../hooks/useAuth';
import { assetUrl } from '../../../../utils/assets';

export function Header() {
  const { user } = useAuth();

  const fotoUrl = assetUrl(user?.foto);

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
        <div className="avatar">
          {fotoUrl ? (
            <img src={fotoUrl} alt={`Foto de ${user?.nome ?? 'usuário'}`} />
          ) : (
            iniciais
          )}
        </div>
        <div>
          <b>{user?.nome}</b>
          <small>{perfil}</small>
        </div>
      </div>
    </header>
  );
}
