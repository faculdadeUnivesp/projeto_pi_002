import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../services/api';
import './CadastroFornecedores.css';

interface EnderecoForm {
  cep: string;
  rua: string;
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

const formularioInicial: FornecedorForm = {
  nome: '',
  cnpj: '',
  email: '',
  contato: '',
  endereco: {
    cep: '',
    rua: '',
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
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;

    const carregarFornecedor = async () => {
      try {
        setCarregando(true);
        setErro('');

        const response = await api.get<ApiResponse<FornecedorResponse>>(`/fornecedores/${id}`);
        const fornecedor = response.data.data;

        setFormulario({
          nome: fornecedor.nome ?? '',
          cnpj: formatarCnpj(fornecedor.cnpj ?? ''),
          email: fornecedor.email ?? '',
          contato: formatarContato(fornecedor.contato ?? ''),
          endereco: {
            cep: formatarCep(fornecedor.endereco?.cep ?? ''),
            rua: fornecedor.endereco?.rua ?? '',
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

  const alterarCampo = (campo: 'nome' | 'cnpj' | 'email' | 'contato', valor: string) => {
    let valorFormatado = valor;

    if (campo === 'cnpj') valorFormatado = formatarCnpj(valor);
    if (campo === 'contato') valorFormatado = formatarContato(valor);

    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valorFormatado,
    }));
  };

  const alterarEndereco = (campo: keyof EnderecoForm, valor: string) => {
    let valorFormatado = valor;

    if (campo === 'cep') valorFormatado = formatarCep(valor);

    setFormulario((anterior) => ({
      ...anterior,
      endereco: {
        ...anterior.endereco,
        [campo]: valorFormatado,
      },
    }));
  };

  const consultarCep = async () => {
    const cep = formulario.endereco.cep.replace(/\D/g, '');

    if (cep.length !== 8) return;

    /*
      Aqui você pode integrar uma API de CEP futuramente.
    */
  };

  const validarFormulario = () => {
    if (!formulario.nome.trim() || !formulario.cnpj.trim() || !formulario.email.trim() || !formulario.contato.trim()) {
      return 'Preencha todos os dados obrigatórios do fornecedor.';
    }

    if (formulario.cnpj.replace(/\D/g, '').length !== 14) {
      return 'Informe um CNPJ válido.';
    }

    if (formulario.endereco.cep.replace(/\D/g, '').length !== 8) {
      return 'Informe um CEP válido.';
    }

    if (
      !formulario.endereco.rua.trim() ||
      !formulario.endereco.bairro.trim() ||
      !formulario.endereco.cidade.trim() ||
      !formulario.endereco.estado.trim() ||
      !formulario.endereco.pais.trim()
    ) {
      return 'Preencha os campos obrigatórios do endereço.';
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

      const payload = {
        nome: formulario.nome.trim(),
        cnpj: formulario.cnpj.replace(/\D/g, ''),
        email: formulario.email.trim().toLowerCase(),
        contato: formulario.contato.replace(/\D/g, ''),
        endereco: {
          cep: formulario.endereco.cep.replace(/\D/g, ''),
          rua: formulario.endereco.rua.trim(),
          bairro: formulario.endereco.bairro.trim(),
          cidade: formulario.endereco.cidade.trim(),
          estado: formulario.endereco.estado.trim(),
          pais: formulario.endereco.pais.trim(),
          complemento: formulario.endereco.complemento.trim() || undefined,
        },
      };

      if (modoEdicao && id) {
        await api.patch(`/fornecedores/${id}`, payload);
      } else {
        await api.post('/fornecedores', payload);
      }

      navigate('/fornecedores');
    } catch (error: any) {
      console.error(error);

      const mensagem = error.response?.data?.message;

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
    return <div className="cadastro-fornecedor__carregando">Carregando fornecedor...</div>;
  }

  return (
    <section className="cadastro-fornecedor">
      <form onSubmit={salvar}>
        <div className="cadastro-fornecedor__topo">
          <h1>{modoEdicao ? 'Editar Fornecedor' : 'Cadastro de Fornecedores'}</h1>

          <button type="submit" className="cadastro-fornecedor__salvar" disabled={salvando}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>

            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {erro && <div className="cadastro-fornecedor__erro">{erro}</div>}

        <div className="cadastro-fornecedor__card">
          <h2>Dados do Fornecedor</h2>

          <div className="cadastro-fornecedor__grid">
            <div className="campo campo--metade">
              <label htmlFor="nome">Nome</label>
              <input id="nome" type="text" value={formulario.nome} onChange={(event) => alterarCampo('nome', event.target.value)} placeholder="Nome Fornecedor" maxLength={255} />
            </div>

            <div className="campo campo--metade">
              <label htmlFor="cnpj">CNPJ</label>
              <input id="cnpj" type="text" value={formulario.cnpj} onChange={(event) => alterarCampo('cnpj', event.target.value)} placeholder="00.000.000/0000-00" maxLength={18} />
            </div>

            <div className="campo campo--metade">
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" value={formulario.email} onChange={(event) => alterarCampo('email', event.target.value)} placeholder="email@fornecedor.com" />
            </div>

            <div className="cadastro-fornecedor__linha-contato">
              <div className="campo">
                <label htmlFor="contato">Contato</label>
                <input id="contato" type="text" value={formulario.contato} onChange={(event) => alterarCampo('contato', event.target.value)} placeholder="(00) 00000-0000" maxLength={15} />
              </div>

              <div className="campo cadastro-fornecedor__status-campo">
                <label>Status</label>

                <div className="cadastro-fornecedor__status">
                  <span className={`status-radio status-radio--${status}`} />
                  <span className={status === 'ativo' ? 'status-texto--ativo' : 'status-texto--inativo'}>
                    {status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cadastro-fornecedor__card">
          <h2>Endereço</h2>

          <div className="cadastro-fornecedor__grid">
            <div className="campo campo--metade">
              <label htmlFor="cep">CEP</label>
              <input id="cep" type="text" value={formulario.endereco.cep} onChange={(event) => alterarEndereco('cep', event.target.value)} onBlur={consultarCep} placeholder="00000-000" maxLength={9} />
            </div>

            <div className="campo campo--metade">
              <label htmlFor="rua">Rua</label>
              <input id="rua" type="text" value={formulario.endereco.rua} onChange={(event) => alterarEndereco('rua', event.target.value)} placeholder="Rua" />
            </div>

            <div className="campo campo--metade">
              <label htmlFor="bairro">Bairro</label>
              <input id="bairro" type="text" value={formulario.endereco.bairro} onChange={(event) => alterarEndereco('bairro', event.target.value)} placeholder="Bairro" />
            </div>

            <div className="campo campo--metade">
              <label htmlFor="cidade">Cidade</label>
              <input id="cidade" type="text" value={formulario.endereco.cidade} onChange={(event) => alterarEndereco('cidade', event.target.value)} placeholder="Cidade" />
            </div>

            <div className="campo campo--metade">
              <label htmlFor="estado">Estado</label>
              <input id="estado" type="text" value={formulario.endereco.estado} onChange={(event) => alterarEndereco('estado', event.target.value)} placeholder="Estado" />
            </div>

            <div className="campo campo--metade">
              <label htmlFor="pais">País</label>
              <input id="pais" type="text" value={formulario.endereco.pais} onChange={(event) => alterarEndereco('pais', event.target.value)} placeholder="Brasil" />
            </div>

            <div className="campo campo--completo">
              <label htmlFor="complemento">Complemento</label>
              <input id="complemento" type="text" value={formulario.endereco.complemento} onChange={(event) => alterarEndereco('complemento', event.target.value)} placeholder="Ex: Ap 105, Bloco 2, Sala 2..." />
            </div>
          </div>
        </div>

        <div className="cadastro-fornecedor__acoes-inferiores">
          <button type="button" className="cadastro-fornecedor__cancelar" onClick={() => navigate('/fornecedores')}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}

function formatarCnpj(valor: string) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function formatarCep(valor: string) {
  return valor.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

function formatarContato(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);

  if (numeros.length <= 10) {
    return numeros.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }

  return numeros.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}