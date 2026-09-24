export interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  foto?: string;
  tipo: 'vendedor' | 'admin';
  status: 'ativo' | 'inativo';
  ultimo_acesso?: string;
  created_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  usuario: Usuario;
}
