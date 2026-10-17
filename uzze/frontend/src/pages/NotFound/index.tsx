import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="auth" style={{ maxWidth: 600 }}>
      <div className="auth-hero">
        <div className="logo">
          <strong>404</strong>
          <span>Página não encontrada</span>
        </div>
      </div>

      <div className="auth-panel" style={{ alignItems: 'center', textAlign: 'center' }}>
        <h1 className="sm">Ops!</h1>
        <p className="sub">A página que você procura não existe.</p>

        <Link className="btn btn-grad" to="/">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
