import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatCpf } from '../../utils/formatters';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(cpf, senha);
      navigate('/');
    } catch (err: unknown) {
      const mensagem =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Erro ao fazer login. Tente novamente.';
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="logo">
          <strong>UZZE</strong>
          <span>Modas e acessórios</span>
        </div>
      </div>

      <div className="auth-panel">
        <h1>Login</h1>
        <p className="sub">Acesse sua conta para continuar</p>

        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            name="cpf"
            placeholder="CPF"
            inputMode="numeric"
            autoComplete="username"
            aria-label="CPF"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            maxLength={14}
            required
          />

          <div className="field-wrap">
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              name="senha"
              placeholder="Senha"
              autoComplete="current-password"
              aria-label="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              className="toggle"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.5 6.2A9 9 0 0121 12a13 13 0 01-3 3.8" />
                  <path d="M6.2 7.6A13 13 0 003 12s3.5 6 9 6a8 8 0 003-.6" />
                </svg>
              ) : (
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && <p className="alert alert--error">{error}</p>}

          <button
            className="btn btn-grad btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="divider" aria-hidden="true">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.7A4.5 4.5 0 0120 9c0 6-8 11-8 11z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
