import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import './Estoque.css';

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
    setPagina(1);
  }, [busca, categoria, tamanho]);

  const formatarValor = (valor: number | string) => {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const urlImagem = (produto: Produto) => {
    if (!produto.imagem) return null;
    if (produto.imagem.startsWith('http')) return produto.imagem;

    const caminho = produto.imagem.startsWith('/') ? produto.imagem : `/${produto.imagem}`;

    return `http://localhost:3000${caminho}`;
  };

  const inativarProduto = async (produto: Produto) => {
    const confirmar = window.confirm(`Deseja inativar o produto "${produto.nome}"?`);

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
    <section className="estoque">
      <div className="estoque__topo">
        <h1>Estoque</h1>

        <button type="button" className="estoque__novo" onClick={() => navigate('/estoque/cadastrar')}>
          <span>+</span>
          Novo Produto
        </button>
      </div>

      <div className="estoque__filtros">
        <div className="estoque__busca">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16.5 16.5 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>

          <input type="text" value={busca} placeholder="Buscar produto" onChange={(event) => setBusca(event.target.value)} />
        </div>

        <select value={categoria} onChange={(event) => setCategoria(event.target.value)}>
          <option value="">Todas as categorias</option>
          <option value="camisa">Camisa</option>
          <option value="calça">Calça</option>
          <option value="blusa">Blusa</option>
          <option value="vestido">Vestido</option>
          <option value="acessório">Acessório</option>
        </select>

        <select value={tamanho} onChange={(event) => setTamanho(event.target.value)}>
          <option value="">Todos os tamanhos</option>
          <option value="PP">PP</option>
          <option value="P">P</option>
          <option value="M">M</option>
          <option value="G">G</option>
          <option value="GG">GG</option>
          <option value="36">36</option>
          <option value="38">38</option>
          <option value="40">40</option>
          <option value="42">42</option>
        </select>
      </div>

      <div className="estoque__card">
        {carregando ? (
          <div className="estoque__estado">Carregando produtos...</div>
        ) : erro ? (
          <div className="estoque__estado estoque__estado--erro">
            <p>{erro}</p>
            <button type="button" onClick={carregarProdutos}>Tentar novamente</button>
          </div>
        ) : (
          <>
            <div className="estoque__tabela-wrapper">
              <table className="estoque__tabela">
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
                            <div className="estoque__produto">
                              <div className="estoque__imagem">
                                {imagem ? <img src={imagem} alt={produto.nome} /> : <span />}
                              </div>

                              <strong>{produto.nome}</strong>
                            </div>
                          </td>

                          <td>{produto.categoria}</td>
                          <td>{produto.material}</td>
                          <td>{formatarValor(produto.valor)}</td>
                          <td>{produto.quantidade}</td>

                          <td>
                            <div className="estoque__acoes">
                              <button
                                type="button"
                                className="estoque__acao estoque__acao--editar"
                                title="Editar produto"
                                onClick={() => navigate(`/estoque/${produto.id}/editar`)}
                              >
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="1.6" />
                                </svg>
                              </button>

                              <button
                                type="button"
                                className="estoque__acao estoque__acao--excluir"
                                title="Inativar produto"
                                onClick={() => inativarProduto(produto)}
                              >
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="estoque__vazio">Nenhum produto encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="estoque__rodape">
              <span>
                Mostrando {meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1}-
                {Math.min(meta.page * meta.limit, meta.total)} de {meta.total} produtos
              </span>

              <div className="estoque__paginacao">
                <button type="button" disabled={!meta.hasPreviousPage} onClick={() => setPagina(pagina - 1)}>‹</button>
                <span>{meta.page}</span>
                <button type="button" disabled={!meta.hasNextPage} onClick={() => setPagina(pagina + 1)}>›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}