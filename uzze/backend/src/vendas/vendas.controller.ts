import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { VendasService } from './vendas.service.js';
import { CreateVendaDto } from './dto/create-venda.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

interface RequestComUsuario extends Request {
  user: {
    id: string;
    email: string;
    tipo: string;
  };
}

@Controller('vendas')
@UseGuards(JwtAuthGuard)
export class VendasController {
  constructor(
    private readonly vendasService: VendasService,
  ) {}

  @Post()
  async criar(
    @Body() dados: CreateVendaDto,
    @Req() req: RequestComUsuario,
  ) {
    return this.vendasService.criar(
      dados,
      req.user.id,
    );
  }
  @Get()
async listar(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('data') data?: string,
) {
  return this.vendasService.listar(
    Number(page),
    Number(limit),
    data,
  );
}


@Get(':id')
async buscarPorId(@Param('id') id: string) {
  return this.vendasService.buscarPorId(id);
}
@Patch(':id/cancelar')
async cancelar(
  @Param('id') id: string,
  @Req() req: RequestComUsuario,
) {
  return this.vendasService.cancelar(
    id,
    req.user.id,
    req.user.tipo,
  );
}
}
