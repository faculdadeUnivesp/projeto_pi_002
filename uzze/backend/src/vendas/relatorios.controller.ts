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
  async relatorioVendas(
    @Query() dados: RelatorioVendasDto,
  ) {
    return this.vendasService.relatorioVendas(
      dados.dataInicio,
      dados.dataFim,
    );
  }
}