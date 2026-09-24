import { useAuth } from '../../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.nome}!</p>
      <p>Esta é a tela inicial do sistema UZZE.</p>
    </div>
  );
}
