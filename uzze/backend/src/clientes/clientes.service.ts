import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cliente, ClienteStatus } from './entities/cliente.entity.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { buildMeta, type PaginatedMeta } from '../common/pagination.js';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(dto: CreateClienteDto): Promise<Cliente> {
    const existente = await this.clienteRepository.findOne({
      where: { cpf_cnpj: dto.cpf_cnpj },
    });

    if (existente) {
      throw new ConflictException(
        'Já existe um cliente cadastrado com este CPF/CNPJ',
      );
    }

    const cliente = this.clienteRepository.create({
      ...dto,
      status: dto.status ?? ClienteStatus.ATIVO,
    });

    return this.clienteRepository.save(cliente);
  }

  async findAll(
    page = 1,
    limit = 10,
    busca?: string,
    status?: ClienteStatus,
  ): Promise<{ data: Cliente[]; meta: PaginatedMeta }> {
    const qb = this.clienteRepository.createQueryBuilder('cliente');

    if (busca) {
      qb.andWhere(
        '(cliente.nome LIKE :busca OR cliente.cpf_cnpj LIKE :busca OR cliente.email LIKE :busca)',
        { busca: `%${busca}%` },
      );
    }

    if (status) {
      qb.andWhere('cliente.status = :status', { status });
    }

    qb.orderBy('cliente.nome', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: buildMeta(total, page, limit),
    };
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);

    if (dto.cpf_cnpj && dto.cpf_cnpj !== cliente.cpf_cnpj) {
      const existente = await this.clienteRepository.findOne({
        where: { cpf_cnpj: dto.cpf_cnpj },
      });

      if (existente) {
        throw new ConflictException(
          'Já existe um cliente cadastrado com este CPF/CNPJ',
        );
      }
    }

    if (dto.nome !== undefined) cliente.nome = dto.nome;
    if (dto.cpf_cnpj !== undefined) cliente.cpf_cnpj = dto.cpf_cnpj;
    if (dto.email !== undefined) cliente.email = dto.email;
    if (dto.telefone !== undefined) cliente.telefone = dto.telefone;
    if (dto.observacao !== undefined) cliente.observacao = dto.observacao;
    if (dto.status !== undefined) cliente.status = dto.status;

    return this.clienteRepository.save(cliente);
  }

  async remove(id: string): Promise<Cliente> {
    const cliente = await this.findOne(id);

    if (cliente.status === ClienteStatus.INATIVO) {
      throw new ConflictException(
        'Cliente já se encontra inativo',
      );
    }

    cliente.status = ClienteStatus.INATIVO;

    return this.clienteRepository.save(cliente);
  }

  async activate(id: string): Promise<Cliente> {
    const cliente = await this.findOne(id);

    cliente.status = ClienteStatus.ATIVO;

    return this.clienteRepository.save(cliente);
  }
}
