import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { ViacepService } from './viacep.service.js';

@Controller('viacep')
export class ViacepController {
  constructor(
    private readonly viacepService: ViacepService,
  ) {}

  @Get(':cep')
  buscarEndereco(@Param('cep') cep: string) {
    return this.viacepService.buscarEndereco(cep);
  }
}
