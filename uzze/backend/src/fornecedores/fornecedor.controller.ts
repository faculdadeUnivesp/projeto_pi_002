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
} from '@nestjs/common';

import { CreateFornecedorDto } from './dto/create-fornecedor.dto.js';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto.js';
import { FornecedoresService } from './fornecedor.service.js';
import { FornecedorStatus } from './entities/fornecedor.entity.js';

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
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: FornecedorStatus,
    @Query('busca') busca?: string,
  ) {
    return this.fornecedoresService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      status,
      busca,
    );
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