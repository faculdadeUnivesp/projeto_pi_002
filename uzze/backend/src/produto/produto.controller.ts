import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import {
  extname,
} from 'path';

import {
  mkdirSync,
} from 'fs';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';

import { ProdutoService } from './produto.service.js';

import type { UploadedFile as ProdutoUploadedFile } from './types/uploaded-file.type.js';

const pastaProdutos =
  './uploads/produtos';

mkdirSync(
  pastaProdutos,
  {
    recursive: true,
  },
);

const configuracaoUpload = {
  storage: diskStorage({
    destination: pastaProdutos,

    filename: (
      req: unknown,
      file: Express.Multer.File,
      callback: (
        error: Error | null,
        filename: string,
      ) => void,
    ) => {
      const nomeArquivo =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9,
        )}${extname(file.originalname)}`;

      callback(
        null,
        nomeArquivo,
      );
    },
  }),

  fileFilter: (
    req: unknown,
    file: Express.Multer.File,
    callback: (
      error: Error | null,
      acceptFile: boolean,
    ) => void,
  ) => {
    const formatosPermitidos =
      /^image\/(jpeg|png|webp)$/;

    if (
      !file.mimetype.match(
        formatosPermitidos,
      )
    ) {
      return callback(
        new BadRequestException(
          'Apenas imagens JPEG, PNG ou WEBP são permitidas',
        ),
        false,
      );
    }

    callback(
      null,
      true,
    );
  },

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
};

@UseGuards(JwtAuthGuard)
@Controller('produtos')
export class ProdutoController {
  constructor(
    private readonly produtoService:
      ProdutoService,
  ) {}

  @Post()
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
    return this.produtoService.create(
      dto,
      imagem,
    );
  }

  @Get()
  findAll() {
    return this.produtoService.findAll();
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
    return this.produtoService.update(
      id,
      dto,
      imagem,
    );
  }

  @Delete(':id')
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