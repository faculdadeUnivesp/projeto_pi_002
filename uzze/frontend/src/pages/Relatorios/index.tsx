import { useState } from 'react';
import api from '../../services/api';
import './Relatorios.css';

interface VendaPorDia {
  data: string;
  quantidade: number;
  total: number;
}

interface RelatorioVendas {
  periodo: {
    inicio: string;
    fim: string;
  };
  total_vendas: number;
  total_faturado: number;
  vendas_por_dia: VendaPorDia[];
}

interface ProdutoEstoqueBaixo {
  id: string;
  nome: string;
  tamanho: string;
  quantidade: number;
  fornecedor: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

export function Relatorios() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [relatorioVendas, setRelatorioVendas] =
    useState<RelatorioVendas | null>(null);

  const [estoqueBaixo, setEstoqueBaixo] =
    useState<ProdutoEstoqueBaixo[]>([]);

  const [metaEstoque, setMetaEstoque] =
    useState<Meta | null>(null);

  const [limiteEstoque, setLimiteEstoque] =
    useState(5);

  const [carregandoVendas, setCarregandoVendas] =
    useState(false);

  const [carregandoEstoque, setCarregandoEstoque] =
    useState(false);

  const [erro, setErro] = useState('');

  function formatarValor(valor: number) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data: string) {
    const partes = data.split('-');

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return data;
  }

  async function buscarRelatorioVendas() {
    if (!dataInicio || !dataFim) {
      setErro(
        'Informe a data inicial e a data final.',
      );
      return;
    }

    if (dataInicio > dataFim) {
      setErro(
        'A data inicial não pode ser maior que a data final.',
      );
      return;
    }

    try {
      setCarregandoVendas(true);
      setErro('');

      const response = await api.get(
        '/relatorios/vendas',
        {
          params: {
            dataInicio,
            dataFim,
          },
        },
      );

      setRelatorioVendas(response.data.data.data);
    } catch (error: any) {
      const mensagemErro =
        error.response?.data?.message;

      if (Array.isArray(mensagemErro)) {
        setErro(mensagemErro.join(', '));
      } else {
        setErro(
          mensagemErro ||
            'Não foi possível gerar o relatório de vendas.',
        );
      }
    } finally {
      setCarregandoVendas(false);
    }
  }

  async function buscarEstoqueBaixo(
    page = 1,
  ) {
    if (limiteEstoque < 0) {
      setErro(
        'O limite de estoque não pode ser negativo.',
      );
      return;
    }

    try {
      setCarregandoEstoque(true);
      setErro('');

      const response = await api.get(
        '/relatorios/estoque-baixo',
        {
          params: {
            limite: limiteEstoque,
            page,
          },
        },
      );

      setEstoqueBaixo(response.data.data);
      setMetaEstoque(response.data.meta);
    } catch (error: any) {
      const mensagemErro =
        error.response?.data?.message;

      if (Array.isArray(mensagemErro)) {
        setErro(mensagemErro.join(', '));
      } else {
        setErro(
          mensagemErro ||
            'Não foi possível gerar o relatório de estoque baixo.',
        );
      }
    } finally {
      setCarregandoEstoque(false);
    }
  }

  function paginaAnteriorEstoque() {
    if (
      metaEstoque &&
      metaEstoque.page > 1
    ) {
      buscarEstoqueBaixo(
        metaEstoque.page - 1,
      );
    }
  }

  function proximaPaginaEstoque() {
    if (
      metaEstoque &&
      metaEstoque.page *
        metaEstoque.limit <
        metaEstoque.total
    ) {
      buscarEstoqueBaixo(
        metaEstoque.page + 1,
      );
    }
  }

  return (
    <div className="relatorios">
      <div className="relatorios__cabecalho">
        <h1>Relatórios</h1>

        <p>
          Consulte vendas por período e produtos
          com estoque baixo.
        </p>
      </div>

      {erro && (
        <div className="relatorios__erro">
          {erro}
        </div>
      )}

      <section className="relatorios__secao">
        <h2>Relatório de vendas</h2>

        <div className="relatorios__filtros">
          <div className="relatorios__campo">
            <label htmlFor="dataInicio">
              Data inicial
            </label>

            <input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(event) =>
                setDataInicio(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="relatorios__campo">
            <label htmlFor="dataFim">
              Data final
            </label>

            <input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(event) =>
                setDataFim(
                  event.target.value,
                )
              }
            />
          </div>

          <button
            type="button"
            onClick={buscarRelatorioVendas}
            disabled={carregandoVendas}
          >
            {carregandoVendas
              ? 'Gerando...'
              : 'Gerar relatório'}
          </button>
        </div>

        {relatorioVendas && (
          <>
            <div className="relatorios__resumo">
              <div className="relatorios__card">
                <span>Total de vendas</span>

                <strong>
                  {
                    relatorioVendas.total_vendas
                  }
                </strong>
              </div>

              <div className="relatorios__card">
                <span>
                  Total faturado
                </span>

                <strong>
                  {formatarValor(
                    relatorioVendas.total_faturado,
                  )}
                </strong>
              </div>

              <div className="relatorios__card">
                <span>Período</span>

                <strong>
                  {formatarData(
                    relatorioVendas.periodo.inicio,
                  )}{' '}
                  até{' '}
                  {formatarData(
                    relatorioVendas.periodo.fim,
                  )}
                </strong>
              </div>
            </div>

            {relatorioVendas.vendas_por_dia
              .length === 0 ? (
              <div className="relatorios__vazio">
                Nenhuma venda concluída no
                período informado.
              </div>
            ) : (
              <div className="relatorios__tabela-container">
                <table className="relatorios__tabela">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>
                        Quantidade de vendas
                      </th>
                      <th>Total faturado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {relatorioVendas.vendas_por_dia.map(
                      (item) => (
                        <tr key={item.data}>
                          <td>
                            {formatarData(
                              item.data,
                            )}
                          </td>

                          <td>
                            {item.quantidade}
                          </td>

                          <td>
                            {formatarValor(
                              item.total,
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <section className="relatorios__secao">
        <h2>Estoque baixo</h2>

        <div className="relatorios__filtros">
          <div className="relatorios__campo">
            <label htmlFor="limiteEstoque">
              Limite
            </label>

            <input
              id="limiteEstoque"
              type="number"
              min="0"
              value={limiteEstoque}
              onChange={(event) =>
                setLimiteEstoque(
                  Number(
                    event.target.value,
                  ),
                )
              }
            />
          </div>

          <button
            type="button"
            onClick={() =>
              buscarEstoqueBaixo(1)
            }
            disabled={carregandoEstoque}
          >
            {carregandoEstoque
              ? 'Consultando...'
              : 'Consultar estoque'}
          </button>
        </div>

        {metaEstoque && (
          <>
            {estoqueBaixo.length === 0 ? (
              <div className="relatorios__vazio">
                Nenhum produto com estoque
                dentro do limite informado.
              </div>
            ) : (
              <div className="relatorios__tabela-container">
                <table className="relatorios__tabela">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Tamanho</th>
                      <th>Quantidade</th>
                      <th>Fornecedor</th>
                    </tr>
                  </thead>

                  <tbody>
                    {estoqueBaixo.map(
                      (produto) => (
                        <tr key={produto.id}>
                          <td>
                            {produto.nome}
                          </td>

                          <td>
                            {produto.tamanho}
                          </td>

                          <td>
                            {
                              produto.quantidade
                            }
                          </td>

                          <td>
                            {
                              produto.fornecedor
                            }
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="relatorios__paginacao">
              <button
                type="button"
                onClick={
                  paginaAnteriorEstoque
                }
                disabled={
                  metaEstoque.page <= 1
                }
              >
                Anterior
              </button>

              <span>
                Página {metaEstoque.page}
              </span>

              <button
                type="button"
                onClick={
                  proximaPaginaEstoque
                }
                disabled={
                  metaEstoque.page *
                    metaEstoque.limit >=
                  metaEstoque.total
                }
              >
                Próxima
              </button>

              <span>
                Total de produtos:{' '}
                {metaEstoque.total}
              </span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}