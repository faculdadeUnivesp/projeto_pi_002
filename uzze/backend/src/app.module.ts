import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { VendasModule } from './vendas/vendas.module.js';
import { FornecedoresModule } from './fornecedores/fornecedor.module.js';
import { ProdutoModule } from './produto/produto.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'uzze_user',
      password: process.env.DB_PASSWORD || 'uzze_password',
      database: process.env.DB_DATABASE || 'uzze',
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    UsuariosModule,
    VendasModule,
    FornecedoresModule,
    ProdutoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
