import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  IconVendas,
  IconEstoque,
  IconWarning,
} from '../../components/common/Icons';

interface DashboardDados {
  vendas_hoje: {
    quantidade: number;
    total: number;
  };
  total_produtos: number;
  estoque_baixo: number;
}

interface ProdutoEstoqueBaixo {
  id: string;
  nome: string;
  tamanho: string;
  quantidade: number;
}

export function Dashboard() {
  const [dados, setDados] = useState<DashboardDados | null>(null);
  const [estoqueBaixo, setEstoqueBaixo] = useState<ProdutoEstoqueBaixo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);
        setErro('');

        const [dashboardResponse, estoqueResponse] = await Promise.all([
          api.get('/dashboard'),
          api.get('/relatorios/estoque-baixo', {
            params: { limite: 5, page: 1 },
          }),
        ]);

        setDados(dashboardResponse.data.data);
        setEstoqueBaixo(estoqueResponse.data.data ?? []);
      } catch {
        setErro('Não foi possível carregar os dados do dashboard.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  function formatarValor(valor: number) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral do seu negócio</p>
        </div>
      </div>

      {erro && <div className="alert alert--error">{erro}</div>}

      {carregando ? (
        <p className="empty">Carregando dashboard...</p>
      ) : dados ? (
        <section className="kpis">
          <article className="card kpi">
            <span className="badge">
              <IconVendas />
            </span>
            <div className="label">Faturamento de Hoje</div>
            <div className="value">{formatarValor(dados.vendas_hoje.total)}</div>
            <div className="hint">
              {dados.vendas_hoje.quantidade} venda
              {dados.vendas_hoje.quantidade === 1 ? '' : 's'} concluída
              {dados.vendas_hoje.quantidade === 1 ? '' : 's'} hoje
            </div>
          </article>

          <article className="card kpi">
            <span className="badge">
              <IconEstoque />
            </span>
            <div className="label">Total de Produtos</div>
            <div className="value">{dados.total_produtos}</div>
            <div className="hint">Produtos cadastrados no catálogo</div>
          </article>

          <article className="card">
            <div className="low-title">
              <IconWarning />
              Produtos com estoque baixo
            </div>

            {estoqueBaixo.length > 0 ? (
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd.</th>
                  </tr>
                </thead>
                <tbody>
                  {estoqueBaixo.slice(0, 5).map((produto) => (
                    <tr key={produto.id}>
                      <td>
                        {produto.nome} ({produto.tamanho})
                      </td>
                      <td>{produto.quantidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty">Nenhum produto com estoque baixo.</p>
            )}

            <Link className="see-all" to="/estoque">
              Ver todos →
            </Link>
          </article>
        </section>
      ) : null}
    </>
  );
}
