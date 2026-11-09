import { Module } from '@nestjs/common';

import { ViacepService } from './viacep.service.js';
import { ViacepController } from './viacep.controller.js';

@Module({
  controllers: [ViacepController],
  providers: [ViacepService],
  exports: [ViacepService],
})
export class ViacepModule {}
