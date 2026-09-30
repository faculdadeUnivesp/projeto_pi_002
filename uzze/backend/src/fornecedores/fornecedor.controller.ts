import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { CreateFornecedorDto } from './dto/create-fornecedor.dto.js';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto.js';
import { FornecedoresService } from './fornecedor.service.js';

@UseGuards(JwtAuthGuard)
@Controller('fornecedores')
export class FornecedoresController {
  constructor(
    private readonly fornecedoresService: FornecedoresService,
  ) {}

  @Post()
  create(@Body() createFornecedorDto: CreateFornecedorDto) {
    return this.fornecedoresService.create(createFornecedorDto);
  }

  @Get()
  findAll() {
    return this.fornecedoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fornecedoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFornecedorDto: UpdateFornecedorDto,
  ) {
    return this.fornecedoresService.update(id, updateFornecedorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fornecedoresService.remove(id);
  }

  @Patch(':id/ativar')
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.fornecedoresService.activate(id);
  }
}