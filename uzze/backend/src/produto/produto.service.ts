import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  existsSync,
  unlinkSync,
} from 'fs';
import { resolve, isAbsolute } from 'path';
import { buildMeta } from '../common/pagination.js';

import {
  Fornecedor,
  FornecedorStatus,
} from '../fornecedores/entities/fornecedor.entity.js';

import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { ListProdutoQueryDto } from './dto/list-produto-query.dto.js';

import { PaginatedProdutoResponse } from './interfaces/paginated-produto.interface.js'

import {
  Produto,
  ProdutoStatus,
} from './entities/produto.entity.js';

import { UploadedFile } from './types/uploaded-file.type.js';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository:
      Repository<Produto>,

    @InjectRepository(Fornecedor)
    private readonly fornecedorRepository:
      Repository<Fornecedor>,
  ) {}

  async create(
    dto: CreateProdutoDto,
    imagem?: UploadedFile,
  ): Promise<Produto> {
    if (dto.fornecedor_id) {
      const fornecedor =
        await this.fornecedorRepository.findOne({
          where: {
            id: dto.fornecedor_id,
          },
        });

      if (!fornecedor) {
        this.removerArquivo(imagem?.path);

        throw new ConflictException(
          'Fornecedor não encontrado',
        );
      }

      if (fornecedor.status === FornecedorStatus.INATIVO) {
        this.removerArquivo(imagem?.path);

        throw new BadRequestException(
          'Não é possível cadastrar produto com fornecedor inativo',
        );
      }
    }

    await this.verificarGradeUnica(dto);

    const produto =
      this.produtoRepository.create({
        nome: dto.nome,
        categoria: dto.categoria,
        material: dto.material,
        tamanho: dto.tamanho,
        valor: dto.valor,
        genero: dto.genero,
        modelo: dto.modelo,
        quantidade: dto.quantidade,

        imagem: imagem
          ? `uploads/produtos/${imagem.filename}`
          : null,

        descricao: dto.descricao ?? null,

        fornecedor_id: dto.fornecedor_id ?? null,

        status:
          ProdutoStatus.ATIVO,
      });

    try {
      const produtoSalvo =
        await this.produtoRepository.save(
          produto,
        );

      return this.findOne(
        produtoSalvo.id,
      );
    } catch (error) {
      this.removerArquivo(imagem?.path);

      throw error;
    }
  }

