import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  LessThanOrEqual,
  Repository,
} from 'typeorm';
import {
  Venda,
  VendaStatus,
} from './entities/venda.entity.js';
import { ItemVenda } from './entities/item-venda.entity.js';
import { CreateVendaDto } from './dto/create-venda.dto.js';
import { UsuarioTipo } from '../usuarios/entities/usuario.entity.js';
import { Produto, ProdutoStatus } from '../produto/entities/produto.entity.js';
import { Cliente } from '../clientes/entities/cliente.entity.js';
import { buildMeta } from '../common/pagination.js';

@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Venda)
    private readonly vendaRepository: Repository<Venda>,

    @InjectRepository(ItemVenda)
    private readonly itemVendaRepository: Repository<ItemVenda>,

    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    private readonly dataSource: DataSource,
  ) {}

  async criar(
    dados: CreateVendaDto,
    vendedorId: string,
  ): Promise<Venda> {
    if (!dados.itens || dados.itens.length === 0) {
      throw new BadRequestException(
        'A venda deve possuir pelo menos um item',
      );
    }

    const produtos = dados.itens.map(
      (item) => item.produtoId,
    );

    const produtosDuplicados = produtos.filter(
      (produtoId, index) =>
        produtos.indexOf(produtoId) !== index,
    );

    if (produtosDuplicados.length > 0) {
      throw new BadRequestException(
        'Produto duplicado no pedido',
      );
    }

    if (dados.clienteId) {
      const cliente = await this.clienteRepository.findOne({
        where: { id: dados.clienteId },
      });

      if (!cliente) {
        throw new NotFoundException(
          'Cliente não encontrado',
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let numeroLockObtido = false;

    try {
      const lockResult = await queryRunner.query(
        `SELECT GET_LOCK('uzze_vendas_numero', 10) AS locked`,
      );

      if (Number(lockResult[0]?.locked) !== 1) {
        throw new ConflictException(
          'Não foi possível gerar o número da venda',
        );
      }

      numeroLockObtido = true;

      const ultimaVenda = await queryRunner.manager
        .getRepository(Venda)
        .createQueryBuilder('venda')
        .orderBy('venda.numero_venda', 'DESC')
        .getOne();

      let proximoNumero = 1;

      if (ultimaVenda) {
        const match = /^(\d{4})-(\d+)$/.exec(ultimaVenda.numero_venda);
        if (!match) {
          throw new InternalServerErrorException(
            `numero_venda corrompido: ${ultimaVenda.numero_venda}`,
          );
        }
        proximoNumero = Number(match[2]) + 1;
      }

      const anoAtual = new Date().getFullYear();
      const numeroVenda =
        `${anoAtual}-${String(proximoNumero).padStart(4, '0')}`;

      let total = 0;

      const itensParaSalvar: ItemVenda[] = [];

      for (const item of dados.itens) {
        const produto = await queryRunner.manager
          .getRepository(Produto)
          .createQueryBuilder('produto')
          .where('produto.id = :id', {
            id: item.produtoId,
          })
          .setLock('pessimistic_write')
          .getOne();

        if (!produto) {
          throw new NotFoundException(
            `Produto não encontrado: ${item.produtoId}`,
          );
        }

        if (produto.quantidade < item.quantidade) {
          throw new ConflictException(
            `Estoque insuficiente para o produto ${produto.nome}`,
          );
        }

        const valorUnitario = Number(produto.valor);
        const subtotal =
          valorUnitario * item.quantidade;

        total += subtotal;

        produto.quantidade -= item.quantidade;

        await queryRunner.manager
          .getRepository(Produto)
          .save(produto);

        const itemVenda = new ItemVenda();

        itemVenda.produto_id = produto.id;
        itemVenda.quantidade = item.quantidade;
        itemVenda.valor_unitario =
          valorUnitario.toFixed(2);

        itensParaSalvar.push(itemVenda);
      }

      const venda = new Venda();

      venda.numero_venda = numeroVenda;
      venda.data = new Date();
      venda.forma_pagamento = dados.formaPagamento;
      venda.vendedor_id = vendedorId;
      venda.cliente_id = dados.clienteId ?? null;
      venda.total = total.toFixed(2);
      venda.status = VendaStatus.CONCLUIDA;

      const vendaSalva = await queryRunner.manager
        .getRepository(Venda)
        .save(venda);

      for (const itemVenda of itensParaSalvar) {
        itemVenda.venda_id = vendaSalva.id;

        await queryRunner.manager
          .getRepository(ItemVenda)
          .save(itemVenda);
      }

      await queryRunner.commitTransaction();

      return queryRunner.manager.getRepository(Venda).findOneOrFail({
        where: { id: vendaSalva.id },
        relations: { itens: true },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      if (numeroLockObtido) {
        await queryRunner.query(
          `SELECT RELEASE_LOCK('uzze_vendas_numero')`,
        );
      }

      await queryRunner.release();
    }
  }

  async listar(
    page = 1,
    limit = 10,
    data?: string,
    options: { vendedorId?: string; isAdmin: boolean } = {
      isAdmin: true,
    },
  ) {
    const query = this.vendaRepository
      .createQueryBuilder('venda')
      .select([
        'venda.id',
        'venda.numero_venda',
        'venda.data',
        'venda.forma_pagamento',
        'venda.vendedor_id',
        'venda.cliente_id',
        'venda.total',
        'venda.status',
        'venda.created_at',
      ])
      .orderBy('venda.data', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (!options.isAdmin && options.vendedorId) {
      query.andWhere('venda.vendedor_id = :vendedorId', {
        vendedorId: options.vendedorId,
      });
    }

    if (data) {
      query.andWhere('DATE(venda.data) = :data', {
        data,
      });
    }

    const [vendas, total] =
      await query.getManyAndCount();

    return {
      data: vendas.map((venda) => ({
        id: venda.id,
        numero_venda: venda.numero_venda,
        data: venda.data,
        forma_pagamento: venda.forma_pagamento,
        vendedor_id: venda.vendedor_id,
        cliente_id: venda.cliente_id,
        total: Number(venda.total),
        status: venda.status,
        created_at: venda.created_at,
      })),
      meta: buildMeta(total, page, limit),
    };
  }

  async buscarPorId(
    id: string,
    options: { vendedorId?: string; isAdmin: boolean } = {
      isAdmin: true,
    },
  ) {
    const venda = await this.vendaRepository.findOne({
      where: { id },
      relations: {
        itens: true,
      },
    });

    if (!venda) {
      throw new NotFoundException(
        'Venda não encontrada',
      );
    }

    if (!options.isAdmin && venda.vendedor_id !== options.vendedorId) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar esta venda',
      );
    }

    return {
      id: venda.id,
      numero_venda: venda.numero_venda,
      data: venda.data,
      forma_pagamento: venda.forma_pagamento,
      vendedor_id: venda.vendedor_id,
      cliente_id: venda.cliente_id,
      total: Number(venda.total),
      status: venda.status,
      itens: venda.itens.map((item) => ({
        id: item.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: Number(
          item.valor_unitario,
        ),
      })),
    };
  }

  async cancelar(
    id: string,
    usuarioId: string,
    tipoUsuario: string,
  ) {
    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const venda = await queryRunner.manager
        .getRepository(Venda)
        .findOne({
          where: { id },
          relations: {
            itens: true,
          },
        });

      if (!venda) {
        throw new NotFoundException(
          'Venda não encontrada',
        );
      }

      if (venda.status !== VendaStatus.CONCLUIDA) {
        throw new ConflictException(
          'Somente vendas concluídas podem ser canceladas',
        );
      }

      const ehAdmin =
        tipoUsuario === UsuarioTipo.ADMIN;

      const ehVendedor =
        venda.vendedor_id === usuarioId;

      if (!ehAdmin && !ehVendedor) {
        throw new ForbiddenException(
          'Você não tem permissão para cancelar esta venda',
        );
      }

      for (const item of venda.itens) {
        const produto = await queryRunner.manager
          .getRepository(Produto)
          .createQueryBuilder('produto')
          .where('produto.id = :id', {
            id: item.produto_id,
          })
          .setLock('pessimistic_write')
          .getOne();

        if (!produto) {
          throw new NotFoundException(
            `Produto não encontrado: ${item.produto_id}`,
          );
        }

        produto.quantidade += item.quantidade;

        await queryRunner.manager
          .getRepository(Produto)
          .save(produto);
      }

      venda.status = VendaStatus.CANCELADA;

      const vendaCancelada =
        await queryRunner.manager
          .getRepository(Venda)
          .save(venda);

      await queryRunner.commitTransaction();

      return vendaCancelada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async dashboard() {
  const hoje = new Date()
    .toISOString()
    .slice(0, 10);

  const vendasHoje = await this.vendaRepository
    .createQueryBuilder('venda')
    .select('COUNT(*)', 'quantidade')
    .addSelect('COALESCE(SUM(venda.total), 0)', 'total')
    .where('venda.status = :status', {
      status: VendaStatus.CONCLUIDA,
    })
    .andWhere('DATE(venda.data) = :hoje', {
      hoje,
    })
    .getRawOne();

  const totalProdutos = await this.produtoRepository.count({
    where: { status: ProdutoStatus.ATIVO },
  });

  const estoqueBaixo = await this.produtoRepository
    .createQueryBuilder('produto')
    .where('produto.quantidade <= :limite', {
      limite: 5,
    })
    .andWhere('produto.status = :status', {
      status: ProdutoStatus.ATIVO,
    })
    .getCount();

  return {
    vendas_hoje: {
     quantidade: Number(
       vendasHoje?.quantidade ?? 0,
     ),
     total: Math.round(Number(vendasHoje?.total ?? 0) * 100) / 100,
   },
   total_produtos: totalProdutos,
   estoque_baixo: estoqueBaixo,
 };
}

async relatorioEstoqueBaixo(
  limite = 5,
  page = 1,
) {
  if (limite < 0) {
    throw new BadRequestException(
      'O limite deve ser maior ou igual a zero',
    );
  }

  if (page < 1) {
    throw new BadRequestException(
      'A página deve ser maior ou igual a 1',
    );
  }

  const quantidadePorPagina = 10;

  const [produtos, total] =
    await this.produtoRepository.findAndCount({
      where: {
        quantidade: LessThanOrEqual(limite),
        status: ProdutoStatus.ATIVO,
      },
      relations: {
        fornecedor: true,
      },
      order: {
        quantidade: 'ASC',
      },
      skip: (page - 1) * quantidadePorPagina,
      take: quantidadePorPagina,
    });

  return {
    data: produtos.map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      tamanho: produto.tamanho,
      quantidade: produto.quantidade,
      fornecedor: produto.fornecedor?.nome ?? '—',
    })),
    meta: buildMeta(total, page, quantidadePorPagina),
  };
}

  async relatorioVendas(
    dataInicio: string,
    dataFim: string,
  ) {
    if (dataInicio > dataFim) {
      throw new BadRequestException(
        'dataInicio deve ser menor ou igual a dataFim',
      );
    }

    const vendas = await this.vendaRepository
      .createQueryBuilder('venda')
      .select(
        'DATE(venda.data)',
        'data',
      )
      .addSelect(
        'COUNT(*)',
        'quantidade',
      )
      .addSelect(
        'SUM(venda.total)',
        'total',
      )
      .where(
        'venda.status = :status',
        {
          status: VendaStatus.CONCLUIDA,
        },
      )
      .andWhere(
        'DATE(venda.data) >= :dataInicio',
        {
          dataInicio,
        },
      )
      .andWhere(
        'DATE(venda.data) <= :dataFim',
        {
          dataFim,
        },
      )
      .groupBy('DATE(venda.data)')
      .orderBy(
        'DATE(venda.data)',
        'ASC',
      )
      .getRawMany();

    const totalVendas = vendas.reduce(
      (total, venda) =>
        total + Number(venda.quantidade),
      0,
    );

    const totalFaturado = vendas.reduce(
      (total, venda) =>
        total + Number(venda.total),
      0,
    );

    return {
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
      total_vendas: totalVendas,
      total_faturado: Number(
        totalFaturado.toFixed(2),
      ),
      vendas_por_dia: vendas.map(
        (venda) => ({
          data: venda.data,
          quantidade: Number(
            venda.quantidade,
          ),
          total: Number(
            Number(venda.total).toFixed(2),
          ),
        }),
      ),
    };
  }
}