import { SetMetadata } from '@nestjs/common';
import { UsuarioTipo } from '../../usuarios/entities/usuario.entity.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UsuarioTipo[]) => SetMetadata(ROLES_KEY, roles);