async findAll(
  filtros: ListProdutoQueryDto,
): Promise<PaginatedProdutoResponse> {
  const {
    page = 1,
    limit = 10,
    busca,
    categoria,
    material,
    tamanho,
    genero,
    modelo,
    fornecedor_id,
    status,
    valor_min,
    valor_max,
  } = filtros;

  const query =
    this.produtoRepository
      .createQueryBuilder('produto')
      .leftJoinAndSelect(
        'produto.fornecedor',
        'fornecedor',
      );

  if (busca) {
    query.andWhere(
      `(
        produto.nome LIKE :busca
        OR produto.categoria LIKE :busca
        OR produto.material LIKE :busca
        OR produto.modelo LIKE :busca
      )`,
      {
        busca: `%${busca}%`,
      },
    );
  }

  if (categoria) {
    query.andWhere(
      'produto.categoria = :categoria',
      {
        categoria,
      },
    );
  }

  if (material) {
    query.andWhere(
      'produto.material = :material',
      {
        material,
      },
    );
  }

  if (tamanho) {
    query.andWhere(
      'produto.tamanho = :tamanho',
      {
        tamanho,
      },
    );
  }

  if (genero) {
    query.andWhere(
      'produto.genero = :genero',
      {
        genero,
      },
    );
  }

  if (modelo) {
    query.andWhere(
      'produto.modelo = :modelo',
      {
        modelo,
      },
    );
  }

  if (fornecedor_id) {
    query.andWhere(
      'produto.fornecedor_id = :fornecedor_id',
      {
        fornecedor_id,
      },
    );
  }

  if (status) {
    query.andWhere(
      'produto.status = :status',
      {
        status,
      },
    );
  }

  if (valor_min !== undefined) {
  query.andWhere(
    'produto.valor >= :valor_min',
    {
      valor_min,
    },
  );
}

 if (valor_max !== undefined) {
  query.andWhere(
    'produto.valor <= :valor_max',
    {
      valor_max,
    },
  );
}

  query
    .orderBy(
      'produto.nome',
      'ASC',
    )
    .skip(
      (page - 1) * limit,
    )
    .take(limit);

  const [
    produtos,
    total,
  ] = await query.getManyAndCount();

  return {
    data: produtos,
    meta: buildMeta(total, page, limit),
  };

}

  async findOpcoes(): Promise<{
    categorias: string[];
    materiais: string[];
    tamanhos: string[];
    modelos: string[];
  }> {
    const extrair = (registros: Array<{ valor: string }>) =>
      registros
        .map((registro) => registro.valor)
        .filter((valor) => valor && valor.trim() !== '')
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const [categorias, materiais, tamanhos, modelos] =
      await Promise.all([
        this.produtoRepository
          .createQueryBuilder('produto')
          .select('DISTINCT produto.categoria', 'valor')
          .getRawMany(),
        this.produtoRepository
          .createQueryBuilder('produto')
          .select('DISTINCT produto.material', 'valor')
          .getRawMany(),
        this.produtoRepository
          .createQueryBuilder('produto')
          .select('DISTINCT produto.tamanho', 'valor')
          .getRawMany(),
        this.produtoRepository
          .createQueryBuilder('produto')
          .select('DISTINCT produto.modelo', 'valor')
          .getRawMany(),
      ]);

    return {
      categorias: extrair(categorias),
      materiais: extrair(materiais),
      tamanhos: extrair(tamanhos),
      modelos: extrair(modelos),
    };
  }

  async findOne(
    id: string,
  ): Promise<Produto> {
    const produto =
      await this.produtoRepository.findOne({
        where: {
          id,
        },

        relations: {
          fornecedor: true,
        },
      });

    if (!produto) {
      throw new NotFoundException(
        'Produto não encontrado',
      );
    }

    return produto;
  }

  async update(
    id: string,
    dto: UpdateProdutoDto,
    imagem?: UploadedFile,
  ): Promise<Produto> {
    const produto =
      await this.findOne(id);

    if (dto.fornecedor_id) {
      const fornecedor =
        await this.fornecedorRepository.findOne({
          where: {
            id: dto.fornecedor_id,
          },
        });

      if (!fornecedor) {
        this.removerArquivo(imagem?.path);

        throw new NotFoundException(
          'Fornecedor não encontrado',
        );
      }

      if (fornecedor.status === FornecedorStatus.INATIVO) {
        this.removerArquivo(imagem?.path);

        throw new BadRequestException(
          'Não é possível vincular produto a fornecedor inativo',
        );
      }
    }

    await this.verificarGradeUnica(
      {
        nome: dto.nome ?? produto.nome,
        categoria: dto.categoria ?? produto.categoria,
        tamanho: dto.tamanho ?? produto.tamanho ?? undefined,
        genero: dto.genero ?? produto.genero,
        modelo: dto.modelo ?? produto.modelo ?? undefined,
      },
      id,
    );

    const imagemAnterior =
      produto.imagem;

    Object.assign(
      produto,
      dto,
    );

    if (imagem) {
      produto.imagem =
        `uploads/produtos/${imagem.filename}`;
    }

    try {
      await this.produtoRepository.save(
        produto,
      );

      if (
        imagem &&
        imagemAnterior
      ) {
        this.removerArquivo(
          imagemAnterior,
        );
      }

      return this.findOne(id);
    } catch (error) {
      this.removerArquivo(
        imagem?.path,
      );

      throw error;
    }
  }

  async remove(
    id: string,
  ): Promise<Produto> {
    const produto =
      await this.findOne(id);

    produto.status =
      ProdutoStatus.INATIVO;

    await this.produtoRepository.save(
      produto,
    );

    return this.findOne(id);
  }

  async activate(
    id: string,
  ): Promise<Produto> {
    const produto =
      await this.findOne(id);

    produto.status =
      ProdutoStatus.ATIVO;

    await this.produtoRepository.save(
      produto,
    );

    return this.findOne(id);
  }

  private async verificarGradeUnica(
    dto: Pick<
      CreateProdutoDto,
      'nome' | 'categoria' | 'tamanho' | 'genero' | 'modelo'
    >,
    produtoExcluirId?: string,
  ): Promise<void> {
    const qb = this.produtoRepository
      .createQueryBuilder('produto')
      .where('produto.nome = :nome', { nome: dto.nome })
      .andWhere('produto.categoria = :categoria', {
        categoria: dto.categoria,
      })
      .andWhere('produto.tamanho = :tamanho', {
        tamanho: dto.tamanho,
      })
      .andWhere('produto.genero = :genero', {
        genero: dto.genero,
      })
      .andWhere('produto.modelo = :modelo', {
        modelo: dto.modelo,
      });

    if (produtoExcluirId) {
      qb.andWhere('produto.id != :id', {
        id: produtoExcluirId,
      });
    }

    const duplicado = await qb.getOne();

    if (duplicado) {
      throw new ConflictException(
        'Já existe um produto com esta grade (nome, categoria, tamanho, gênero e modelo)',
      );
    }
  }

  private removerArquivo(
    caminho?: string | null,
  ): void {
    if (!caminho) {
      return;
    }

    const caminhoAbsoluto = isAbsolute(caminho)
      ? caminho
      : resolve(process.cwd(), caminho.replace(/^\/+/, ''));

    try {
      if (existsSync(caminhoAbsoluto)) {
        unlinkSync(caminhoAbsoluto);
      }
    } catch {
    }
  }
}