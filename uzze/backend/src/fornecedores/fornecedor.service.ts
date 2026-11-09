import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import { CreateFornecedorDto } from './dto/create-fornecedor.dto.js';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto.js';

import {
Fornecedor,
  FornecedorStatus,
} from './entities/fornecedor.entity.js';

import { Endereco } from '../endereco/entities/endereco.entity.js';
import { buildMeta, type PaginatedMeta } from '../common/pagination.js';

@Injectable()
export class FornecedoresService {
  constructor(
    @InjectRepository(Fornecedor)
    private readonly fornecedorRepository: Repository<Fornecedor>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    createFornecedorDto: CreateFornecedorDto,
  ): Promise<Fornecedor> {
    const fornecedorExistente =
      await this.fornecedorRepository.findOne({
        where: {
          cnpj: createFornecedorDto.cnpj,
        },
      });

    if (fornecedorExistente) {
      throw new ConflictException(
        'Já existe um fornecedor cadastrado com este CNPJ',
      );
    }

    return this.dataSource.transaction(
      async (manager) => {
        const temEndereco =
          createFornecedorDto.cep ||
          createFornecedorDto.rua ||
          createFornecedorDto.numero ||
          createFornecedorDto.bairro ||
          createFornecedorDto.cidade ||
          createFornecedorDto.estado;

        let endereco_id: string | null = null;

        if (temEndereco) {
          const endereco = manager.create(
            Endereco,
            {
              cep: createFornecedorDto.cep ?? '',
              rua: createFornecedorDto.rua ?? '',
              numero: createFornecedorDto.numero ?? '',
              bairro: createFornecedorDto.bairro ?? '',
              cidade: createFornecedorDto.cidade ?? '',
              estado: createFornecedorDto.estado ?? '',
              pais: createFornecedorDto.pais ?? 'Brasil',
              complemento:
                createFornecedorDto.complemento ?? null,
            },
          );

          const enderecoSalvo =
            await manager.save(endereco);
          endereco_id = enderecoSalvo.id;
        }

        const fornecedor = manager.create(
          Fornecedor,
          {
            nome: createFornecedorDto.nome,
            cnpj: createFornecedorDto.cnpj,
            email: createFornecedorDto.email,
            contato: createFornecedorDto.contato,

            status:
              createFornecedorDto.status ??
              FornecedorStatus.ATIVO,

            endereco_id,
          },
        );

        const fornecedorSalvo =
          await manager.save(fornecedor);

        return manager.findOneOrFail(
          Fornecedor,
          {
            where: {
              id: fornecedorSalvo.id,
            },

            relations: {
              endereco: true,
            },
          },
        );
      },
    );
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: FornecedorStatus,
    busca?: string,
  ): Promise<{
    data: Fornecedor[];
    meta: PaginatedMeta;
  }> {
    const qb = this.fornecedorRepository
      .createQueryBuilder('fornecedor')
      .leftJoinAndSelect('fornecedor.endereco', 'endereco');

    if (status) {
      qb.andWhere('fornecedor.status = :status', { status });
    }

    if (busca) {
      qb.andWhere(
        '(fornecedor.nome LIKE :busca OR fornecedor.cnpj LIKE :busca OR fornecedor.email LIKE :busca OR fornecedor.contato LIKE :busca)',
        { busca: `%${busca}%` },
      );
    }

    qb.orderBy('fornecedor.nome', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: buildMeta(total, page, limit),
    };
  }

  async findOne(
    id: string,
  ): Promise<Fornecedor> {
    const fornecedor =
      await this.fornecedorRepository.findOne({
        where: {
          id,
        },

        relations: {
          endereco: true,
        },
      });

    if (!fornecedor) {
      throw new NotFoundException(
        'Fornecedor não encontrado',
      );
    }

    return fornecedor;
  }

  async update(
    id: string,
    updateFornecedorDto: UpdateFornecedorDto,
  ): Promise<Fornecedor> {
    const fornecedor =
      await this.findOne(id);

    if (
      updateFornecedorDto.cnpj &&
      updateFornecedorDto.cnpj !== fornecedor.cnpj
    ) {
      const cnpjExistente =
        await this.fornecedorRepository.findOne({
          where: {
            cnpj: updateFornecedorDto.cnpj,
          },
        });

      if (cnpjExistente) {
        throw new ConflictException(
          'Já existe um fornecedor cadastrado com este CNPJ',
        );
      }
    }

    return this.dataSource.transaction(
      async (manager) => {
        if (updateFornecedorDto.nome !== undefined) {
          fornecedor.nome =
            updateFornecedorDto.nome;
        }

        if (updateFornecedorDto.cnpj !== undefined) {
          fornecedor.cnpj =
            updateFornecedorDto.cnpj;
        }

        if (updateFornecedorDto.email !== undefined) {
          fornecedor.email =
            updateFornecedorDto.email;
        }

        if (
          updateFornecedorDto.contato !== undefined
        ) {
          fornecedor.contato =
            updateFornecedorDto.contato;
        }

        if (
          updateFornecedorDto.status !== undefined
        ) {
          fornecedor.status =
            updateFornecedorDto.status;
        }

        const camposEndereco = [
          'cep',
          'rua',
          'numero',
          'bairro',
          'cidade',
          'estado',
          'pais',
          'complemento',
        ] as const;

        const algumCampoEndereco = camposEndereco.some(
          (c) => updateFornecedorDto[c] !== undefined,
        );

        if (algumCampoEndereco) {
          let endereco = fornecedor.endereco;

          if (!endereco) {
            endereco = manager.create(Endereco, {
              cep: '',
              rua: '',
              numero: '',
              bairro: '',
              cidade: '',
              estado: '',
              pais: 'Brasil',
              complemento: null,
            });
            endereco = await manager.save(endereco);
            fornecedor.endereco_id = endereco.id;
            fornecedor.endereco = endereco;
          }

          for (const campo of camposEndereco) {
            const valor = updateFornecedorDto[campo];
            if (valor !== undefined) {
              (endereco as unknown as Record<string, unknown>)[campo] = valor;
            }
          }

          await manager.save(Endereco, endereco);
        }

        await manager.save(
          Fornecedor,
          fornecedor,
        );

        return manager.findOneOrFail(
          Fornecedor,
          {
            where: {
              id,
            },

            relations: {
              endereco: true,
            },
          },
        );
      },
    );
  }

  async remove(
    id: string,
  ): Promise<Fornecedor> {
    const fornecedor =
      await this.findOne(id);

    if (fornecedor.status === FornecedorStatus.INATIVO) {
      throw new ConflictException(
        'Fornecedor já se encontra inativo',
      );
    }

    fornecedor.status =
      FornecedorStatus.INATIVO;

    return this.fornecedorRepository.save(
      fornecedor,
    );
  }

  async activate(
    id: string,
  ): Promise<Fornecedor> {
    const fornecedor =
      await this.findOne(id);

    fornecedor.status =
      FornecedorStatus.ATIVO;

    return this.fornecedorRepository.save(
      fornecedor,
    );
  }
}