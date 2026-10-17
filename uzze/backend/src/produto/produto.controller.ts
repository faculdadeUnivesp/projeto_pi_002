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
  Query,
  UploadedFile,
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
  readFileSync,
} from 'fs';

import { randomUUID } from 'crypto';

import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { ListProdutoQueryDto } from './dto/list-produto-query.dto.js';

import { ProdutoService } from './produto.service.js';

import type { UploadedFile as ProdutoUploadedFile } from './types/uploaded-file.type.js';

const pastaProdutos =
  './uploads/produtos';

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

function magicBytesValidos(
  buffer: Buffer,
  mimetype: string,
): boolean {
  const expected = MAGIC_BYTES[mimetype];
  if (!expected) return false;
  if (buffer.length < expected.length) return false;
  return expected.every(
    (byte, index) => buffer[index] === byte,
  );
}

const configuracaoUpload = {
  storage: diskStorage({
    destination: (
      _req: unknown,
      _file: Express.Multer.File,
      callback: (error: Error | null, destination: string) => void,
    ) => {
      try {
        mkdirSync(pastaProdutos, { recursive: true });
        callback(null, pastaProdutos);
      } catch (err) {
        callback(
          err instanceof Error ? err : new Error(String(err)),
          pastaProdutos,
        );
      }
    },

    filename: (
      req: unknown,
      file: Express.Multer.File,
      callback: (
        error: Error | null,
        filename: string,
      ) => void,
    ) => {
      const extensao = extname(file.originalname).toLowerCase();
      const nomeArquivo = `${randomUUID()}${extensao}`;

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

    if (!file.mimetype.match(formatosPermitidos)) {
      return callback(
        new BadRequestException(
          'Apenas imagens JPEG, PNG ou WEBP são permitidas',
        ),
        false,
      );
    }

    const path = file.path;
    let buffer: Buffer;
    try {
      buffer = readFileSync(path);
    } catch {
      return callback(
        new BadRequestException('Não foi possível ler o arquivo enviado'),
        false,
      );
    }

    if (!magicBytesValidos(buffer, file.mimetype)) {
      return callback(
        new BadRequestException(
          'O conteúdo do arquivo não corresponde ao tipo declarado',
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