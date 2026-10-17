import api from '../services/api';
import type { LoginResponse, Usuario } from '../types/auth';

export async function login(
  cpf: string,
  senha: string,
): Promise<LoginResponse> {
  const response = await api.post<{ data: LoginResponse }>('/auth/login', {
    cpf,
    senha,
  });
  return response.data.data;
}

export async function getMe(): Promise<Usuario> {
  const response = await api.get<{ data: Usuario }>('/auth/me');
  return response.data.data;
}

export async function updateMe(
  data: Partial<Pick<Usuario, 'nome' | 'email' | 'foto'>>,
  foto?: File,
): Promise<Usuario> {
  let payload: Partial<Pick<Usuario, 'nome' | 'email' | 'foto'>> | FormData =
    data;

  if (foto) {
    const formData = new FormData();

    if (data.nome !== undefined) {
      formData.append('nome', data.nome);
    }

    if (data.email !== undefined) {
      formData.append('email', data.email);
    }

    formData.append('foto', foto);

    payload = formData;
  }

  const response = await api.patch<{ data: Usuario }>('/auth/me', payload);
  return response.data.data;
}

export async function alterarSenha(
  senhaAtual: string,
  novaSenha: string,
): Promise<{ message: string }> {
  const response = await api.post<{ data: { message: string } }>(
    '/auth/alterar-senha',
    { senhaAtual, novaSenha },
  );
  return response.data.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
