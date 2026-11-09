import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../services/api';
import { IconCheck } from '../../components/common/Icons';
import { formatCpfCnpj, formatContato } from '../../utils/formatters';

interface ClienteDetalhe {
  id: string;
  nome: string;
  cpf_cnpj: string;
  email: string | null;
  telefone: string | null;
  observacao: string | null;
  status: 'ativo' | 'inativo';
}

interface Formulario {
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  observacao: string;
  status: 'ativo' | 'inativo';
}

interface ApiResponse<T> {
  data: T;
}

const formularioInicial: Formulario = {
  nome: '',
  cpf_cnpj: '',
  email: '',
  telefone: '',
  observacao: '',
  status: 'ativo',
};

export function CadastroCliente() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicao = Boolean(id);

  const [formulario, setFormulario] = useState<Formulario>(formularioInicial);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;

    const carregarCliente = async () => {
      try {
        setCarregando(true);
        setErro('');

        const response = await api.get<ApiResponse<ClienteDetalhe>>(
          `/clientes/${id}`,
        );
        const cliente = response.data.data;

        setFormulario({
          nome: cliente.nome ?? '',
          cpf_cnpj: formatCpfCnpj(cliente.cpf_cnpj ?? ''),
          email: cliente.email ?? '',
          telefone: formatContato(cliente.telefone ?? ''),
          observacao: cliente.observacao ?? '',
          status: cliente.status ?? 'ativo',
        });
      } catch (error) {
        console.error(error);
        setErro('Não foi possível carregar o cliente.');
      } finally {
        setCarregando(false);
      }
    };

    carregarCliente();
  }, [id]);

  const alterarCampo = (
    campo: 'nome' | 'cpf_cnpj' | 'email' | 'telefone' | 'observacao',
    valor: string,
  ) => {
    let valorFormatado = valor;

    if (campo === 'cpf_cnpj') valorFormatado = formatCpfCnpj(valor);
    if (campo === 'telefone') valorFormatado = formatContato(valor);

    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valorFormatado,
    }));
  };

  const validar = () => {
    if (!formulario.nome.trim()) {
      return 'Informe o nome do cliente.';
    }

    const digitos = formulario.cpf_cnpj.replace(/\D/g, '');
    if (digitos.length !== 11 && digitos.length !== 14) {
      return 'Informe um CPF ou CNPJ válido.';
    }

    return '';
  };

  const salvar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validacao = validar();

    if (validacao) {
      setErro(validacao);
      return;
    }

    try {
      setSalvando(true);
      setErro('');

      const trimOuVazio = (v: string) => v.trim() || undefined;

      const payload: Record<string, unknown> = {
        nome: formulario.nome.trim(),
        cpf_cnpj: formulario.cpf_cnpj,
        email: trimOuVazio(formulario.email.toLowerCase()),
        telefone: trimOuVazio(formulario.telefone),
        observacao: trimOuVazio(formulario.observacao),
      };

      if (modoEdicao && id) {
        payload.status = formulario.status;
        await api.patch(`/clientes/${id}`, payload);
      } else {
        await api.post('/clientes', payload);
      }

      navigate('/clientes');
    } catch (error: unknown) {
      console.error(error);

      const mensagem = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

      setErro(
        Array.isArray(mensagem)
          ? mensagem.join(' ')
          : mensagem || 'Não foi possível salvar o cliente.',
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <p className="empty">Carregando cliente...</p>;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{modoEdicao ? 'Editar Cliente' : 'Cadastro de Clientes'}</h1>
        </div>

        <button
          className="btn"
          type="submit"
          form="form-cliente"
          disabled={salvando}
        >
          <IconCheck />
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <form id="form-cliente" onSubmit={salvar}>
        {erro && <div className="alert alert--error">{erro}</div>}

        <section className="card form-card">
          <h2 className="lg">Dados do Cliente</h2>

          <div className="grid c2">
            <div className="field">
              <label htmlFor="nome">Nome</label>
              <input
                className="input"
                id="nome"
                type="text"
                placeholder="Nome do cliente"
                maxLength={255}
                value={formulario.nome}
                onChange={(event) => alterarCampo('nome', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="cpf_cnpj">CPF ou CNPJ</label>
              <input
                className="input"
                id="cpf_cnpj"
                type="text"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                maxLength={18}
                value={formulario.cpf_cnpj}
                onChange={(event) =>
                  alterarCampo('cpf_cnpj', event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                className="input"
                id="email"
                type="email"
                placeholder="email@cliente.com"
                value={formulario.email}
                onChange={(event) => alterarCampo('email', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="telefone">Telefone</label>
              <input
                className="input"
                id="telefone"
                type="text"
                placeholder="(00) 00000-0000"
                maxLength={15}
                value={formulario.telefone}
                onChange={(event) =>
                  alterarCampo('telefone', event.target.value)
                }
              />
            </div>

            <div className="field span2">
              <label htmlFor="observacao">Observação</label>
              <textarea
                className="input"
                id="observacao"
                placeholder="Anotações sobre o cliente (opcional)"
                rows={3}
                value={formulario.observacao}
                onChange={(event) =>
                  alterarCampo('observacao', event.target.value)
                }
              />
            </div>

            {modoEdicao && (
              <div className="field">
                <span className="label-s">Status</span>
                <div className="radios">
                  <label className={formulario.status === 'ativo' ? 'on' : ''}>
                    <input
                      type="radio"
                      name="status"
                      value="ativo"
                      checked={formulario.status === 'ativo'}
                      onChange={() =>
                        setFormulario((anterior) => ({
                          ...anterior,
                          status: 'ativo',
                        }))
                      }
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
                      onChange={() =>
                        setFormulario((anterior) => ({
                          ...anterior,
                          status: 'inativo',
                        }))
                      }
                    />
                    Inativo
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="page-head">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => navigate('/clientes')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}
