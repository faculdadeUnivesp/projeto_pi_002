import { useState } from 'react';
import api from '../../services/api';
import { IconCalendar, IconWarning } from '../../components/common/Icons';

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

  const [estoqueBaixo, setEstoqueBaixo] = useState<ProdutoEstoqueBaixo[]>([]);

  const [metaEstoque, setMetaEstoque] = useState<Meta | null>(null);

  const [limiteEstoque, setLimiteEstoque] = useState(5);

  const [carregandoVendas, setCarregandoVendas] = useState(false);

  const [carregandoEstoque, setCarregandoEstoque] = useState(false);

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
      setErro('Informe a data inicial e a data final.');
      return;
    }

    if (dataInicio > dataFim) {
      setErro('A data inicial não pode ser maior que a data final.');
      return;
    }

    try {
      setCarregandoVendas(true);
      setErro('');

      const response = await api.get('/relatorios/vendas', {
        params: {
          dataInicio,
          dataFim,
        },
      });

      setRelatorioVendas(response.data.data);
    } catch (error: unknown) {
      const mensagemErro = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

      if (Array.isArray(mensagemErro)) {
        setErro(mensagemErro.join(', '));
      } else {
        setErro(
          mensagemErro || 'Não foi possível gerar o relatório de vendas.',
        );
      }
    } finally {
      setCarregandoVendas(false);
    }
  }

  async function buscarEstoqueBaixo(page = 1) {
    if (limiteEstoque < 0) {
      setErro('O limite de estoque não pode ser negativo.');
      return;
    }

    try {
      setCarregandoEstoque(true);
      setErro('');

      const response = await api.get('/relatorios/estoque-baixo', {
        params: {
          limite: limiteEstoque,
          page,
        },
      });

      setEstoqueBaixo(response.data.data);
      setMetaEstoque(response.data.meta);
    } catch (error: unknown) {
      const mensagemErro = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

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
    if (metaEstoque && metaEstoque.page > 1) {
      buscarEstoqueBaixo(metaEstoque.page - 1);
    }
  }

  function proximaPaginaEstoque() {
    if (
      metaEstoque &&
      metaEstoque.page * metaEstoque.limit < metaEstoque.total
    ) {
      buscarEstoqueBaixo(metaEstoque.page + 1);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            <IconCalendar />
            Relatórios
          </h1>
          <p>Consulte vendas por período e produtos com estoque baixo.</p>
        </div>
      </div>

      {erro && <div className="alert alert--error">{erro}</div>}

      <div className="card filters">
        <div>
          <div className="lbl">Data inicial</div>
          <input
            className="input"
            type="date"
            aria-label="Data inicial"
            value={dataInicio}
            onChange={(event) => setDataInicio(event.target.value)}
          />
        </div>

        <div>
          <div className="lbl">Data final</div>
          <input
            className="input"
            type="date"
            aria-label="Data final"
            value={dataFim}
            onChange={(event) => setDataFim(event.target.value)}
          />
        </div>

        <button
          className="btn"
          type="button"
          onClick={buscarRelatorioVendas}
          disabled={carregandoVendas}
        >
          {carregandoVendas ? 'Gerando...' : 'Gerar relatório'}
        </button>
      </div>

      <div className="reports">
        <section className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconCalendar />
            Relatório de vendas por período
          </h2>

          {!relatorioVendas ? (
            <p className="empty">
              Informe o período e clique em "Gerar relatório".
            </p>
          ) : (
            <>
              <div className="kpis" style={{ margin: '0 0 14px' }}>
                <article className="card kpi">
                  <div className="label">Total de vendas</div>
                  <div className="value">{relatorioVendas.total_vendas}</div>
                </article>

                <article className="card kpi">
                  <div className="label">Total faturado</div>
                  <div className="value">
                    {formatarValor(relatorioVendas.total_faturado)}
                  </div>
                </article>

                <article className="card kpi">
                  <div className="label">Período</div>
                  <div className="value" style={{ fontSize: 14 }}>
                    {formatarData(relatorioVendas.periodo.inicio)} até{' '}
                    {formatarData(relatorioVendas.periodo.fim)}
                  </div>
                </article>
              </div>

              {relatorioVendas.vendas_por_dia.length === 0 ? (
                <p className="empty">
                  Nenhuma venda concluída no período informado.
                </p>
              ) : (
                <div className="table-scroll">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Quantidade de vendas</th>
                        <th>Total faturado</th>
                      </tr>
                    </thead>

                    <tbody>
                      {relatorioVendas.vendas_por_dia.map((item) => (
                        <tr key={item.data}>
                          <td>{formatarData(item.data)}</td>
                          <td>{item.quantidade}</td>
                          <td>{formatarValor(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconWarning />
            Estoque baixo
          </h2>

          <div className="filters" style={{ marginBottom: 14 }}>
            <div>
              <div className="lbl">Limite</div>
              <input
                className="input"
                type="number"
                min="0"
                aria-label="Limite de estoque"
                value={limiteEstoque}
                onChange={(event) =>
                  setLimiteEstoque(Number(event.target.value))
                }
              />
            </div>

            <button
              className="btn"
              type="button"
              onClick={() => buscarEstoqueBaixo(1)}
              disabled={carregandoEstoque}
            >
              {carregandoEstoque ? 'Consultando...' : 'Consultar estoque'}
            </button>
          </div>

          {!metaEstoque ? (
            <p className="empty">
              Clique em "Consultar estoque" para listar os produtos.
            </p>
          ) : estoqueBaixo.length === 0 ? (
            <p className="empty">
              Nenhum produto com estoque dentro do limite informado.
            </p>
          ) : (
            <>
              <div className="table-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Tamanho</th>
                      <th>Quantidade</th>
                      <th>Fornecedor</th>
                    </tr>
                  </thead>

                  <tbody>
                    {estoqueBaixo.map((produto) => (
                      <tr key={produto.id}>
                        <td className="strong">{produto.nome}</td>
                        <td>{produto.tamanho}</td>
                        <td>{produto.quantidade}</td>
                        <td>{produto.fornecedor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-foot">
                <span>Total de produtos: {metaEstoque.total}</span>

                <div className="pager">
                  <button
                    type="button"
                    onClick={paginaAnteriorEstoque}
                    disabled={metaEstoque.page <= 1}
                  >
                    ‹
                  </button>
                  <span className="cur">{metaEstoque.page}</span>
                  <button
                    type="button"
                    onClick={proximaPaginaEstoque}
                    disabled={
                      metaEstoque.page * metaEstoque.limit >= metaEstoque.total
                    }
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
