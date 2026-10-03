import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

interface DashboardDados {
  vendas_hoje: {
    quantidade: number;
    total: number;
  };
  total_produtos: number;
  estoque_baixo: number;
}

export function Dashboard() {
  const { user } = useAuth();

  const [dados, setDados] =
    useState<DashboardDados | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);
        setErro('');

        const response = await api.get('/dashboard');

        setDados(response.data.data);
      } catch {
        setErro(
          'Não foi possível carregar os dados do dashboard.',
        );
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
    <div className="dashboard">
      <div className="dashboard__cabecalho">
        <h1>Dashboard</h1>

        <p>
          Bem-vindo, {user?.nome}!
        </p>
      </div>

      {erro && (
        <div className="dashboard__erro">
          {erro}
        </div>
      )}

      {carregando ? (
        <p>Carregando dashboard...</p>
      ) : dados ? (
        <div className="dashboard__cards">
          <div className="dashboard__card">
            <h3>Vendas de hoje</h3>

            <strong>
              {dados.vendas_hoje.quantidade}
            </strong>

            <span>
              vendas concluídas
            </span>
          </div>

          <div className="dashboard__card">
            <h3>Faturamento de hoje</h3>

            <strong>
              {formatarValor(
                dados.vendas_hoje.total,
              )}
            </strong>

            <span>
              vendas concluídas
            </span>
          </div>

          <div className="dashboard__card">
            <h3>Total de produtos</h3>

            <strong>
              {dados.total_produtos}
            </strong>

            <span>
              produtos cadastrados
            </span>
          </div>

          <div className="dashboard__card">
            <h3>Estoque baixo</h3>

            <strong>
              {dados.estoque_baixo}
            </strong>

            <span>
              produtos com até 5 unidades
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}