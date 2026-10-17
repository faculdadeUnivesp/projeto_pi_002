import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../services/api';
import { IconCheck } from '../../components/common/Icons';
import { formatCpf } from '../../utils/formatters';

interface UsuarioDetalhe {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  tipo: 'vendedor' | 'admin';
  status: 'ativo' | 'inativo';
}

interface Formulario {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmacao: string;
  tipo: 'vendedor' | 'admin';
  status: 'ativo' | 'inativo';
}

interface ApiResponse<T> {
  data: T;
}

const formularioInicial: Formulario = {
  nome: '',
  email: '',
  cpf: '',
  senha: '',
  confirmacao: '',
  tipo: 'vendedor',
  status: 'ativo',
};

export function CadastroUsuario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicao = Boolean(id);

  const [formulario, setFormulario] = useState<Formulario>(formularioInicial);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;

    const carregarUsuario = async () => {
      try {
        setCarregando(true);
        setErro('');

        const response = await api.get<ApiResponse<UsuarioDetalhe>>(
          `/usuarios/${id}`,
        );
        const usuario = response.data.data;

        setFormulario({
          nome: usuario.nome ?? '',
          email: usuario.email ?? '',
          cpf: usuario.cpf ?? '',
          senha: '',
          confirmacao: '',
          tipo: usuario.tipo ?? 'vendedor',
          status: usuario.status ?? 'ativo',
        });
      } catch (error) {
        console.error(error);
        setErro('Não foi possível carregar o usuário.');
      } finally {
        setCarregando(false);
      }
    };

    carregarUsuario();
  }, [id]);

  const alterarCampo = <C extends keyof Formulario>(
    campo: C,
    valor: Formulario[C],
  ) => {
    let valorFormatado: Formulario[C] = valor;

    if (campo === 'cpf' && typeof valor === 'string') {
      valorFormatado = formatCpf(valor) as Formulario[C];
    }

    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valorFormatado,
    }));
  };

  const validar = () => {
    if (!formulario.nome.trim() || !formulario.email.trim()) {
      return 'Preencha nome e e-mail.';
    }

    if (formulario.cpf.replace(/\D/g, '').length !== 11) {
      return 'Informe um CPF válido.';
    }

    if (!modoEdicao) {
      if (!formulario.senha) {
        return 'Informe a senha.';
      }

      if (formulario.senha.length < 6) {
        return 'A senha deve possuir no mínimo 6 caracteres.';
      }

      if (formulario.senha !== formulario.confirmacao) {
        return 'A confirmação de senha não confere.';
      }
    }

    return '';
  };

  const salvar = async (event: FormEvent) => {
    event.preventDefault();

    const validacao = validar();

    if (validacao) {
      setErro(validacao);
      return;
    }

    try {
      setSalvando(true);
      setErro('');

      if (modoEdicao && id) {
        await api.patch(`/usuarios/${id}`, {
          nome: formulario.nome.trim(),
          email: formulario.email.trim(),
          tipo: formulario.tipo,
          status: formulario.status,
        });
      } else {
        await api.post('/usuarios', {
          nome: formulario.nome.trim(),
          cpf: formulario.cpf,
          email: formulario.email.trim(),
          senha: formulario.senha,
          tipo: formulario.tipo,
        });
      }

      navigate('/usuarios');
    } catch (error: unknown) {
      console.error(error);

      const mensagem = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

      setErro(
        Array.isArray(mensagem)
          ? mensagem.join(' ')
          : mensagem || 'Não foi possível salvar o usuário.',
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <p className="empty">Carregando usuário...</p>;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{modoEdicao ? 'Editar Usuário' : 'Cadastro de Usuários'}</h1>
        </div>

        <button
          className="btn"
          type="submit"
          form="form-usuario"
          disabled={salvando}
        >
          <IconCheck />
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <form id="form-usuario" onSubmit={salvar}>
        {erro && <div className="alert alert--error">{erro}</div>}

        <section className="card form-card">
          <h2 className="lg">Dados do Usuário</h2>

          <div className="grid c2">
            <div style={{ display: 'grid', gap: 14 }}>
              <div className="field">
                <label htmlFor="nome">Nome e sobrenome</label>
                <input
                  className="input"
                  id="nome"
                  type="text"
                  placeholder="Digite o nome do usuário"
                  value={formulario.nome}
                  onChange={(event) => alterarCampo('nome', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input
                  className="input"
                  id="email"
                  type="email"
                  placeholder="Informe o e-mail"
                  value={formulario.email}
                  onChange={(event) =>
                    alterarCampo('email', event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="cpf">CPF</label>
                <input
                  className="input"
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={formulario.cpf}
                  onChange={(event) => alterarCampo('cpf', event.target.value)}
                  disabled={modoEdicao}
                  readOnly={modoEdicao}
                />
              </div>

              {!modoEdicao && (
                <>
                  <div className="field">
                    <label htmlFor="senha">Senha</label>
                    <input
                      className="input"
                      id="senha"
                      type="password"
                      placeholder="Digite a senha"
                      value={formulario.senha}
                      onChange={(event) =>
                        alterarCampo('senha', event.target.value)
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="confirmacao">Confirmação de Senha</label>
                    <input
                      className="input"
                      id="confirmacao"
                      type="password"
                      placeholder="Repita a senha"
                      value={formulario.confirmacao}
                      onChange={(event) =>
                        alterarCampo('confirmacao', event.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div
              style={{ display: 'grid', gap: 14, alignContent: 'start' }}
            >
              <div className="field">
                <label htmlFor="tipo">Perfil de Acesso</label>
                <select
                  className="select"
                  id="tipo"
                  value={formulario.tipo}
                  onChange={(event) =>
                    alterarCampo(
                      'tipo',
                      event.target.value as Formulario['tipo'],
                    )
                  }
                >
                  <option value="">Selecione o Perfil</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {modoEdicao && (
                <div className="field">
                  <span className="label-s">Status</span>
                  <div className="radios">
                    <label
                      className={formulario.status === 'ativo' ? 'on' : ''}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="ativo"
                        checked={formulario.status === 'ativo'}
                        onChange={() => alterarCampo('status', 'ativo')}
                      />
                      Ativo
                    </label>

                    <label
                      className={formulario.status === 'inativo' ? 'offc' : ''}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="inativo"
                        checked={formulario.status === 'inativo'}
                        onChange={() => alterarCampo('status', 'inativo')}
                      />
                      Inativo
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="page-head">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => navigate('/usuarios')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}
