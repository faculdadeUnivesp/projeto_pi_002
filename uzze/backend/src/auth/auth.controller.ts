import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AlterarSenhaDto, UpdateMeDto } from './dto/me.dto.js';
import { Public } from './decorators/public.decorator.js';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard.js';
import { UsuarioTipo } from '../usuarios/entities/usuario.entity.js';
import {
  configuracaoUploadImagem,
  type UploadedImage,
  validarConteudoImagem,
} from '../common/image-upload.js';

const pastaUsuarios = './uploads/usuarios';

const configuracaoUploadUsuario =
  configuracaoUploadImagem(pastaUsuarios);

interface AuthRequest extends Request {
  user: { id: string; email: string; tipo: UsuarioTipo };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: AuthRequest) {
    return this.authService.refreshTokens(req.user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: AuthRequest) {
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  getProfile(@Req() req: AuthRequest) {
    return req.user;
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor(
      'foto',
      configuracaoUploadUsuario,
    ),
  )
  updateMe(
    @Req() req: AuthRequest,
    @Body() dto: UpdateMeDto,
    @UploadedFile() foto?: UploadedImage,
  ) {
    validarConteudoImagem(foto);

    return this.authService.updateMe(req.user.id, dto, foto);
  }

  @Post('alterar-senha')
  @HttpCode(HttpStatus.OK)
  alterarSenha(@Req() req: AuthRequest, @Body() dto: AlterarSenhaDto) {
    return this.authService.alterarSenha(req.user.id, dto);
  }
}
