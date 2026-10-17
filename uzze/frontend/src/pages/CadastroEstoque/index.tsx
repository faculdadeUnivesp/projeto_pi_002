import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../services/api';
import { IconCheck, IconImage } from '../../components/common/Icons';
import { assetUrl } from '../../utils/assets';
import {
  formatCurrencyInput,
  parseCurrencyInput,
} from '../../utils/formatters';

interface Fornecedor {
  id: string;
  nome: string;
  status: 'ativo' | 'inativo';
}

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  material: string;
  tamanho: string;
  valor: number | string;
  genero: 'feminino' | 'masculino' | 'unissex';
  modelo: string;
  quantidade: number;
  descricao?: string | null;
  imagem?: string | null;
  fornecedor_id: string;
}

interface Formulario {
  nome: string;
  categoria: string;
  material: string;
  tamanho: string;
  valor: string;
  genero: 'feminino' | 'masculino' | 'unissex';
  modelo: string;
  quantidade: string;
  fornecedor_id: string;
  descricao: string;
}

interface ApiResponse<T> {
  data: T;
}

interface OpcoesProduto {
  categorias: string[];
  materiais: string[];
  tamanhos: string[];
  modelos: string[];
}

const formularioInicial: Formulario = {
  nome: '',
  categoria: '',
  material: '',
  tamanho: '',
  valor: '',
  genero: 'feminino',
  modelo: '',
  quantidade: '',
  fornecedor_id: '',
  descricao: '',
};

