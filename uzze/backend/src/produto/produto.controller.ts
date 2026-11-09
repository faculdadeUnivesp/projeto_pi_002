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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  configuracaoUploadImagem,
  validarConteudoImagem,
} from '../common/image-upload.js';

import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { ListProdutoQueryDto } from './dto/list-produto-query.dto.js';

import { ProdutoService } from './produto.service.js';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { UsuarioTipo } from '../usuarios/entities/usuario.entity.js';

import type { UploadedFile as ProdutoUploadedFile } from './types/uploaded-file.type.js';

const pastaProdutos =
  './uploads/produtos';

const configuracaoUpload =
  configuracaoUploadImagem(pastaProdutos);

@Controller('produtos')
export class ProdutoController {
  constructor(
    private readonly produtoService:
      ProdutoService,
  ) {}

  @Post()
  @Roles(UsuarioTipo.ADMIN)
  @UseInterceptors(
    FileInterceptor(
      'imagem',
      configuracaoUpload,
    ),
  )
  create(
    @Body()
    dto: CreateProdutoDto,

    @UploadedFile()
    imagem?: ProdutoUploadedFile,
  ) {
    validarConteudoImagem(imagem);

    return this.produtoService.create(
      dto,
      imagem,
    );
  }

  // MUST be declared before @Get(':id') below so that the literal path
  // "opcoes" is not consumed by the dynamic :id route and rejected by
  // ParseUUIDPipe.
  @Get('opcoes')
  findOpcoes() {
    return this.produtoService.findOpcoes();
  }

  @Get()
findAll(
  @Query()
  query: ListProdutoQueryDto,
) {
  return this.produtoService.findAll(
    query,
  );
}

@Get(':id')
findOne(
  @Param(
    'id',
    ParseUUIDPipe,
  )
  id: string,
) {
  return this.produtoService.findOne(
    id,
  );
}

  @Patch(':id')
  @Roles(UsuarioTipo.ADMIN)
  @UseInterceptors(
    FileInterceptor(
      'imagem',
      configuracaoUpload,
    ),
  )
  update(
    @Param(
      'id',
      ParseUUIDPipe,
    )
    id: string,

    @Body()
    dto: UpdateProdutoDto,

    @UploadedFile()
    imagem?: ProdutoUploadedFile,
  ) {
    validarConteudoImagem(imagem);

    return this.produtoService.update(
      id,
      dto,
      imagem,
    );
  }

  @Delete(':id')
  @Roles(UsuarioTipo.ADMIN)
  remove(
    @Param(
      'id',
      ParseUUIDPipe,
    )
    id: string,
  ) {
    return this.produtoService.remove(
      id,
    );
  }

  @Patch(':id/ativar')
  @Roles(UsuarioTipo.ADMIN)
  activate(
    @Param(
      'id',
      ParseUUIDPipe,
    )
    id: string,
  ) {
    return this.produtoService.activate(
      id,
    );
  }
}