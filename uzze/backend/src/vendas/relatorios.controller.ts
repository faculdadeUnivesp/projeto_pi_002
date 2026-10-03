import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VendasService } from './vendas.service.js';
import { RelatorioVendasDto } from './dto/relatorio-vendas.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('relatorios')
@UseGuards(JwtAuthGuard)
export class RelatoriosController {
  constructor(
    private readonly vendasService: VendasService,
  ) {}

  @Get('vendas')
  relatorioVendas(
    @Query() dados: RelatorioVendasDto,
  ) {
    return this.vendasService.relatorioVendas(
      dados.dataInicio,
      dados.dataFim,
    );
  }

  @Get('estoque-baixo')
  relatorioEstoqueBaixo(
    @Query('limite') limite = '5',
    @Query('page') page = '1',
  ) {
    return this.vendasService.relatorioEstoqueBaixo(
      Number(limite),
      Number(page),
    );
  }
}