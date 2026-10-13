import { useEffect, useState } from 'react';
import api from '../../services/api';
import './Vendas.css';

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

interface Meta {
  total: number;
  page: number;
  limit: number;
}

type FormaPagamento = 'dinheiro' | 'cartao' | 'pix';

export function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [itens, setItens] = useState<ItemSelecionado[]>([]);

  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: 10,
  });

  const [novaVenda, setNovaVenda] = useState(false);
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>('dinheiro');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [dataFiltro, setDataFiltro] = useState('');

  const [vendaDetalhe, setVendaDetalhe] =
    useState<VendaDetalhe | null>(null);

  async function carregarVendas(
    page = 1,
    data = dataFiltro,
  ) {
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
      const response = await api.get('/produtos');

      const produtosDisponiveis = response.data.filter(
        (produto: Produto) =>
          produto.status === 'ativo' &&
          produto.quantidade > 0,
      );

      setProdutos(produtosDisponiveis);
    } catch {
      setErro('Não foi possível carregar os produtos.');
    }
  }

  useEffect(() => {
    carregarVendas();
  }, []);

  async function abrirNovaVenda() {
    setErro('');
    setMensagem('');
    setItens([]);
    setProdutoId('');
    setQuantidade(1);

    await carregarProdutos();

    setNovaVenda(true);
  }

  function adicionarItem() {
    setErro('');

    if (!produtoId) {
      setErro('Selecione um produto.');
      return;
    }

    if (quantidade < 1) {
      setErro('A quantidade deve ser maior que zero.');
      return;
    }

    const produto = produtos.find(
      (produto) => produto.id === produtoId,
    );

    if (!produto) {
      setErro('Produto não encontrado.');
      return;
    }

    if (quantidade > produto.quantidade) {
      setErro('Quantidade maior que o estoque disponível.');
      return;
    }

    const produtoJaAdicionado = itens.some(
      (item) => item.produtoId === produtoId,
    );

    if (produtoJaAdicionado) {
      setErro('Produto duplicado no pedido');
      return;
    }

    setItens([
      ...itens,
      {
        produtoId,
        quantidade,
      },
    ]);

    setProdutoId('');
    setQuantidade(1);
  }

  function removerItem(produtoId: string) {
    setItens(
      itens.filter(
        (item) => item.produtoId !== produtoId,
      ),
    );
  }

  function calcularTotal() {
    return itens.reduce((total, item) => {
      const produto = produtos.find(
        (produto) => produto.id === item.produtoId,
      );

      if (!produto) {
        return total;
      }

      return (
        total +
        Number(produto.valor) * item.quantidade
      );
    }, 0);
  }

  async function finalizarVenda() {
    if (itens.length === 0) {
      setErro(
        'A venda deve possuir pelo menos um item',
      );
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      await api.post('/vendas', {
        formaPagamento,
        itens,
      });

      setMensagem(
        'Venda registrada com sucesso.',
      );

      setNovaVenda(false);
      setItens([]);

      await carregarVendas(1, dataFiltro);
    } catch (error: any) {
      const mensagemErro =
        error.response?.data?.message;

      if (Array.isArray(mensagemErro)) {
        setErro(mensagemErro.join(', '));
      } else {
        setErro(
          mensagemErro ||
            'Não foi possível registrar a venda.',
        );
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

      const response = await api.get(
        `/vendas/${id}`,
      );

      setVendaDetalhe(response.data.data);
    } catch {
      setErro(
        'Não foi possível carregar os detalhes da venda.',
      );
    }
  }

  async function cancelarVenda(id: string) {
    const confirmar = window.confirm(
      'Deseja realmente cancelar esta venda?',
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro('');
      setMensagem('');

      await api.patch(
        `/vendas/${id}/cancelar`,
      );

      setMensagem(
        'Venda cancelada com sucesso.',
      );

      setVendaDetalhe(null);

      await carregarVendas(
        meta.page,
        dataFiltro,
      );
    } catch (error: any) {
      const mensagemErro =
        error.response?.data?.message;

      if (Array.isArray(mensagemErro)) {
        setErro(mensagemErro.join(', '));
      } else {
        setErro(
          mensagemErro ||
            'Não foi possível cancelar a venda.',
        );
      }
    }
  }

  function paginaAnterior() {
    if (meta.page > 1) {
      carregarVendas(
        meta.page - 1,
        dataFiltro,
      );
    }
  }

  function proximaPagina() {
    if (
      meta.page * meta.limit <
      meta.total
    ) {
      carregarVendas(
        meta.page + 1,
        dataFiltro,
      );
    }
  }

  function formatarValor(valor: number) {
    return Number(valor).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      },
    );
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString(
      'pt-BR',
    );
  }

  function formatarPagamento(
    forma: Venda['forma_pagamento'],
  ) {
    const formas = {
      dinheiro: 'Dinheiro',
      cartao: 'Cartão',
      pix: 'PIX',
    };

    return formas[forma];
  }

  return (
    <div className="vendas">
      <div className="vendas__cabecalho">
        <div>
          <h2>Vendas</h2>
          <p>
            Consulte e registre as vendas da loja.
          </p>
        </div>

        {!novaVenda && (
          <button
            type="button"
            className="vendas__nova"
            onClick={abrirNovaVenda}
          >
            Nova venda
          </button>
        )}
      </div>

      {erro && (
        <div className="vendas__erro">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="vendas__sucesso">
          {mensagem}
        </div>
      )}

      {novaVenda ? (
        <div className="vendas__formulario">
          <h3>Nova venda</h3>

          <div className="vendas__campos">
            <div className="vendas__campo">
              <label htmlFor="produto">
                Produto
              </label>

              <select
                id="produto"
                value={produtoId}
                onChange={(event) =>
                  setProdutoId(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Selecione um produto
                </option>

                {produtos.map((produto) => (
                  <option
                    key={produto.id}
                    value={produto.id}
                  >
                    {produto.nome} -{' '}
                    {produto.tamanho} -{' '}
                    {formatarValor(
                      produto.valor,
                    )}{' '}
                    - Estoque:{' '}
                    {produto.quantidade}
                  </option>
                ))}
              </select>
            </div>

            <div className="vendas__campo">
              <label htmlFor="quantidade">
                Quantidade
              </label>

              <input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(event) =>
                  setQuantidade(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              />
            </div>

            <button
              type="button"
              onClick={adicionarItem}
            >
              Adicionar
            </button>
          </div>

          {produtos.length === 0 && (
            <p>
              Nenhum produto com estoque
              disponível.
            </p>
          )}

          {itens.length > 0 && (
            <div className="vendas__tabela-container">
              <table className="vendas__tabela">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Tamanho</th>
                    <th>Quantidade</th>
                    <th>
                      Valor unitário
                    </th>
                    <th>Subtotal</th>
                    <th>Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {itens.map((item) => {
                    const produto =
                      produtos.find(
                        (produto) =>
                          produto.id ===
                          item.produtoId,
                      );

                    if (!produto) {
                      return null;
                    }

                    return (
                      <tr
                        key={item.produtoId}
                      >
                        <td>
                          {produto.nome}
                        </td>

                        <td>
                          {produto.tamanho}
                        </td>

                        <td>
                          {item.quantidade}
                        </td>

                        <td>
                          {formatarValor(
                            produto.valor,
                          )}
                        </td>

                        <td>
                          {formatarValor(
                            Number(
                              produto.valor,
                            ) *
                              item.quantidade,
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              removerItem(
                                item.produtoId,
                              )
                            }
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="vendas__pagamento">
            <label htmlFor="formaPagamento">
              Forma de pagamento
            </label>

            <select
              id="formaPagamento"
              value={formaPagamento}
              onChange={(event) =>
                setFormaPagamento(
                  event.target
                    .value as FormaPagamento,
                )
              }
            >
              <option value="dinheiro">
                Dinheiro
              </option>

              <option value="cartao">
                Cartão
              </option>

              <option value="pix">
                PIX
              </option>
            </select>
          </div>

          <div className="vendas__resumo">
            <strong>
              Total:{' '}
              {formatarValor(
                calcularTotal(),
              )}
            </strong>
          </div>

          <div className="vendas__acoes">
            <button
              type="button"
              onClick={() => {
                setNovaVenda(false);
                setItens([]);
                setErro('');
              }}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={finalizarVenda}
              disabled={salvando}
            >
              {salvando
                ? 'Finalizando...'
                : 'Finalizar venda'}
            </button>
          </div>
        </div>
      ) : carregando ? (
        <p>Carregando vendas...</p>
      ) : (
        <>
          <div className="vendas__filtro">
            <div>
              <label htmlFor="dataFiltro">
                Data da venda
              </label>

              <input
                id="dataFiltro"
                type="date"
                value={dataFiltro}
                onChange={(event) =>
                  setDataFiltro(
                    event.target.value,
                  )
                }
              />
            </div>

            <button
              type="button"
              onClick={filtrarPorData}
            >
              Filtrar
            </button>

            <button
              type="button"
              onClick={limparFiltro}
            >
              Limpar
            </button>
          </div>

          {vendas.length === 0 ? (
            <div className="vendas__vazio">
              Nenhuma venda registrada.
            </div>
          ) : (
            <>
              <div className="vendas__tabela-container">
                <table className="vendas__tabela">
                  <thead>
                    <tr>
                      <th>
                        Nº da venda
                      </th>
                      <th>Data</th>
                      <th>Pagamento</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendas.map(
                      (venda) => (
                        <tr key={venda.id}>
                          <td>
                            {
                              venda.numero_venda
                            }
                          </td>

                          <td>
                            {formatarData(
                              venda.data,
                            )}
                          </td>

                          <td>
                            {formatarPagamento(
                              venda.forma_pagamento,
                            )}
                          </td>

                          <td>
                            {formatarValor(
                              venda.total,
                            )}
                          </td>

                          <td>
                            {venda.status ===
                            'concluida'
                              ? 'Concluída'
                              : 'Cancelada'}
                          </td>

                          <td>
                            <button
                              type="button"
                              onClick={() =>
                                visualizarVenda(
                                  venda.id,
                                )
                              }
                            >
                              Detalhes
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="vendas__paginacao">
                <button
                  type="button"
                  onClick={
                    paginaAnterior
                  }
                  disabled={
                    meta.page <= 1
                  }
                >
                  Anterior
                </button>

                <span>
                  Página {meta.page}
                </span>

                <button
                  type="button"
                  onClick={
                    proximaPagina
                  }
                  disabled={
                    meta.page *
                      meta.limit >=
                    meta.total
                  }
                >
                  Próxima
                </button>

                <span>
                  Total de vendas:{' '}
                  {meta.total}
                </span>
              </div>
            </>
          )}

          {vendaDetalhe && (
            <div className="vendas__detalhes">
              <div className="vendas__detalhes-cabecalho">
                <h3>
                  Venda{' '}
                  {
                    vendaDetalhe.numero_venda
                  }
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setVendaDetalhe(
                      null,
                    )
                  }
                >
                  Fechar
                </button>
              </div>

              <p>
                <strong>Data:</strong>{' '}
                {formatarData(
                  vendaDetalhe.data,
                )}
              </p>

              <p>
                <strong>
                  Pagamento:
                </strong>{' '}
                {formatarPagamento(
                  vendaDetalhe.forma_pagamento,
                )}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {vendaDetalhe.status ===
                'concluida'
                  ? 'Concluída'
                  : 'Cancelada'}
              </p>

              <div className="vendas__tabela-container">
                <table className="vendas__tabela">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>
                        Quantidade
                      </th>
                      <th>
                        Valor unitário
                      </th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendaDetalhe.itens.map(
                      (item) => (
                        <tr key={item.id}>
                          <td>
                            {
                              item.produto_id
                            }
                          </td>

                          <td>
                            {
                              item.quantidade
                            }
                          </td>

                          <td>
                            {formatarValor(
                              item.valor_unitario,
                            )}
                          </td>

                          <td>
                            {formatarValor(
                              Number(
                                item.valor_unitario,
                              ) *
                                item.quantidade,
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="vendas__resumo">
                <strong>
                  Total:{' '}
                  {formatarValor(
                    vendaDetalhe.total,
                  )}
                </strong>
              </div>

              {vendaDetalhe.status ===
                'concluida' && (
                <div className="vendas__acoes">
                  <button
                    type="button"
                    onClick={() =>
                      cancelarVenda(
                        vendaDetalhe.id,
                      )
                    }
                  >
                    Cancelar venda
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}