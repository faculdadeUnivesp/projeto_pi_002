import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  IconPlus,
  IconSearch,
  IconTrash,
  IconCheck,
} from '../../components/common/Icons';

interface Venda {
  id: string;
  numero_venda: string;
  data: string;
  forma_pagamento: 'dinheiro' | 'cartao' | 'pix';
  vendedor_id: string;
  total: number;
  status: 'concluida' | 'cancelada';
  created_at: string;
}

interface ItemVendaDetalhe {
  id: string;
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
}

interface VendaDetalhe {
  id: string;
  numero_venda: string;
  data: string;
  forma_pagamento: 'dinheiro' | 'cartao' | 'pix';
  vendedor_id: string;
  total: number;
  status: 'concluida' | 'cancelada';
  itens: ItemVendaDetalhe[];
}

interface Produto {
  id: string;
  nome: string;
  tamanho: string;
  valor: number;
  quantidade: number;
  status: 'ativo' | 'inativo';
}

interface ItemSelecionado {
  produtoId: string;
  quantidade: number;
}

interface Cliente {
  id: string;
  nome: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

type FormaPagamento = 'dinheiro' | 'cartao' | 'pix';

export function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [itens, setItens] = useState<ItemSelecionado[]>([]);

  const [clienteId, setClienteId] = useState('');

  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: 10,
  });

  const [novaVenda, setNovaVenda] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState('');

  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>('dinheiro');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [dataFiltro, setDataFiltro] = useState('');

  const [vendaDetalhe, setVendaDetalhe] = useState<VendaDetalhe | null>(null);

  async function carregarVendas(page = 1, data = dataFiltro) {
    try {
      setCarregando(true);
      setErro('');

      const response = await api.get('/vendas', {
        params: {
          page,
          limit: 10,
          ...(data ? { data } : {}),
        },
      });

      setVendas(response.data.data);
      setMeta(response.data.meta);
    } catch {
      setErro('Não foi possível carregar as vendas.');
    } finally {
      setCarregando(false);
    }
  }

  async function carregarProdutos() {
    try {
      const response = await api.get('/produtos', {
        params: { limit: 100, status: 'ativo' },
      });

      const lista: Produto[] = response.data.data ?? [];

      setProdutos(
        lista.filter((produto) => produto.quantidade > 0),
      );
    } catch {
      setErro('Não foi possível carregar os produtos.');
    }
  }

  async function carregarClientes() {
    try {
      const response = await api.get('/clientes', {
        params: { limit: 100, status: 'ativo' },
      });

      setClientes(response.data.data ?? []);
    } catch {
      setErro('Não foi possível carregar os clientes.');
    }
  }

  useEffect(() => {
    carregarVendas();
  }, []);

  async function abrirNovaVenda() {
    setErro('');
    setMensagem('');
    setItens([]);
    setBuscaProduto('');
    setQuantidades({});
    setClienteId('');

    await carregarProdutos();
    await carregarClientes();

    setNovaVenda(true);
  }

  function adicionarItem(idProduto: string, qtd: number) {
    setErro('');

    const produto = produtos.find((p) => p.id === idProduto);

    if (!produto) {
      setErro('Produto não encontrado.');
      return;
    }

    if (qtd < 1) {
      setErro('A quantidade deve ser maior que zero.');
      return;
    }

    if (qtd > produto.quantidade) {
      setErro('Quantidade maior que o estoque disponível.');
      return;
    }

    const produtoJaAdicionado = itens.some(
      (item) => item.produtoId === idProduto,
    );

    if (produtoJaAdicionado) {
      setErro('Produto duplicado no pedido');
      return;
    }

    setItens([...itens, { produtoId: idProduto, quantidade: qtd }]);
  }

  function alterarQuantidadeItem(produtoId: string, novaQuantidade: number) {
    setItens(
      itens.map((item) =>
        item.produtoId === produtoId
          ? { ...item, quantidade: novaQuantidade }
          : item,
      ),
    );
  }

  function removerItem(produtoId: string) {
    setItens(itens.filter((item) => item.produtoId !== produtoId));
  }

  function calcularTotal() {
    return itens.reduce((total, item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);

      if (!produto) {
        return total;
      }

      return total + Number(produto.valor) * item.quantidade;
    }, 0);
  }

  async function finalizarVenda() {
    if (itens.length === 0) {
      setErro('A venda deve possuir pelo menos um item');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      await api.post('/vendas', {
        formaPagamento,
        ...(clienteId ? { clienteId } : {}),
        itens,
      });

      setMensagem('Venda registrada com sucesso.');

      setNovaVenda(false);
      setItens([]);

      await carregarVendas(1, dataFiltro);
    } catch (error: unknown) {
      const mensagemErro = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

      if (Array.isArray(mensagemErro)) {
        setErro(mensagemErro.join(', '));
      } else {
        setErro(mensagemErro || 'Não foi possível registrar a venda.');
      }
    } finally {
      setSalvando(false);
    }
  }

  function filtrarPorData() {
    carregarVendas(1, dataFiltro);
  }

  function limparFiltro() {
    setDataFiltro('');
    carregarVendas(1, '');
  }

  async function visualizarVenda(id: string) {
    try {
      setErro('');

      const response = await api.get(`/vendas/${id}`);

      setVendaDetalhe(response.data.data);
    } catch {
      setErro('Não foi possível carregar os detalhes da venda.');
    }
  }

  async function cancelarVenda(id: string) {
    const confirmar = window.confirm('Deseja realmente cancelar esta venda?');

    if (!confirmar) {
      return;
    }

    try {
      setErro('');
      setMensagem('');

      await api.patch(`/vendas/${id}/cancelar`);

      setMensagem('Venda cancelada com sucesso.');

      setVendaDetalhe(null);

      await carregarVendas(meta.page, dataFiltro);
    } catch (error: unknown) {
      const mensagemErro = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

      if (Array.isArray(mensagemErro)) {
        setErro(mensagemErro.join(', '));
      } else {
        setErro(mensagemErro || 'Não foi possível cancelar a venda.');
      }
    }
  }

  function paginaAnterior() {
    if (meta.page > 1) {
      carregarVendas(meta.page - 1, dataFiltro);
    }
  }

  function proximaPagina() {
    if (meta.page * meta.limit < meta.total) {
      carregarVendas(meta.page + 1, dataFiltro);
    }
  }

  function formatarValor(valor: number) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString('pt-BR');
  }

  function formatarPagamento(forma: Venda['forma_pagamento']) {
    const formas = {
      dinheiro: 'Dinheiro',
      cartao: 'Cartão',
      pix: 'PIX',
    };

    return formas[forma];
  }

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = buscaProduto.trim().toLowerCase();

    if (!termo) return true;

    return (
      produto.nome.toLowerCase().includes(termo) ||
      produto.tamanho.toLowerCase().includes(termo)
    );
  });

  function contarItens() {
    return itens.reduce((total, item) => total + item.quantidade, 0);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Vendas realizadas</h1>
        </div>

        {!novaVenda && (
          <button className="btn" type="button" onClick={abrirNovaVenda}>
            <IconPlus />
            Nova Venda
          </button>
        )}
      </div>

      {erro && <div className="alert alert--error">{erro}</div>}
      {mensagem && <div className="alert alert--success">{mensagem}</div>}

      {novaVenda ? (
        <form
          className="sale"
          onSubmit={(event) => {
            event.preventDefault();
            void finalizarVenda();
          }}
        >
          <section className="card">
            <h2 className="lg">Adicionar Produtos</h2>

            <label className="search-sm">
              <IconSearch />
              <input
                type="search"
                placeholder="Buscar produto por nome ou tamanho..."
                aria-label="Buscar produto"
                value={buscaProduto}
                onChange={(event) => setBuscaProduto(event.target.value)}
              />
            </label>

            <div className="sale-table">
              <div className="head">
                <span>Produto</span>
                <span>Preço</span>
                <span>Estoque</span>
                <span>Adicionar</span>
              </div>

              {produtosFiltrados.length > 0 ? (
                produtosFiltrados.map((produto) => {
                  const itemSelecionado = itens.find(
                    (item) => item.produtoId === produto.id,
                  );
                  const jaAdicionado = Boolean(itemSelecionado);

                  return (
                    <div className="row" key={produto.id}>
                      <span className="prod">
                        <span className="thumb" />
                        {produto.nome} ({produto.tamanho})
                      </span>
                      <span>{formatarValor(produto.valor)}</span>
                      <span>{produto.quantidade}</span>
                      <span>
                        {jaAdicionado ? (
                          <span className="status">Adicionado</span>
                        ) : (
                          <div className="qty">
                            <input
                              type="number"
                              min={1}
                              max={produto.quantidade}
                              value={quantidades[produto.id] ?? 1}
                              aria-label={`Quantidade de ${produto.nome}`}
                              onChange={(event) => {
                                const valor = Number(event.target.value);
                                setQuantidades((anterior) => ({
                                  ...anterior,
                                  [produto.id]:
                                    Number.isFinite(valor) && valor >= 1
                                      ? Math.min(valor, produto.quantidade)
                                      : 1,
                                }));
                              }}
                            />
                            <button
                              className="btn btn-icon"
                              type="button"
                              aria-label={`Adicionar ${produto.nome}`}
                              onClick={() =>
                                adicionarItem(
                                  produto.id,
                                  quantidades[produto.id] ?? 1,
                                )
                              }
                            >
                              <IconPlus />
                            </button>
                          </div>
                        )}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="row">
                  <span style={{ gridColumn: '1 / -1' }} className="empty">
                    Nenhum produto encontrado.
                  </span>
                </div>
              )}
            </div>
          </section>

          <aside className="card summary">
            <h2>Resumo da Venda</h2>

            <dl>
              <dt>Subtotal ({contarItens()} itens)</dt>
              <dd>{formatarValor(calcularTotal())}</dd>

              <dt>Cliente (opcional)</dt>
              <dd>
                <select
                  className="select"
                  value={clienteId}
                  onChange={(event) => setClienteId(event.target.value)}
                  style={{ width: 'auto', fontSize: 10, padding: '4px 8px' }}
                >
                  <option value="">Sem cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </dd>

              <dt>Forma de pagamento</dt>
              <dd>
                <select
                  className="select"
                  value={formaPagamento}
                  onChange={(event) =>
                    setFormaPagamento(event.target.value as FormaPagamento)
                  }
                  style={{ width: 'auto', fontSize: 10, padding: '4px 8px' }}
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="pix">PIX</option>
                </select>
              </dd>
            </dl>

            <div className="total">
              <span>Total</span>
              <span>{formatarValor(calcularTotal())}</span>
            </div>

            <button className="btn" type="submit" disabled={salvando}>
              <IconCheck />
              {salvando ? 'Finalizando...' : 'Finalizar Venda'}
            </button>

            <button
              className="btn btn-outline"
              type="button"
              onClick={() => {
                setNovaVenda(false);
                setItens([]);
                setErro('');
              }}
            >
              Cancelar
            </button>

            <div className="cart-title">Itens do Carrinho</div>

            {itens.length > 0 ? (
              itens.map((item) => {
                const produto = produtos.find(
                  (p) => p.id === item.produtoId,
                );

                return (
                  <div className="cart-item" key={item.produtoId}>
                    <span className="thumb" />
                    <span className="grow">
                      {produto?.nome} ({produto?.tamanho})
                    </span>

                    <span className="qty">
                      <button
                        type="button"
                        aria-label="Diminuir"
                        onClick={() =>
                          alterarQuantidadeItem(
                            item.produtoId,
                            Math.max(1, item.quantidade - 1),
                          )
                        }
                      >
                        −
                      </button>
                      <input
                        value={item.quantidade}
                        aria-label="Quantidade"
                        readOnly
                      />
                      <button
                        type="button"
                        aria-label="Aumentar"
                        onClick={() =>
                          alterarQuantidadeItem(
                            item.produtoId,
                            Math.min(
                              produto?.quantidade ?? 1,
                              item.quantidade + 1,
                            ),
                          )
                        }
                      >
                        +
                      </button>
                    </span>

                    <span>
                      {formatarValor(
                        Number(produto?.valor ?? 0) * item.quantidade,
                      )}
                    </span>

                    <button
                      type="button"
                      aria-label="Remover"
                      onClick={() => removerItem(item.produtoId)}
                    >
                      <IconTrash />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="empty">Nenhum item adicionado.</p>
            )}
          </aside>
        </form>
      ) : (
        <>
          <div className="list-filters">
            <div className="field">
              <span className="label-s">Data</span>
              <input
                className="input"
                id="data-filtro"
                type="date"
                aria-label="Filtrar por data"
                value={dataFiltro}
                onChange={(event) => setDataFiltro(event.target.value)}
              />
            </div>

            <button className="btn" type="button" onClick={filtrarPorData}>
              Filtrar
            </button>

            <button
              className="btn btn-outline"
              type="button"
              onClick={limparFiltro}
            >
              Limpar
            </button>
          </div>

          <div className="card table-card">
            {carregando ? (
              <p className="empty">Carregando vendas...</p>
            ) : (
              <>
                <div className="table-scroll">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Nº Venda</th>
                        <th>Data</th>
                        <th>Total</th>
                        <th>Pagamento</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {vendas.length > 0 ? (
                        vendas.map((venda) => (
                          <tr key={venda.id}>
                            <td className="strong">#{venda.numero_venda}</td>
                            <td>{formatarData(venda.data)}</td>
                            <td>{formatarValor(venda.total)}</td>
                            <td>{formatarPagamento(venda.forma_pagamento)}</td>
                            <td>
                              <span
                                className={`status${
                                  venda.status === 'cancelada' ? ' off' : ''
                                }`}
                              >
                                {venda.status === 'concluida'
                                  ? 'Concluída'
                                  : 'Cancelada'}
                              </span>
                            </td>
                            <td>
                              <span className="actions">
                                <button
                                  className="btn btn-outline"
                                  type="button"
                                  onClick={() => visualizarVenda(venda.id)}
                                >
                                  Detalhes
                                </button>
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="empty">
                            Nenhuma venda encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-foot">
                  <span>Total de vendas: {meta.total}</span>

                  <div className="pager">
                    <button
                      type="button"
                      onClick={paginaAnterior}
                      disabled={meta.page <= 1}
                    >
                      ‹
                    </button>
                    <span className="cur">{meta.page}</span>
                    <button
                      type="button"
                      onClick={proximaPagina}
                      disabled={meta.page * meta.limit >= meta.total}
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {vendaDetalhe && (
            <section className="card" style={{ marginTop: 18 }}>
              <div className="page-head" style={{ marginBottom: 8 }}>
                <h2 className="lg">
                  Venda #{vendaDetalhe.numero_venda}
                </h2>

                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => setVendaDetalhe(null)}
                >
                  Fechar
                </button>
              </div>

              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                Data: {formatarData(vendaDetalhe.data)} · Pagamento:{' '}
                {formatarPagamento(vendaDetalhe.forma_pagamento)} · Status:{' '}
                {vendaDetalhe.status === 'concluida'
                  ? 'Concluída'
                  : 'Cancelada'}
              </p>

              <div className="table-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Valor unitário</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendaDetalhe.itens.map((item) => (
                      <tr key={item.id}>
                        <td className="strong">{item.produto_id}</td>
                        <td>{item.quantidade}</td>
                        <td>{formatarValor(item.valor_unitario)}</td>
                        <td>
                          {formatarValor(
                            item.valor_unitario * item.quantidade,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="summary" style={{ marginTop: 12 }}>
                <div className="total">
                  <span>Total</span>
                  <span>{formatarValor(vendaDetalhe.total)}</span>
                </div>

                {vendaDetalhe.status === 'concluida' && (
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => cancelarVenda(vendaDetalhe.id)}
                  >
                    Cancelar venda
                  </button>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
