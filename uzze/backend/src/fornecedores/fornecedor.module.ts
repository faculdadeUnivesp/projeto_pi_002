import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Endereco } from '../endereco/entities/endereco.entity.js';

import { Fornecedor } from './entities/fornecedor.entity.js';
import { FornecedoresController } from './fornecedor.controller.js';
import { FornecedoresService } from './fornecedor.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fornecedor,
      Endereco,
    ]),
  ],

  controllers: [
    FornecedoresController,
  ],

  providers: [
    FornecedoresService,
  ],

  exports: [
    FornecedoresService,
  ],
})
export class FornecedoresModule {}