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

  async findAll(): Promise<Produto[]> {
    return this.produtoRepository.find({
      relations: {
        fornecedor: true,
      },

      order: {
        nome: 'ASC',
      },
    });
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