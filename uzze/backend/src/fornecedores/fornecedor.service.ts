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
        const endereco = manager.create(
          Endereco,
          {
            cep: createFornecedorDto.cep,
            rua: createFornecedorDto.rua,
            numero: createFornecedorDto.numero,
            bairro: createFornecedorDto.bairro,
            cidade: createFornecedorDto.cidade,
            estado: createFornecedorDto.estado,
            pais: createFornecedorDto.pais,
            complemento:
              createFornecedorDto.complemento ??
              null,
          },
        );

        const enderecoSalvo =
          await manager.save(endereco);

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

            endereco_id: enderecoSalvo.id,
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

  async findAll(): Promise<Fornecedor[]> {
    return this.fornecedorRepository.find({
      relations: {
        endereco: true,
      },

      order: {
        nome: 'ASC',
      },
    });
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

        const endereco = fornecedor.endereco;

        if (updateFornecedorDto.cep !== undefined) {
          endereco.cep =
            updateFornecedorDto.cep;
        }

        if (updateFornecedorDto.rua !== undefined) {
          endereco.rua =
            updateFornecedorDto.rua;
        }

        if (
          updateFornecedorDto.numero !== undefined
        ) {
          endereco.numero =
            updateFornecedorDto.numero;
        }

        if (
          updateFornecedorDto.bairro !== undefined
        ) {
          endereco.bairro =
            updateFornecedorDto.bairro;
        }

        if (
          updateFornecedorDto.cidade !== undefined
        ) {
          endereco.cidade =
            updateFornecedorDto.cidade;
        }

        if (
          updateFornecedorDto.estado !== undefined
        ) {
          endereco.estado =
            updateFornecedorDto.estado;
        }

        if (updateFornecedorDto.pais !== undefined) {
          endereco.pais =
            updateFornecedorDto.pais;
        }

        if (
          updateFornecedorDto.complemento !== undefined
        ) {
          endereco.complemento =
            updateFornecedorDto.complemento;
        }

        await manager.save(
          Endereco,
          endereco,
        );

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