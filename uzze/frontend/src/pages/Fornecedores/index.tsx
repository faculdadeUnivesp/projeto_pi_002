import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import './Fornecedores.css';

interface Endereco {
  id?: string;
  cep: string;
  rua: string;
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

interface ApiResponse<T> {
  data: T;
}

const ITENS_POR_PAGINA = 7;

export function Fornecedores() {
  const navigate = useNavigate();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarFornecedores = async () => {
    try {
      setCarregando(true);
      setErro('');

      const response = await api.get<ApiResponse<Fornecedor[]>>('/fornecedores');

      setFornecedores(response.data.data ?? []);
    } catch (error) {
      console.error(error);
      setErro('Não foi possível carregar os fornecedores.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return fornecedores;

    const somenteNumeros = termo.replace(/\D/g, '');

    return fornecedores.filter((fornecedor) => {
      const cnpjNumeros = fornecedor.cnpj.replace(/\D/g, '');
      const contatoNumeros = fornecedor.contato.replace(/\D/g, '');

      return (
        fornecedor.nome.toLowerCase().includes(termo) ||
        fornecedor.email.toLowerCase().includes(termo) ||
        cnpjNumeros.includes(somenteNumeros) ||
        contatoNumeros.includes(somenteNumeros)
      );
    });
  }, [fornecedores, busca]);

  const totalPaginas = Math.max(1, Math.ceil(fornecedoresFiltrados.length / ITENS_POR_PAGINA));
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const fornecedoresPagina = fornecedoresFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  const formatarCnpj = (cnpj: string) => {
    const valor = cnpj.replace(/\D/g, '');

    if (valor.length !== 14) return cnpj;

    return valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatarContato = (contato: string) => {
    const valor = contato.replace(/\D/g, '');

    if (valor.length === 11) {
      return valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }

    if (valor.length === 10) {
      return valor.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }

    return contato;
  };

  const alterarStatus = async (fornecedor: Fornecedor) => {
    try {
      if (fornecedor.status === 'ativo') {
        const confirmar = window.confirm(`Deseja inativar o fornecedor "${fornecedor.nome}"?`);

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

  const paginaAnterior = () => {
    setPaginaAtual((pagina) => Math.max(1, pagina - 1));
  };

  const proximaPagina = () => {
    setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1));
  };

  return (
    <section className="fornecedores">
      <div className="fornecedores__topo">
        <h1>Fornecedores</h1>

        <button type="button" className="fornecedores__novo" onClick={() => navigate('/fornecedores/cadastrar')}>
          <span>+</span>
          Novo Fornecedor
        </button>
      </div>

      <div className="fornecedores__busca">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>

        <input type="text" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar fornecedor" />
      </div>

      <div className="fornecedores__card">
        {carregando ? (
          <div className="fornecedores__estado">Carregando fornecedores...</div>
        ) : erro ? (
          <div className="fornecedores__estado fornecedores__estado--erro">
            <p>{erro}</p>
            <button type="button" onClick={carregarFornecedores}>Tentar novamente</button>
          </div>
        ) : (
          <>
            <div className="fornecedores__tabela-wrapper">
              <table className="fornecedores__tabela">
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
                  {fornecedoresPagina.length > 0 ? (
                    fornecedoresPagina.map((fornecedor) => (
                      <tr key={fornecedor.id}>
                        <td className="fornecedores__nome">{fornecedor.nome}</td>
                        <td>{formatarCnpj(fornecedor.cnpj)}</td>
                        <td><span className="fornecedores__email">{fornecedor.email}</span></td>
                        <td>{formatarContato(fornecedor.contato)}</td>

                        <td>
                          <span className={`fornecedores__status fornecedores__status--${fornecedor.status}`}>
                            <span />
                            {fornecedor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>

                        <td>
                          <div className="fornecedores__acoes">
                            <button type="button" className="fornecedores__acao fornecedores__acao--editar" title="Editar" onClick={() => navigate(`/fornecedores/${fornecedor.id}/editar`)}>
                              <svg viewBox="0 0 24 24" fill="none">
                                <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              className={`fornecedores__acao ${fornecedor.status === 'ativo' ? 'fornecedores__acao--excluir' : 'fornecedores__acao--ativar'}`}
                              title={fornecedor.status === 'ativo' ? 'Inativar' : 'Ativar'}
                              onClick={() => alterarStatus(fornecedor)}
                            >
                              {fornecedor.status === 'ativo' ? (
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <span className="fornecedores__ativar-icon">✓</span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="fornecedores__vazio">Nenhum fornecedor encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="fornecedores__rodape">
              <span>
                Mostrando {fornecedoresFiltrados.length === 0 ? 0 : inicio + 1}-
                {Math.min(inicio + ITENS_POR_PAGINA, fornecedoresFiltrados.length)} de {fornecedoresFiltrados.length} fornecedores
              </span>

              <div className="fornecedores__paginacao">
                <button type="button" onClick={paginaAnterior} disabled={paginaAtual === 1}>‹</button>
                <span>{paginaAtual}</span>
                <button type="button" onClick={proximaPagina} disabled={paginaAtual === totalPaginas}>›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}