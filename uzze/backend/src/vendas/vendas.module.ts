import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './entities/venda.entity.js';
import { ItemVenda } from './entities/item-venda.entity.js';
import { VendasService } from './vendas.service.js';
import { VendasController } from './vendas.controller.js';
import { RelatoriosController } from './relatorios.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Venda, ItemVenda])],
  controllers: [
    VendasController,
    RelatoriosController,
  ],
  providers: [VendasService],
  exports: [VendasService],
})
export class VendasModule {}