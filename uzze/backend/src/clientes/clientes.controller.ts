import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ClientesService } from './clientes.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { ClienteStatus } from './entities/cliente.entity.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UsuarioTipo } from '../usuarios/entities/usuario.entity.js';

@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  @Post()
  @Roles(UsuarioTipo.ADMIN)
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('busca') busca?: string,
    @Query('status') status?: ClienteStatus,
  ) {
    return this.clientesService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      busca,
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UsuarioTipo.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UsuarioTipo.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.remove(id);
  }

  @Patch(':id/ativar')
  @Roles(UsuarioTipo.ADMIN)
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.activate(id);
  }
}
