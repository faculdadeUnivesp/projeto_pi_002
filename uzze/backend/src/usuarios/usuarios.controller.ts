import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsuariosService, AuthenticatedUser } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UsuarioTipo } from './entities/usuario.entity.js';

interface RequestComUsuario extends Request {
  user: AuthenticatedUser;
}

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(UsuarioTipo.ADMIN)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles(UsuarioTipo.ADMIN)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('perfil') perfil?: string,
    @Query('status') status?: string,
  ) {
    return this.usuariosService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      perfil,
      status as any,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestComUsuario,
  ) {
    const isAdmin = req.user.tipo === UsuarioTipo.ADMIN;
    const isSelf = req.user.id === id;
    if (!isAdmin && !isSelf) {
      throw new ForbiddenException(
        'Você só pode consultar o seu próprio usuário',
      );
    }
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Req() req: RequestComUsuario,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto, req.user);
  }

  @Delete(':id')
  @Roles(UsuarioTipo.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.remove(id);
  }
}
