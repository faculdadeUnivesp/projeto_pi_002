import { Module } from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import { Fornecedor } from '../fornecedores/entities/fornecedor.entity.js';

import { Produto } from './entities/produto.entity.js';

import { ProdutoController } from './produto.controller.js';
import { ProdutoService } from './produto.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Produto,
      Fornecedor,
    ]),
  ],

  controllers: [
    ProdutoController,
  ],

  providers: [
    ProdutoService,
  ],

  exports: [
    ProdutoService,
  ],
})
export class ProdutoModule {}