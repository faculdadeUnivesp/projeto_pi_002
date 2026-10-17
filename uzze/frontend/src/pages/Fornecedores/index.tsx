import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from '../../components/common/Icons';
import { formatCnpj, formatContato } from '../../utils/formatters';

interface Endereco {
  id?: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  complemento?: string | null;
}

interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  contato: string;
  status: 'ativo' | 'inativo';
  endereco?: Endereco;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
}

interface FornecedoresResponse {
  data: Fornecedor[];
  meta: Meta;
}

export function Fornecedores() {
  const navigate = useNavigate();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
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

  const carregarFornecedores = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const response = await api.get<FornecedoresResponse>('/fornecedores', {
        params: {
          page: pagina,
          limit: 10,
          busca: busca.trim() || undefined,
          status: statusFiltro || undefined,
        },
      });

      setFornecedores(response.data.data ?? []);
      setMeta(response.data.meta);
    } catch (error) {
      console.error(error);
      setErro('Não foi possível carregar os fornecedores.');
    } finally {
      setCarregando(false);
    }
  }, [pagina, busca, statusFiltro]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      carregarFornecedores();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [carregarFornecedores]);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro]);

  const alterarStatus = async (fornecedor: Fornecedor) => {
    try {
      if (fornecedor.status === 'ativo') {
        const confirmar = window.confirm(
          `Deseja inativar o fornecedor "${fornecedor.nome}"?`,
        );

        if (!confirmar) return;

        await api.delete(`/fornecedores/${fornecedor.id}`);
      } else {
        await api.patch(`/fornecedores/${fornecedor.id}/ativar`);
      }

      await carregarFornecedores();
    } catch (error) {
      console.error(error);
      window.alert('Não foi possível alterar o status do fornecedor.');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Fornecedores</h1>
        </div>

        <button
          className="btn"
          type="button"
          onClick={() => navigate('/fornecedores/cadastrar')}
        >
          <IconPlus />
          Novo Fornecedor
        </button>
      </div>

      <div className="list-filters">
        <label className="search">
          <IconSearch />
          <input
            className="input"
            type="search"
            placeholder="Buscar fornecedor"
            aria-label="Buscar fornecedor"
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
            onClick={carregarFornecedores}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="card table-card">
        {carregando ? (
          <p className="empty">Carregando fornecedores...</p>
        ) : (
          <>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CNPJ</th>
                    <th>E-mail</th>
                    <th>Contato</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {fornecedores.length > 0 ? (
                    fornecedores.map((fornecedor) => (
                      <tr key={fornecedor.id}>
                        <td className="strong">{fornecedor.nome}</td>
                        <td>{formatCnpj(fornecedor.cnpj)}</td>
                        <td>
                          <a href={`mailto:${fornecedor.email}`}>
                            {fornecedor.email}
                          </a>
                        </td>
                        <td>{formatContato(fornecedor.contato)}</td>

                        <td>
                          <span
                            className={`status${
                              fornecedor.status === 'inativo' ? ' off' : ''
                            }`}
                          >
                            {fornecedor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>

                        <td>
                          <span className="actions">
                            <button
                              type="button"
                              className="btn btn-icon"
                              aria-label="Editar"
                              onClick={() =>
                                navigate(`/fornecedores/${fornecedor.id}/editar`)
                              }
                            >
                              <IconEdit />
                            </button>

                            <button
                              type="button"
                              className={`btn btn-icon ${
                                fornecedor.status === 'ativo'
                                  ? 'danger'
                                  : 'success'
                              }`}
                              aria-label={
                                fornecedor.status === 'ativo'
                                  ? 'Inativar'
                                  : 'Ativar'
                              }
                              onClick={() => alterarStatus(fornecedor)}
                            >
                              {fornecedor.status === 'ativo' ? (
                                <IconTrash />
                              ) : (
                                <IconCheck />
                              )}
                            </button>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="empty">
                        Nenhum fornecedor encontrado.
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
                fornecedores
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
