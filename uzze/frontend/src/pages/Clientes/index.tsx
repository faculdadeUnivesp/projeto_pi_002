import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from '../../components/common/Icons';
import { formatCpfCnpj, formatContato } from '../../utils/formatters';

interface Cliente {
  id: string;
  nome: string;
  cpf_cnpj: string;
  email: string | null;
  telefone: string | null;
  status: 'ativo' | 'inativo';
}

interface Meta {
  page: number;
  limit: number;
  total: number;
}

interface ClientesResponse {
  data: Cliente[];
  meta: Meta;
}

export function Clientes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ehAdmin = user?.tipo === 'admin';

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarClientes = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const response = await api.get<ClientesResponse>('/clientes', {
        params: {
          page: pagina,
          limit: 10,
          busca: busca.trim() || undefined,
          status: statusFiltro || undefined,
        },
      });

      setClientes(response.data.data ?? []);
      setMeta(response.data.meta);
    } catch (error) {
      console.error(error);
      setErro('Não foi possível carregar os clientes.');
    } finally {
      setCarregando(false);
    }
  }, [pagina, busca, statusFiltro]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      carregarClientes();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [carregarClientes]);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro]);

  const alterarStatus = async (cliente: Cliente) => {
    try {
      if (cliente.status === 'ativo') {
        const confirmar = window.confirm(
          `Deseja inativar o cliente "${cliente.nome}"?`,
        );

        if (!confirmar) return;

        await api.delete(`/clientes/${cliente.id}`);
      } else {
        await api.patch(`/clientes/${cliente.id}/ativar`);
      }

      await carregarClientes();
    } catch (error) {
      console.error(error);
      window.alert('Não foi possível alterar o status do cliente.');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Clientes</h1>
        </div>

        {ehAdmin && (
          <button
            className="btn"
            type="button"
            onClick={() => navigate('/clientes/cadastrar')}
          >
            <IconPlus />
            Novo Cliente
          </button>
        )}
      </div>

      <div className="list-filters">
        <label className="search">
          <IconSearch />
          <input
            className="input"
            type="search"
            placeholder="Buscar cliente"
            aria-label="Buscar cliente"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </label>

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
            onClick={carregarClientes}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="card table-card">
        {carregando ? (
          <p className="empty">Carregando clientes...</p>
        ) : (
          <>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF/CNPJ</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    {ehAdmin && <th>Ações</th>}
                  </tr>
                </thead>

                <tbody>
                  {clientes.length > 0 ? (
                    clientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td className="strong">{cliente.nome}</td>
                        <td>{formatCpfCnpj(cliente.cpf_cnpj)}</td>
                        <td>
                          {cliente.email ? (
                            <a href={`mailto:${cliente.email}`}>
                              {cliente.email}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {cliente.telefone
                            ? formatContato(cliente.telefone)
                            : '—'}
                        </td>

                        <td>
                          <span
                            className={`status${
                              cliente.status === 'inativo' ? ' off' : ''
                            }`}
                          >
                            {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>

                        {ehAdmin && (
                          <td>
                            <span className="actions">
                              <button
                                type="button"
                                className="btn btn-icon"
                                aria-label="Editar"
                                onClick={() =>
                                  navigate(`/clientes/${cliente.id}/editar`)
                                }
                              >
                                <IconEdit />
                              </button>

                              <button
                                type="button"
                                className={`btn btn-icon ${
                                  cliente.status === 'ativo'
                                    ? 'danger'
                                    : 'success'
                                }`}
                                aria-label={
                                  cliente.status === 'ativo'
                                    ? 'Inativar'
                                    : 'Ativar'
                                }
                                onClick={() => alterarStatus(cliente)}
                              >
                                {cliente.status === 'ativo' ? (
                                  <IconTrash />
                                ) : (
                                  <IconCheck />
                                )}
                              </button>
                            </span>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={ehAdmin ? 6 : 5} className="empty">
                        Nenhum cliente encontrado.
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
                clientes
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
