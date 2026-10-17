import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
} from '../../components/common/Icons';
import { formatCurrency } from '../../utils/formatters';
import { assetUrl } from '../../utils/assets';

interface Fornecedor {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  material: string;
  tamanho: string;
  valor: number | string;
  genero: 'feminino' | 'masculino' | 'unissex';
  modelo: string;
  quantidade: number;
  imagem: string | null;
  descricao?: string | null;
  status: 'ativo' | 'inativo';
  fornecedor_id: string;
  fornecedor?: Fornecedor;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProdutosResponse {
  data: Produto[];
  meta: Meta;
}

interface OpcoesProduto {
  categorias: string[];
  tamanhos: string[];
}

export function Estoque() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [opcoes, setOpcoes] = useState<OpcoesProduto>({
    categorias: [],
    tamanhos: [],
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarProdutos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const response = await api.get<ProdutosResponse>('/produtos', {
        params: {
          page: pagina,
          limit: 10,
          busca: busca.trim() || undefined,
          categoria: categoria || undefined,
          tamanho: tamanho || undefined,
          status: 'ativo',
        },
      });

      setProdutos(response.data.data ?? []);
      setMeta(response.data.meta);
    } catch (error) {
      console.error(error);
      setErro('Não foi possível carregar o estoque.');
    } finally {
      setCarregando(false);
    }
  }, [pagina, busca, categoria, tamanho]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      carregarProdutos();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [carregarProdutos]);

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const response = await api.get<{ data: OpcoesProduto }>(
          '/produtos/opcoes',
        );
        setOpcoes(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    carregarOpcoes();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, categoria, tamanho]);

  const formatarValor = formatCurrency;

  const urlImagem = (produto: Produto) => assetUrl(produto.imagem);

  const inativarProduto = async (produto: Produto) => {
    const confirmar = window.confirm(
      `Deseja inativar o produto "${produto.nome}"?`,
    );

    if (!confirmar) return;

    try {
      await api.delete(`/produtos/${produto.id}`);
      await carregarProdutos();
    } catch (error) {
      console.error(error);
      window.alert('Não foi possível inativar o produto.');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Estoque</h1>
        </div>

        <button
          className="btn"
          type="button"
          onClick={() => navigate('/estoque/cadastrar')}
        >
          <IconPlus />
          Novo Produto
        </button>
      </div>

      <div className="list-filters">
        <label className="search">
          <IconSearch />
          <input
            className="input"
            type="search"
            placeholder="Buscar produto"
            aria-label="Buscar produto"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </label>

        <input
          className="input"
          list={opcoes.categorias.length > 0 ? 'dl-estoque-categoria' : undefined}
          type="text"
          placeholder="Categoria"
          aria-label="Filtrar por categoria"
          value={categoria}
          onChange={(event) => setCategoria(event.target.value)}
        />
        {opcoes.categorias.length > 0 && (
          <datalist id="dl-estoque-categoria">
            {opcoes.categorias.map((opcao) => (
              <option key={opcao} value={opcao} />
            ))}
          </datalist>
        )}

        <input
          className="input"
          list={opcoes.tamanhos.length > 0 ? 'dl-estoque-tamanho' : undefined}
          type="text"
          placeholder="Tamanho"
          aria-label="Filtrar por tamanho"
          value={tamanho}
          onChange={(event) => setTamanho(event.target.value)}
        />
        {opcoes.tamanhos.length > 0 && (
          <datalist id="dl-estoque-tamanho">
            {opcoes.tamanhos.map((opcao) => (
              <option key={opcao} value={opcao} />
            ))}
          </datalist>
        )}
      </div>

      {erro && (
        <div className="alert alert--error">
          {erro}{' '}
          <button className="btn btn-outline" type="button" onClick={carregarProdutos}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="card table-card">
        {carregando ? (
          <p className="empty">Carregando produtos...</p>
        ) : (
          <>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Material</th>
                    <th>Valor</th>
                    <th>Quantidade</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {produtos.length > 0 ? (
                    produtos.map((produto) => {
                      const imagem = urlImagem(produto);

                      return (
                        <tr key={produto.id}>
                          <td>
                            <span className="prod">
                              {imagem ? (
                                <img
                                  className="thumb"
                                  src={imagem}
                                  alt={produto.nome}
                                />
                              ) : (
                                <span className="thumb" />
                              )}
                              {produto.nome}
                            </span>
                          </td>

                          <td>{produto.categoria}</td>
                          <td>{produto.material}</td>
                          <td>{formatarValor(produto.valor)}</td>
                          <td>{produto.quantidade}</td>

                          <td>
                            <span className="actions">
                              <button
                                type="button"
                                className="btn btn-icon"
                                aria-label="Editar"
                                onClick={() =>
                                  navigate(`/estoque/${produto.id}/editar`)
                                }
                              >
                                <IconEdit />
                              </button>

                              <button
                                type="button"
                                className="btn btn-icon danger"
                                aria-label="Inativar"
                                onClick={() => inativarProduto(produto)}
                              >
                                <IconTrash />
                              </button>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="empty">
                        Nenhum produto encontrado.
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
                produtos
              </span>

              <div className="pager">
                <button
                  type="button"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setPagina(pagina - 1)}
                >
                  ‹
                </button>
                <span className="cur">{meta.page}</span>
                <button
                  type="button"
                  disabled={!meta.hasNextPage}
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
