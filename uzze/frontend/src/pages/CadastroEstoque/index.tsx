import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../services/api';
import './CadastroEstoque.css';

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
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarFornecedores = async () => {
      try {
        const response = await api.get<ApiResponse<Fornecedor[]>>('/fornecedores');

        setFornecedores(
          (response.data.data ?? []).filter((fornecedor) => fornecedor.status === 'ativo'),
        );
      } catch (error) {
        console.error(error);
      }
    };

    carregarFornecedores();
  }, []);

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
          valor: String(produto.valor ?? ''),
          genero: produto.genero ?? 'feminino',
          modelo: produto.modelo ?? '',
          quantidade: String(produto.quantidade ?? ''),
          fornecedor_id: produto.fornecedor_id ?? '',
          descricao: produto.descricao ?? '',
        });

        if (produto.imagem) {
          const caminho = produto.imagem.startsWith('/') ? produto.imagem : `/${produto.imagem}`;

          setPreviewImagem(
            produto.imagem.startsWith('http') ? produto.imagem : `http://localhost:3000${caminho}`,
          );
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
    if (
      !formulario.nome ||
      !formulario.categoria ||
      !formulario.material ||
      !formulario.tamanho ||
      !formulario.valor ||
      !formulario.modelo ||
      !formulario.quantidade ||
      !formulario.fornecedor_id
    ) {
      return 'Preencha todos os campos obrigatórios.';
    }

    if (Number(formulario.valor) < 0) {
      return 'Informe um valor válido.';
    }

    if (Number(formulario.quantidade) < 0) {
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

      dados.append('nome', formulario.nome.trim());
      dados.append('categoria', formulario.categoria);
      dados.append('material', formulario.material);
      dados.append('tamanho', formulario.tamanho);
      dados.append('valor', formulario.valor.replace(',', '.'));
      dados.append('genero', formulario.genero);
      dados.append('modelo', formulario.modelo);
      dados.append('quantidade', formulario.quantidade);
      dados.append('fornecedor_id', formulario.fornecedor_id);

      if (formulario.descricao.trim()) {
        dados.append('descricao', formulario.descricao.trim());
      }

      if (imagem) {
        dados.append('imagem', imagem);
      }

      if (modoEdicao && id) {
        await api.patch(`/produtos/${id}`, dados);
      } else {
        await api.post('/produtos', dados);
      }

      navigate('/estoque');
    } catch (error: any) {
      console.error(error);

      const mensagem = error.response?.data?.message;

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
    return <div className="cadastro-estoque__carregando">Carregando produto...</div>;
  }

  return (
    <section className="cadastro-estoque">
      <form onSubmit={salvar}>
        <div className="cadastro-estoque__topo">
          <h1>{modoEdicao ? 'Editar Produto' : 'Cadastro de Estoque'}</h1>

          <button type="submit" className="cadastro-estoque__salvar" disabled={salvando}>
            <span>☑</span>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {erro && <div className="cadastro-estoque__erro">{erro}</div>}

        <div className="cadastro-estoque__card">
          <h2>Dados do Produto</h2>

          <div className="cadastro-estoque__grid">
            <div className="estoque-campo">
              <label>Nome</label>
              <input value={formulario.nome} onChange={(event) => alterarCampo('nome', event.target.value)} placeholder="Digite o nome do produto" />
            </div>

            <div className="estoque-campo">
              <label>Categoria</label>

              <select value={formulario.categoria} onChange={(event) => alterarCampo('categoria', event.target.value)}>
                <option value="">Selecione a categoria</option>
                <option value="camisa">Camisa</option>
                <option value="blusa">Blusa</option>
                <option value="calça">Calça</option>
                <option value="vestido">Vestido</option>
                <option value="acessório">Acessório</option>
              </select>
            </div>

            <div className="estoque-campo">
              <label>Material</label>

              <select value={formulario.material} onChange={(event) => alterarCampo('material', event.target.value)}>
                <option value="">Selecione o material</option>
                <option value="algodão">Algodão</option>
                <option value="jeans">Jeans</option>
                <option value="poliéster">Poliéster</option>
                <option value="linho">Linho</option>
                <option value="couro">Couro</option>
              </select>
            </div>

            <div className="estoque-campo">
              <label>Tamanho</label>

              <select value={formulario.tamanho} onChange={(event) => alterarCampo('tamanho', event.target.value)}>
                <option value="">Selecione o tamanho</option>
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
                <option value="36">36</option>
                <option value="38">38</option>
                <option value="40">40</option>
                <option value="42">42</option>
              </select>
            </div>

            <div className="estoque-campo">
              <label>Valor</label>
              <input type="number" min="0" step="0.01" value={formulario.valor} onChange={(event) => alterarCampo('valor', event.target.value)} placeholder="R$ 00,00" />
            </div>

            <div className="estoque-campo">
              <label>Gênero</label>

              <div className="cadastro-estoque__generos">
                {[
                  { valor: 'feminino', texto: 'F' },
                  { valor: 'masculino', texto: 'M' },
                  { valor: 'unissex', texto: 'U' },
                ].map((genero) => (
                  <button
                    key={genero.valor}
                    type="button"
                    className={formulario.genero === genero.valor ? 'ativo' : ''}
                    onClick={() => alterarCampo('genero', genero.valor)}
                  >
                    {genero.texto}
                  </button>
                ))}
              </div>
            </div>

            <div className="estoque-campo">
              <label>Modelo</label>

              <select value={formulario.modelo} onChange={(event) => alterarCampo('modelo', event.target.value)}>
                <option value="">Selecione o modelo</option>
                <option value="curto">Curto</option>
                <option value="longo">Longo</option>
                <option value="flare">Flare</option>
                <option value="wide leg">Wide Leg</option>
                <option value="reto">Reto</option>
              </select>
            </div>

            <div className="estoque-campo">
              <label>Quantidade em estoque</label>
              <input type="number" min="0" step="1" value={formulario.quantidade} onChange={(event) => alterarCampo('quantidade', event.target.value)} placeholder="Digite a quantidade" />
            </div>

            <div className="estoque-campo">
              <label>Fornecedor</label>

              <select value={formulario.fornecedor_id} onChange={(event) => alterarCampo('fornecedor_id', event.target.value)}>
                <option value="">Selecione o fornecedor</option>

                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="estoque-campo cadastro-estoque__descricao">
              <label>Descrição</label>
              <textarea value={formulario.descricao} onChange={(event) => alterarCampo('descricao', event.target.value)} placeholder="Adicione uma descrição do produto ..." />
            </div>

            <div className="cadastro-estoque__upload" onClick={() => inputImagem.current?.click()}>
              <input ref={inputImagem} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={selecionarImagem} />

              {previewImagem ? (
                <img src={previewImagem} alt="Pré-visualização" />
              ) : (
                <div>
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="m5 18 5-5 3 3 2-2 4 4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>

                  <span>Clique para enviar a imagem</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="cadastro-estoque__rodape">
          <button type="button" onClick={() => navigate('/estoque')}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}