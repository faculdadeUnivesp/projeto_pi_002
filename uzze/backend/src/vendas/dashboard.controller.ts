import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VendasService } from './vendas.service.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly vendasService: VendasService,
  ) {}

  @Get()
  dashboard() {
    return this.vendasService.dashboard();
  }
}