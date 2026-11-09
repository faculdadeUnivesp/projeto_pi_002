import { Test } from '@nestjs/testing';
import { vi } from 'vitest';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ViacepService } from './viacep.service.js';

describe('ViacepService', () => {
  let service: ViacepService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ViacepService],
    }).compile();

    service = module.get(ViacepService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna o endereço a partir de um CEP válido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            cep: '01310-100',
            logradouro: 'Avenida Paulista',
            bairro: 'Bela Vista',
            localidade: 'São Paulo',
            uf: 'SP',
            complemento: 'de 1 a 2000',
          }),
      }),
    );

    const resultado = await service.buscarEndereco('01310-100');

    expect(resultado).toEqual({
      cep: '01310-100',
      rua: 'Avenida Paulista',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      complemento: 'de 1 a 2000',
    });
  });

  it('lança BadRequest para CEP com menos de 8 dígitos', async () => {
    await expect(
      service.buscarEndereco('123'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lança NotFound para CEP inexistente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ erro: true }),
      }),
    );

    await expect(
      service.buscarEndereco('00000-000'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança NotFound quando a consulta ao ViaCEP falha', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error')),
    );

    await expect(
      service.buscarEndereco('01310-100'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
