import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { useAuth } from '../../hooks/useAuth';
import * as authService from '../../services/auth.service';
import { IconCheck } from '../../components/common/Icons';

export function Configuracoes() {
  const { user, refreshUser } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState('');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroPerfil, setErroPerfil] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [msgPerfil, setMsgPerfil] = useState('');
  const [msgSenha, setMsgSenha] = useState('');

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setFoto(user.foto ?? '');
    }
  }, [user]);

  if (!user) {
    return <p className="empty">Carregando...</p>;
  }

  const validarPerfil = () => {
    if (!nome.trim()) return 'Informe seu nome.';
    if (!email.trim()) return 'Informe seu e-mail.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'E-mail inválido.';
    if (foto && !/^https?:\/\//.test(foto)) {
      return 'A foto deve ser uma URL começando com http:// ou https://';
    }
    return '';
  };

  const salvarPerfil = async (e: FormEvent) => {
    e.preventDefault();
    setErroPerfil('');
    setMsgPerfil('');

    const erro = validarPerfil();
    if (erro) {
      setErroPerfil(erro);
      return;
    }

    try {
      setSalvandoPerfil(true);

      const atualizado = await authService.updateMe({
        nome: nome.trim(),
        email: email.trim(),
        foto: foto.trim() || undefined,
      });

      setFoto(atualizado.foto ?? '');
      setMsgPerfil('Perfil atualizado com sucesso.');
      await refreshUser();
    } catch (error: unknown) {
      const mensagem = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setErroPerfil(
        Array.isArray(mensagem)
          ? mensagem.join(' ')
          : mensagem || 'Não foi possível atualizar o perfil.',
      );
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const validarSenha = () => {
    if (!senhaAtual) return 'Informe sua senha atual.';
    if (!novaSenha) return 'Informe a nova senha.';
    if (novaSenha.length < 6)
      return 'A nova senha deve ter no mínimo 6 caracteres.';
    if (novaSenha === senhaAtual)
      return 'A nova senha deve ser diferente da atual.';
    if (novaSenha !== confirmacao)
      return 'A confirmação não confere com a nova senha.';
    return '';
  };

  const salvarSenha = async (e: FormEvent) => {
    e.preventDefault();
    setErroSenha('');
    setMsgSenha('');

    const erro = validarSenha();
    if (erro) {
      setErroSenha(erro);
      return;
    }

    try {
      setSalvandoSenha(true);
      await authService.alterarSenha(senhaAtual, novaSenha);
      setMsgSenha(
        'Senha alterada com sucesso. Você precisará fazer login novamente.',
      );
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacao('');
    } catch (error: unknown) {
      const mensagem = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setErroSenha(
        Array.isArray(mensagem)
          ? mensagem.join(' ')
          : mensagem || 'Não foi possível alterar a senha.',
      );
    } finally {
      setSalvandoSenha(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Configurações</h1>
          <p>Edite seus dados de perfil e senha.</p>
        </div>
      </div>

      <section className="card form-card" style={{ marginBottom: 24 }}>
        <h2 className="lg">Meu Perfil</h2>

        {msgPerfil && <div className="alert alert--success">{msgPerfil}</div>}
        {erroPerfil && <div className="alert alert--error">{erroPerfil}</div>}

        <form id="form-perfil" onSubmit={salvarPerfil}>
          <div className="grid c2">
            <div className="field">
              <label htmlFor="nome">Nome</label>
              <input
                className="input"
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                className="input"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="foto">URL da foto (opcional)</label>
            <input
              className="input"
              id="foto"
              type="url"
              placeholder="https://exemplo.com/foto.jpg"
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
            />
            {foto && (
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <img
                  src={foto}
                  alt="Pré-visualização"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid var(--line)',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      'none';
                  }}
                />
                <small className="muted">Pré-visualização</small>
              </div>
            )}
          </div>
        </form>

        <div className="page-head" style={{ marginTop: 16 }}>
          <button
            className="btn"
            type="submit"
            form="form-perfil"
            disabled={salvandoPerfil}
          >
            <IconCheck />
            {salvandoPerfil ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </section>

      <section className="card form-card">
        <h2 className="lg">Alterar Senha</h2>

        {msgSenha && <div className="alert alert--success">{msgSenha}</div>}
        {erroSenha && <div className="alert alert--error">{erroSenha}</div>}

        <form id="form-senha" onSubmit={salvarSenha}>
          <div className="grid c1">
            <div className="field">
              <label htmlFor="senhaAtual">Senha atual</label>
              <input
                className="input"
                id="senhaAtual"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="field">
              <label htmlFor="novaSenha">Nova senha</label>
              <input
                className="input"
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label htmlFor="confirmacao">Confirmação da nova senha</label>
              <input
                className="input"
                id="confirmacao"
                type="password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
        </form>

        <div className="page-head" style={{ marginTop: 16 }}>
          <button
            className="btn"
            type="submit"
            form="form-senha"
            disabled={salvandoSenha}
          >
            <IconCheck />
            {salvandoSenha ? 'Salvando...' : 'Alterar senha'}
          </button>
        </div>
      </section>
    </>
  );
}
