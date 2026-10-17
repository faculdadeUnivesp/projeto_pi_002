import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import api from '../../services/api';
import {
  IconPlus,
  IconEdit,
  IconTrash,
} from '../../components/common/Icons';

interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  tipo: 'vendedor' | 'admin';
  status: 'ativo' | 'inativo';
  ultimo_acesso: string | null;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
}

interface UsuariosResponse {
  data: Usuario[];
  meta: Meta;
}

export function Usuarios() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0 });

  const [pagina, setPagina] = useState(1);
  const [perfil, setPerfil] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarUsuarios = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const response = await api.get<UsuariosResponse>('/usuarios', {
        params: {
          page: pagina,
          limit: 10,
          perfil: perfil || undefined,
          status: statusFiltro || undefined,
        },
      });

      setUsuarios(response.data.data ?? []);
      setMeta(response.data.meta);
    } catch (error: unknown) {
      console.error(error);

      const status = (error as { response?: { status?: number } }).response
        ?.status;

      if (status === 403) {
        setErro('Apenas administradores podem gerenciar usuários.');
      } else {
        setErro('Não foi possível carregar os usuários.');
      }
    } finally {
      setCarregando(false);
    }
  }, [pagina, perfil, statusFiltro]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  useEffect(() => {
    setPagina(1);
  }, [perfil, statusFiltro]);

  const inativarUsuario = async (usuario: Usuario) => {
    const confirmar = window.confirm(
      `Deseja inativar o usuário "${usuario.nome}"?`,
    );

    if (!confirmar) return;

    try {
      await api.delete(`/usuarios/${usuario.id}`);
      await carregarUsuarios();
    } catch (error) {
      console.error(error);
      window.alert('Não foi possível inativar o usuário.');
    }
  };

  const formatarUltimoAcesso = (valor: string | null) => {
    if (!valor) return '—';

    return new Date(valor).toLocaleString('pt-BR');
  };

  if (user?.tipo !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Controle de Usuários</h1>
        </div>

        <button
          className="btn"
          type="button"
          onClick={() => navigate('/usuarios/cadastrar')}
        >
          <IconPlus />
          Novo Usuário
        </button>
      </div>

      <div className="list-filters">
        <select
          className="select"
          value={perfil}
          onChange={(event) => setPerfil(event.target.value)}
          aria-label="Filtrar por perfil"
        >
          <option value="">Todos os perfis</option>
          <option value="admin">Administrador</option>
          <option value="vendedor">Vendedor</option>
        </select>

        <select
          className="select"
          value={statusFiltro}
          onChange={(event) => setStatusFiltro(event.target.value)}
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      {erro && (
        <div className="alert alert--error">
          {erro}{' '}
          <button
            className="btn btn-outline"
            type="button"
            onClick={carregarUsuarios}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="card table-card">
        {carregando ? (
          <p className="empty">Carregando usuários...</p>
        ) : (
          <>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>CPF</th>
                    <th>Perfil</th>
                    <th>Último acesso</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.length > 0 ? (
                    usuarios.map((usuario) => (
                      <tr key={usuario.id}>
                        <td className="strong">{usuario.nome}</td>
                        <td>{usuario.email}</td>
                        <td>{usuario.cpf}</td>
                        <td>
                          {usuario.tipo === 'admin'
                            ? 'Administrador'
                            : 'Vendedor'}
                        </td>
                        <td>{formatarUltimoAcesso(usuario.ultimo_acesso)}</td>
                        <td>
                          <span
                            className={`status${
                              usuario.status === 'inativo' ? ' off' : ''
                            }`}
                          >
                            {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <span className="actions">
                            <button
                              type="button"
                              className="btn btn-icon"
                              aria-label="Editar"
                              onClick={() =>
                                navigate(`/usuarios/${usuario.id}/editar`)
                              }
                            >
                              <IconEdit />
                            </button>

                            {usuario.id !== user.id && (
                              <button
                                type="button"
                                className="btn btn-icon danger"
                                aria-label="Inativar"
                                onClick={() => inativarUsuario(usuario)}
                              >
                                <IconTrash />
                              </button>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="empty">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-foot">
              <span>
                Mostrando {meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1}-
                {Math.min(meta.page * meta.limit, meta.total)} de {meta.total}{' '}
                usuários
              </span>

              <div className="pager">
                <button
                  type="button"
                  disabled={pagina <= 1}
                  onClick={() => setPagina(pagina - 1)}
                >
                  ‹
                </button>
                <span className="cur">{meta.page}</span>
                <button
                  type="button"
                  disabled={meta.page * meta.limit >= meta.total}
                  onClick={() => setPagina(pagina + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
