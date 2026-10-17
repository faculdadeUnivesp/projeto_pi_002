import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, isAbsolute, resolve } from 'path';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
} from 'fs';
import { randomUUID } from 'crypto';

export interface UploadedImage {
  filename: string;
  path: string;
  mimetype: string;
  originalname: string;
  size: number;
}

const FORMATOS_PERMITIDOS = /^image\/(jpeg|png|webp)$/;

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

function magicBytesValidos(buffer: Buffer, mimetype: string): boolean {
  const expected = MAGIC_BYTES[mimetype];
  if (!expected) return false;
  if (buffer.length < expected.length) return false;

  return expected.every((byte, index) => buffer[index] === byte);
}

export function removerArquivo(caminho?: string | null): void {
  if (!caminho) {
    return;
  }

  const caminhoAbsoluto = isAbsolute(caminho)
    ? caminho
    : resolve(process.cwd(), caminho.replace(/^\/+/, ''));

  try {
    if (existsSync(caminhoAbsoluto)) {
      unlinkSync(caminhoAbsoluto);
    }
  } catch {
  }
}

export function configuracaoUploadImagem(pasta: string) {
  return {
    storage: diskStorage({
      destination: (
        _req: unknown,
        _file: Express.Multer.File,
        callback: (error: Error | null, destination: string) => void,
      ) => {
        try {
          mkdirSync(pasta, { recursive: true });
          callback(null, pasta);
        } catch (err) {
          callback(
            err instanceof Error ? err : new Error(String(err)),
            pasta,
          );
        }
      },

      filename: (
        _req: unknown,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
      ) => {
        const extensao = extname(file.originalname).toLowerCase();
        callback(null, `${randomUUID()}${extensao}`);
      },
    }),

    fileFilter: (
      _req: unknown,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!file.mimetype.match(FORMATOS_PERMITIDOS)) {
        return callback(
          new BadRequestException(
            'Apenas imagens JPEG, PNG ou WEBP são permitidas',
          ),
          false,
        );
      }

      callback(null, true);
    },

    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  };
}

export function validarConteudoImagem(arquivo?: UploadedImage): void {
  if (!arquivo) {
    return;
  }

  let buffer: Buffer;

  try {
    buffer = readFileSync(arquivo.path);
  } catch {
    removerArquivo(arquivo.path);

    throw new BadRequestException(
      'Não foi possível ler o arquivo enviado',
    );
  }

  if (!magicBytesValidos(buffer, arquivo.mimetype)) {
    removerArquivo(arquivo.path);

    throw new BadRequestException(
      'O conteúdo do arquivo não corresponde ao tipo declarado',
    );
  }
}
