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

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
