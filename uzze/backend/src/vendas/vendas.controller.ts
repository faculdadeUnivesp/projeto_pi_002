import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { VendasService } from './vendas.service.js';
import { CreateVendaDto } from './dto/create-venda.dto.js';
import { UsuarioTipo } from '../usuarios/entities/usuario.entity.js';

interface RequestComUsuario extends Request {
  user: {
    id: string;
    email: string;
    tipo: UsuarioTipo;
  };
}

@Controller('vendas')
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
  @Req() req: RequestComUsuario,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('data') data?: string,
) {
  return this.vendasService.listar(
    Number(page),
    Number(limit),
    data,
    {
      vendedorId: req.user.id,
      isAdmin: req.user.tipo === UsuarioTipo.ADMIN,
    },
  );
}


@Get(':id')
async buscarPorId(
  @Param('id', ParseUUIDPipe) id: string,
  @Req() req: RequestComUsuario,
) {
  return this.vendasService.buscarPorId(id, {
    vendedorId: req.user.id,
    isAdmin: req.user.tipo === UsuarioTipo.ADMIN,
  });
}
@Patch(':id/cancelar')
async cancelar(
  @Param('id', ParseUUIDPipe) id: string,
  @Req() req: RequestComUsuario,
) {
  return this.vendasService.cancelar(
    id,
    req.user.id,
    req.user.tipo,
  );
}
}
