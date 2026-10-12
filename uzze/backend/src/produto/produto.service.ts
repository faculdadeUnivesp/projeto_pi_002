import {
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

import { Fornecedor } from '../fornecedores/entities/fornecedor.entity.js';

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

        fornecedor_id:
          dto.fornecedor_id,

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

  const totalPages =
    Math.ceil(total / limit);

  return {
    data: produtos,

    meta: {
      page,
      limit,
      total,
      totalPages,

      hasNextPage:
        page < totalPages,

      hasPreviousPage:
        page > 1,
    },
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
    }

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

  private removerArquivo(
    caminho?: string | null,
  ): void {
    if (!caminho) {
      return;
    }

    const caminhoNormalizado =
      caminho.replace(
        /^\/+/,
        '',
      );

    if (
      existsSync(
        caminhoNormalizado,
      )
    ) {
      unlinkSync(
        caminhoNormalizado,
      );
    }
  }
}