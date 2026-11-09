import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../services/api';
import { IconCheck } from '../../components/common/Icons';
import {
  formatCep,
  formatCnpj,
  formatContato,
} from '../../utils/formatters';

interface EnderecoForm {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  complemento: string;
}

interface FornecedorForm {
  nome: string;
  cnpj: string;
  email: string;
  contato: string;
  endereco: EnderecoForm;
}

interface FornecedorResponse extends FornecedorForm {
  id: string;
  status: 'ativo' | 'inativo';
}

interface ApiResponse<T> {
  data: T;
}

interface EnderecoViacep {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
}

const formularioInicial: FornecedorForm = {
  nome: '',
  cnpj: '',
  email: '',
  contato: '',
  endereco: {
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    complemento: '',
  },
};

export function CadastroFornecedores() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicao = Boolean(id);

  const [formulario, setFormulario] = useState<FornecedorForm>(formularioInicial);
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;

    const carregarFornecedor = async () => {
      try {
        setCarregando(true);
        setErro('');

        const response = await api.get<ApiResponse<FornecedorResponse>>(
          `/fornecedores/${id}`,
        );
        const fornecedor = response.data.data;

        setFormulario({
          nome: fornecedor.nome ?? '',
          cnpj: formatCnpj(fornecedor.cnpj ?? ''),
          email: fornecedor.email ?? '',
          contato: formatContato(fornecedor.contato ?? ''),
          endereco: {
            cep: formatCep(fornecedor.endereco?.cep ?? ''),
            rua: fornecedor.endereco?.rua ?? '',
            numero: fornecedor.endereco?.numero ?? '',
            bairro: fornecedor.endereco?.bairro ?? '',
            cidade: fornecedor.endereco?.cidade ?? '',
            estado: fornecedor.endereco?.estado ?? '',
            pais: fornecedor.endereco?.pais ?? 'Brasil',
            complemento: fornecedor.endereco?.complemento ?? '',
          },
        });

        setStatus(fornecedor.status);
      } catch (error) {
        console.error(error);
        setErro('Não foi possível carregar o fornecedor.');
      } finally {
        setCarregando(false);
      }
    };

    carregarFornecedor();
  }, [id]);

  const alterarCampo = (
    campo: 'nome' | 'cnpj' | 'email' | 'contato',
    valor: string,
  ) => {
    let valorFormatado = valor;

    if (campo === 'cnpj') valorFormatado = formatCnpj(valor);
    if (campo === 'contato') valorFormatado = formatContato(valor);

    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valorFormatado,
    }));
  };

  const alterarEndereco = (campo: keyof EnderecoForm, valor: string) => {
    let valorFormatado = valor;

    if (campo === 'cep') valorFormatado = formatCep(valor);

    setFormulario((anterior) => ({
      ...anterior,
      endereco: {
        ...anterior.endereco,
        [campo]: valorFormatado,
      },
    }));
  };

  const buscarEnderecoPorCep = async () => {
    const cepLimpo = formulario.endereco.cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      setBuscandoCep(true);

      const response = await api.get<ApiResponse<EnderecoViacep>>(
        `/viacep/${cepLimpo}`,
      );
      const endereco = response.data.data;

      setFormulario((anterior) => ({
        ...anterior,
        endereco: {
          ...anterior.endereco,
          rua: endereco.rua || anterior.endereco.rua,
          bairro: endereco.bairro || anterior.endereco.bairro,
          cidade: endereco.cidade || anterior.endereco.cidade,
          estado: endereco.estado || anterior.endereco.estado,
          complemento:
            endereco.complemento || anterior.endereco.complemento,
        },
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setBuscandoCep(false);
    }
  };

  const validarFormulario = () => {
    if (!formulario.nome.trim()) {
      return 'Informe o nome do fornecedor.';
    }

    if (formulario.cnpj.replace(/\D/g, '').length !== 14) {
      return 'Informe um CNPJ válido.';
    }

    const enderecoPreenchido =
      formulario.endereco.cep ||
      formulario.endereco.rua ||
      formulario.endereco.numero ||
      formulario.endereco.bairro ||
      formulario.endereco.cidade ||
      formulario.endereco.estado;

    if (enderecoPreenchido) {
      if (formulario.endereco.cep.replace(/\D/g, '').length !== 8) {
        return 'CEP inválido.';
      }
      if (
        !formulario.endereco.rua.trim() ||
        !formulario.endereco.numero.trim() ||
        !formulario.endereco.bairro.trim() ||
        !formulario.endereco.cidade.trim() ||
        !formulario.endereco.estado.trim()
      ) {
        return 'Preencha os campos obrigatórios do endereço.';
      }
    }

    return '';
  };

  const salvar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setSalvando(true);
      setErro('');

      const trimOuVazio = (v: string) => v.trim() || undefined;

      const e = formulario.endereco;
      const enderecoPreenchido =
        !!(e.cep || e.rua || e.numero || e.bairro || e.cidade || e.estado);

      const payload: Record<string, unknown> = {
        nome: formulario.nome.trim(),
        cnpj: formulario.cnpj,
        status,
        email: trimOuVazio(formulario.email.toLowerCase()),
        contato: trimOuVazio(formulario.contato),
      };

      if (enderecoPreenchido) {
        payload.cep = e.cep;
        payload.rua = trimOuVazio(e.rua);
        payload.numero = trimOuVazio(e.numero);
        payload.bairro = trimOuVazio(e.bairro);
        payload.cidade = trimOuVazio(e.cidade);
        payload.estado = trimOuVazio(e.estado.toUpperCase());
        payload.pais = trimOuVazio(e.pais);
        payload.complemento = trimOuVazio(e.complemento);
      }

      if (modoEdicao && id) {
        await api.patch(`/fornecedores/${id}`, payload);
      } else {
        await api.post('/fornecedores', payload);
      }

      navigate('/fornecedores');
    } catch (error: unknown) {
      console.error(error);

      const mensagem = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

      if (Array.isArray(mensagem)) {
        setErro(mensagem.join(' '));
      } else {
        setErro(mensagem || 'Não foi possível salvar o fornecedor.');
      }
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <p className="empty">Carregando fornecedor...</p>;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {modoEdicao ? 'Editar Fornecedor' : 'Cadastro de Fornecedores'}
          </h1>
        </div>

        <button
          className="btn"
          type="submit"
          form="form-fornecedor"
          disabled={salvando}
        >
          <IconCheck />
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <form id="form-fornecedor" onSubmit={salvar}>
        {erro && <div className="alert alert--error">{erro}</div>}

        <section className="card form-card">
          <h2 className="lg">Dados do Fornecedor</h2>

          <div className="grid c2">
            <div className="field">
              <label htmlFor="nome">Nome</label>
              <input
                className="input"
                id="nome"
                type="text"
                placeholder="Nome Fornecedor"
                maxLength={255}
                value={formulario.nome}
                onChange={(event) => alterarCampo('nome', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="cnpj">CNPJ</label>
              <input
                className="input"
                id="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                maxLength={18}
                value={formulario.cnpj}
                onChange={(event) => alterarCampo('cnpj', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                className="input"
                id="email"
                type="email"
                placeholder="email@fornecedor.com"
                value={formulario.email}
                onChange={(event) => alterarCampo('email', event.target.value)}
              />
            </div>

            <div className="grid c2" style={{ gap: 14 }}>
              <div className="field">
                <label htmlFor="contato">Contato</label>
                <input
                  className="input"
                  id="contato"
                  type="text"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  value={formulario.contato}
                  onChange={(event) =>
                    alterarCampo('contato', event.target.value)
                  }
                />
              </div>

              <div className="field">
                <span className="label-s">Status</span>
                <div className="radios">
                  <label className={status === 'ativo' ? 'on' : ''}>
                    <input
                      type="radio"
                      name="status"
                      value="ativo"
                      checked={status === 'ativo'}
                      onChange={() => setStatus('ativo')}
                    />
                    Ativo
                  </label>
                  <label className={status === 'inativo' ? 'offc' : ''}>
                    <input
                      type="radio"
                      name="status"
                      value="inativo"
                      checked={status === 'inativo'}
                      onChange={() => setStatus('inativo')}
                    />
                    Inativo
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card form-card">
          <h2 className="lg">Endereço</h2>

          <div className="grid c2">
            <div className="field">
              <label htmlFor="cep">CEP</label>
              <input
                className="input"
                id="cep"
                type="text"
                placeholder="00000-000"
                maxLength={9}
                value={formulario.endereco.cep}
                onChange={(event) =>
                  alterarEndereco('cep', event.target.value)
                }
                onBlur={buscarEnderecoPorCep}
              />
              {buscandoCep ? (
                <span className="label-s">Buscando CEP...</span>
              ) : (
                <span className="label-s">
                  Ao sair do campo, o CEP preenche rua, bairro, cidade e
                  estado.
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="rua">Rua</label>
              <input
                className="input"
                id="rua"
                type="text"
                placeholder="Rua"
                value={formulario.endereco.rua}
                onChange={(event) =>
                  alterarEndereco('rua', event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="numero">Número</label>
              <input
                className="input"
                id="numero"
                type="text"
                placeholder="Número"
                maxLength={10}
                value={formulario.endereco.numero}
                onChange={(event) =>
                  alterarEndereco('numero', event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="bairro">Bairro</label>
              <input
                className="input"
                id="bairro"
                type="text"
                placeholder="Bairro"
                value={formulario.endereco.bairro}
                onChange={(event) =>
                  alterarEndereco('bairro', event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="cidade">Cidade</label>
              <input
                className="input"
                id="cidade"
                type="text"
                placeholder="Cidade"
                value={formulario.endereco.cidade}
                onChange={(event) =>
                  alterarEndereco('cidade', event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="estado">Estado</label>
              <input
                className="input"
                id="estado"
                type="text"
                placeholder="Estado"
                maxLength={2}
                value={formulario.endereco.estado}
                onChange={(event) =>
                  alterarEndereco(
                    'estado',
                    event.target.value.toUpperCase(),
                  )
                }
              />
            </div>

            <div className="field">
              <label htmlFor="pais">País</label>
              <input
                className="input"
                id="pais"
                type="text"
                placeholder="Brasil"
                value={formulario.endereco.pais}
                onChange={(event) =>
                  alterarEndereco('pais', event.target.value)
                }
              />
            </div>

            <div className="field span2">
              <label htmlFor="complemento">Complemento</label>
              <input
                className="input"
                id="complemento"
                type="text"
                placeholder="Ex: Ap 105, Bloco 2, Sala 2..."
                value={formulario.endereco.complemento}
                onChange={(event) =>
                  alterarEndereco('complemento', event.target.value)
                }
              />
            </div>
          </div>
        </section>

        <div className="page-head">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => navigate('/fornecedores')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}