export function CadastroEstoque() {
  const navigate = useNavigate();
  const { id } = useParams();
  const inputImagem = useRef<HTMLInputElement>(null);

  const modoEdicao = Boolean(id);

  const [formulario, setFormulario] = useState<Formulario>(formularioInicial);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [opcoes, setOpcoes] = useState<OpcoesProduto>({
    categorias: [],
    materiais: [],
    tamanhos: [],
    modelos: [],
  });
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarFornecedores = async () => {
      try {
        const response = await api.get<ApiResponse<Fornecedor[]>>(
          '/fornecedores',
          { params: { limit: 100, status: 'ativo' } },
        );

        setFornecedores(
          (response.data.data ?? []).filter(
            (fornecedor) => fornecedor.status === 'ativo',
          ),
        );
      } catch (error) {
        console.error(error);
      }
    };

    carregarFornecedores();
  }, []);

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const response = await api.get<ApiResponse<OpcoesProduto>>(
          '/produtos/opcoes',
        );
        setOpcoes(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    carregarOpcoes();
  }, [modoEdicao]);

  useEffect(() => {
    if (!id) return;

    const carregarProduto = async () => {
      try {
        setCarregando(true);

        const response = await api.get<ApiResponse<Produto>>(`/produtos/${id}`);
        const produto = response.data.data;

        setFormulario({
          nome: produto.nome ?? '',
          categoria: produto.categoria ?? '',
          material: produto.material ?? '',
          tamanho: produto.tamanho ?? '',
          valor: produto.valor
            ? formatCurrencyInput(
                String(produto.valor).replace('.', '').replace(',', ''),
              )
            : '',
          genero: produto.genero ?? 'feminino',
          modelo: produto.modelo ?? '',
          quantidade: String(produto.quantidade ?? ''),
          fornecedor_id: produto.fornecedor_id ?? '',
          descricao: produto.descricao ?? '',
        });

        if (produto.imagem) {
          setPreviewImagem(assetUrl(produto.imagem));
        }
      } catch (error) {
        console.error(error);
        setErro('Não foi possível carregar o produto.');
      } finally {
        setCarregando(false);
      }
    };

    carregarProduto();
  }, [id]);

  useEffect(() => {
    return () => {
      if (previewImagem?.startsWith('blob:')) {
        URL.revokeObjectURL(previewImagem);
      }
    };
  }, [previewImagem]);

  const alterarCampo = (campo: keyof Formulario, valor: string) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const selecionarImagem = (event: ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type)) {
      setErro('Selecione uma imagem JPEG, PNG ou WEBP.');
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setErro('A imagem deve possuir no máximo 5 MB.');
      return;
    }

    setErro('');
    setImagem(arquivo);
    setPreviewImagem(URL.createObjectURL(arquivo));
  };

  const validar = () => {
    if (!formulario.nome.trim()) {
      return 'Informe o nome do produto.';
    }

    if (!formulario.categoria.trim()) {
      return 'Informe a categoria.';
    }

    if (!formulario.valor || Number(parseCurrencyInput(formulario.valor)) <= 0) {
      return 'Informe um valor maior que zero.';
    }

    if (formulario.quantidade === '' || Number(formulario.quantidade) < 0) {
      return 'Informe uma quantidade válida.';
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

      const dados = new FormData();
      const appendIfPresent = (key: string, value: string) => {
        if (value && value.trim() !== '') {
          dados.append(key, value.trim());
        }
      };

      dados.append('nome', formulario.nome.trim());
      dados.append('categoria', formulario.categoria.trim());
      appendIfPresent('material', formulario.material);
      appendIfPresent('tamanho', formulario.tamanho);
      appendIfPresent('modelo', formulario.modelo);
      appendIfPresent('descricao', formulario.descricao);
      appendIfPresent('fornecedor_id', formulario.fornecedor_id);

      dados.append(
        'valor',
        parseCurrencyInput(formulario.valor),
      );
      dados.append('genero', formulario.genero);
      dados.append('quantidade', formulario.quantidade);

      if (imagem) {
        dados.append('imagem', imagem);
      }

      if (modoEdicao && id) {
        await api.patch(`/produtos/${id}`, dados);
      } else {
        await api.post('/produtos', dados);
      }

      navigate('/estoque');
    } catch (error: unknown) {
      console.error(error);

      const mensagem = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

      setErro(
        Array.isArray(mensagem)
          ? mensagem.join(' ')
          : mensagem || 'Não foi possível salvar o produto.',
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <p className="empty">Carregando produto...</p>;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{modoEdicao ? 'Editar Produto' : 'Cadastro de Estoque'}</h1>
        </div>

        <button
          className="btn"
          type="submit"
          form="form-produto"
          disabled={salvando}
        >
          <IconCheck />
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <form id="form-produto" onSubmit={salvar}>
        {erro && <div className="alert alert--error">{erro}</div>}

        <section className="card form-card">
          <h2 className="lg">Dados do Produto</h2>

          <div className="grid c3">
            <div className="field">
              <label htmlFor="nome">Nome</label>
              <input
                className="input"
                id="nome"
                type="text"
                placeholder="Digite o nome do produto"
                value={formulario.nome}
                onChange={(event) => alterarCampo('nome', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="categoria">Categoria</label>
              <input
                className="input"
                id="categoria"
                list={opcoes.categorias.length > 0 ? 'dl-categoria' : undefined}
                type="text"
                placeholder="Ex: camisa, calça, vestido..."
                value={formulario.categoria}
                onChange={(event) =>
                  alterarCampo('categoria', event.target.value)
                }
              />
              {opcoes.categorias.length > 0 && (
                <datalist id="dl-categoria">
                  {opcoes.categorias.map((opcao) => (
                    <option key={opcao} value={opcao} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="field">
              <label htmlFor="material">Material</label>
              <input
                className="input"
                id="material"
                list={opcoes.materiais.length > 0 ? 'dl-material' : undefined}
                type="text"
                placeholder="Ex: algodão, jeans, poliéster..."
                value={formulario.material}
                onChange={(event) =>
                  alterarCampo('material', event.target.value)
                }
              />
              {opcoes.materiais.length > 0 && (
                <datalist id="dl-material">
                  {opcoes.materiais.map((opcao) => (
                    <option key={opcao} value={opcao} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="field">
              <label htmlFor="tamanho">Tamanho</label>
              <input
                className="input"
                id="tamanho"
                list={opcoes.tamanhos.length > 0 ? 'dl-tamanho' : undefined}
                type="text"
                placeholder="Ex: PP, P, M, G, 38, 44, Único..."
                value={formulario.tamanho}
                onChange={(event) =>
                  alterarCampo('tamanho', event.target.value)
                }
              />
              {opcoes.tamanhos.length > 0 && (
                <datalist id="dl-tamanho">
                  {opcoes.tamanhos.map((opcao) => (
                    <option key={opcao} value={opcao} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="field">
              <label htmlFor="valor">Valor</label>
              <input
                className="input"
                id="valor"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={formulario.valor}
                onChange={(event) =>
                  alterarCampo('valor', formatCurrencyInput(event.target.value))
                }
              />
            </div>

            <div className="field">
              <span className="label-s">Gênero</span>
              <div className="chips">
                {[
                  { valor: 'feminino', texto: 'F' },
                  { valor: 'masculino', texto: 'M' },
                  { valor: 'unissex', texto: 'U' },
                ].map((genero) => (
                  <label
                    key={genero.valor}
                    className={`chip${
                      formulario.genero === genero.valor ? ' sel' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="genero"
                      value={genero.valor}
                      checked={formulario.genero === genero.valor}
                      onChange={() => alterarCampo('genero', genero.valor)}
                    />
                    {genero.texto}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="modelo">Modelo</label>
              <input
                className="input"
                id="modelo"
                list={opcoes.modelos.length > 0 ? 'dl-modelo' : undefined}
                type="text"
                placeholder="Ex: curto, longo, flare, reto..."
                value={formulario.modelo}
                onChange={(event) => alterarCampo('modelo', event.target.value)}
              />
              {opcoes.modelos.length > 0 && (
                <datalist id="dl-modelo">
                  {opcoes.modelos.map((opcao) => (
                    <option key={opcao} value={opcao} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="field">
              <label htmlFor="quantidade">Quantidade em estoque</label>
              <input
                className="input"
                id="quantidade"
                type="number"
                min="0"
                step="1"
                placeholder="Digite a quantidade"
                value={formulario.quantidade}
                onChange={(event) =>
                  alterarCampo('quantidade', event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="fornecedor">Fornecedor (opcional)</label>
              <select
                className="select"
                id="fornecedor"
                value={formulario.fornecedor_id}
                  onChange={(event) =>
                    alterarCampo('fornecedor_id', event.target.value)
                  }
                >
                  <option value="">Sem fornecedor</option>

                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </option>
                  ))}
                </select>
            </div>
          </div>

          <div className="grid c2" style={{ marginTop: 20 }}>
            <div className="field">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                className="textarea"
                id="descricao"
                placeholder="Adicione uma descrição do produto ..."
                value={formulario.descricao}
                onChange={(event) =>
                  alterarCampo('descricao', event.target.value)
                }
              />
            </div>

            <label className="upload">
              <IconImage />
              {previewImagem ? (
                <img src={previewImagem} alt="Pré-visualização" />
              ) : (
                <span>Clique para enviar a imagem</span>
              )}
              <input
                ref={inputImagem}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={selecionarImagem}
              />
            </label>
          </div>
        </section>

        <div className="page-head">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => navigate('/estoque')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}
