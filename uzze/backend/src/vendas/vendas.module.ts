import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './entities/venda.entity.js';
import { ItemVenda } from './entities/item-venda.entity.js';
import { Produto } from '../produto/entities/produto.entity.js';
import { Cliente } from '../clientes/entities/cliente.entity.js';
import { VendasService } from './vendas.service.js';
import { VendasController } from './vendas.controller.js';
import { RelatoriosController } from './relatorios.controller.js';
import { DashboardController } from './dashboard.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venda,
      ItemVenda,
      Produto,
      Cliente,
    ]),
  ],
  controllers: [
    VendasController,
    RelatoriosController,
    DashboardController,
  ],
  providers: [
    VendasService,
  ],
  exports: [
    VendasService,
  ],
})
export class VendasModule {}