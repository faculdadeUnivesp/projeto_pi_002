import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

export interface EnderecoViacep {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
}

interface ViacepResposta {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

@Injectable()
export class ViacepService {
  async buscarEndereco(cep: string): Promise<EnderecoViacep> {
    const cepLimpo = cep.replace(/\D/g, '');

    if (!/^\d{8}$/.test(cepLimpo)) {
      throw new BadRequestException(
        'CEP inválido. Informe 8 dígitos.',
      );
    }

    let resposta: ViacepResposta;

    try {
      const http = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      resposta = (await http.json()) as ViacepResposta;
    } catch {
      throw new NotFoundException(
        'Não foi possível consultar o CEP no momento',
      );
    }

    if (
      !resposta ||
      resposta.erro === true ||
      !resposta.logradouro
    ) {
      throw new NotFoundException(
        'CEP não encontrado',
      );
    }

    return {
      cep: resposta.cep ?? cepLimpo,
      rua: resposta.logradouro ?? '',
      bairro: resposta.bairro ?? '',
      cidade: resposta.localidade ?? '',
      estado: resposta.uf ?? '',
      complemento: resposta.complemento ?? '',
    };
  }
}
