import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Venda,
  VendaStatus,
} from './entities/venda.entity.js';
import { ItemVenda } from './entities/item-venda.entity.js';
import { CreateVendaDto } from './dto/create-venda.dto.js';
import { UsuarioTipo } from '../usuarios/entities/usuario.entity.js';

@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Venda)
    private readonly vendaRepository: Repository<Venda>,

    @InjectRepository(ItemVenda)
    private readonly itemVendaRepository: Repository<ItemVenda>,
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

    /*
     * A validação de produto e estoque será integrada
     * posteriormente ao Módulo 2.
     *
     * Por enquanto, não alteramos estoque nem calculamos
     * o valor da venda sem a entidade Produto.
     */

    throw new NotFoundException(
      'Integração com o Módulo 2 ainda não realizada',
    );
  }

  async listar(page = 1, limit = 10, data?: string) {
  const query = this.vendaRepository
    .createQueryBuilder('venda')
    .select([
      'venda.id',
      'venda.numero_venda',
      'venda.data',
      'venda.forma_pagamento',
      'venda.vendedor_id',
      'venda.total',
      'venda.status',
      'venda.created_at',
    ])
    .orderBy('venda.data', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  if (data) {
    query.andWhere('DATE(venda.data) = :data', {
      data,
    });
  }

  const [vendas, total] = await query.getManyAndCount();

  return {
    data: vendas.map((venda) => ({
      id: venda.id,
      numero_venda: venda.numero_venda,
      data: venda.data,
      forma_pagamento: venda.forma_pagamento,
      vendedor_id: venda.vendedor_id,
      total: Number(venda.total),
      status: venda.status,
      created_at: venda.created_at,
    })),
    meta: {
      total,
      page,
      limit,
    },
  };
}

  async buscarPorId(id: string) {
  const venda = await this.vendaRepository.findOne({
    where: { id },
    relations: {
      itens: true,
    },
  });

  if (!venda) {
    throw new NotFoundException('Venda não encontrada');
  }

  return {
    data: {
      id: venda.id,
      numero_venda: venda.numero_venda,
      data: venda.data,
      forma_pagamento: venda.forma_pagamento,
      vendedor_id: venda.vendedor_id,
      total: Number(venda.total),
      status: venda.status,
      itens: venda.itens.map((item) => ({
        id: item.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: Number(item.valor_unitario),
      })),
    },
  };
}

  async cancelar(id: string, usuarioId: string, tipoUsuario: string) {
  const venda = await this.vendaRepository.findOne({
    where: { id },
  });

  if (!venda) {
    throw new NotFoundException('Venda não encontrada');
  }

  if (venda.status !== VendaStatus.CONCLUIDA) {
    throw new BadRequestException(
      'Somente vendas concluídas podem ser canceladas',
    );
  }

  const ehAdmin = tipoUsuario === UsuarioTipo.ADMIN;
  const ehVendedor = venda.vendedor_id === usuarioId;

  if (!ehAdmin && !ehVendedor) {
    throw new BadRequestException(
      'Você não tem permissão para cancelar esta venda',
    );
  }

  venda.status = VendaStatus.CANCELADA;

  return this.vendaRepository.save(venda);
  }
  async relatorioVendas(dataInicio: string, dataFim: string) {
  if (dataInicio > dataFim) {
    throw new BadRequestException(
      'dataInicio deve ser menor ou igual a dataFim',
    );
  }

  const vendas = await this.vendaRepository
    .createQueryBuilder('venda')
    .select('DATE(venda.data)', 'data')
    .addSelect('COUNT(*)', 'quantidade')
    .addSelect('SUM(venda.total)', 'total')
    .where('venda.status = :status', {
      status: VendaStatus.CONCLUIDA,
    })
    .andWhere('DATE(venda.data) >= :dataInicio', {
      dataInicio,
    })
    .andWhere('DATE(venda.data) <= :dataFim', {
      dataFim,
    })
    .groupBy('DATE(venda.data)')
    .orderBy('DATE(venda.data)', 'ASC')
    .getRawMany();

  const totalVendas = vendas.reduce(
    (total, venda) => total + Number(venda.quantidade),
    0,
  );

  const totalFaturado = vendas.reduce(
    (total, venda) => total + Number(venda.total),
    0,
  );

  return {
    data: {
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
      total_vendas: totalVendas,
      total_faturado: Number(totalFaturado.toFixed(2)),
      vendas_por_dia: vendas.map((venda) => ({
        data: venda.data,
        quantidade: Number(venda.quantidade),
        total: Number(Number(venda.total).toFixed(2)),
      })),
    },
  };
}
}