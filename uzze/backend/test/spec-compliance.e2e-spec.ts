import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor.js';
import {
  Usuario,
  UsuarioStatus,
  UsuarioTipo,
} from '../src/usuarios/entities/usuario.entity.js';
import {
  Fornecedor,
  FornecedorStatus,
} from '../src/fornecedores/entities/fornecedor.entity.js';
import {
  Produto,
  ProdutoGenero,
  ProdutoStatus,
} from '../src/produto/entities/produto.entity.js';
import {
  Cliente,
} from '../src/clientes/entities/cliente.entity.js';

const ADMIN_CPF = '777.777.777-77';
const VENDEDOR_CPF = '666.666.666-66';
const ADMIN_PASS = 'test-admin-123';
const VENDEDOR_PASS = 'test-vend-123';

describe('Spec compliance suite (RBAC, fornecedor, clientes, vendas)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminToken: string;
  let vendedorToken: string;

  let fornecedorId: string;
  let produtoId: string;
  let clienteId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    dataSource = app.get(DataSource);
    const usuarios = dataSource.getRepository(Usuario);

    // Limpa resíduos de execuções anteriores (para tornar o teste idempotente)
    await dataSource.query('DELETE FROM vendas');
    await dataSource
      .getRepository(Produto)
      .delete({ nome: 'Camiseta Teste' as any });
    await dataSource
      .getRepository(Fornecedor)
      .delete({ cnpj: '12.345.678/0001-99' as any });
    await dataSource
      .getRepository(Cliente)
      .delete({ cpf_cnpj: '222.222.222-22' as any });

    await usuarios.delete({ cpf: ADMIN_CPF as any });
    await usuarios.delete({ cpf: VENDEDOR_CPF as any });

    await usuarios.save(
      usuarios.create({
        nome: 'Admin Teste',
        cpf: ADMIN_CPF,
        email: 'admin-compliance@uzze.com',
        senha_hash: await bcrypt.hash(ADMIN_PASS, 4),
        tipo: UsuarioTipo.ADMIN,
        status: UsuarioStatus.ATIVO,
      }),
    );

    await usuarios.save(
      usuarios.create({
        nome: 'Vendedor Teste',
        cpf: VENDEDOR_CPF,
        email: 'vendedor-compliance@uzze.com',
        senha_hash: await bcrypt.hash(VENDEDOR_PASS, 4),
        tipo: UsuarioTipo.VENDEDOR,
        status: UsuarioStatus.ATIVO,
      }),
    );

    const loginAdmin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ cpf: ADMIN_CPF, senha: ADMIN_PASS })
      .expect(200);
    adminToken = loginAdmin.body.data.accessToken;

    const loginVendedor = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ cpf: VENDEDOR_CPF, senha: VENDEDOR_PASS })
      .expect(200);
    vendedorToken = loginVendedor.body.data.accessToken;

    const fornecedores = dataSource.getRepository(Fornecedor);
    const fornecedor = await fornecedores.save(
      fornecedores.create({
        nome: 'Fornecedor Teste',
        cnpj: '12.345.678/0001-99',
        email: 'fornecedor@teste.com',
        contato: '14999999999',
        status: FornecedorStatus.ATIVO,
        endereco_id: null,
      }),
    );
    fornecedorId = fornecedor.id;

    const produtos = dataSource.getRepository(Produto);
    const produto = await produtos.save(
      produtos.create({
        nome: 'Camiseta Teste',
        categoria: 'camiseta',
        material: 'algodao',
        tamanho: 'M',
        valor: 79.9,
        genero: ProdutoGenero.UNISSEX,
        modelo: 'regular',
        quantidade: 10,
        imagem: null,
        descricao: null,
        fornecedor_id: fornecedorId,
        status: ProdutoStatus.ATIVO,
      }),
    );
    produtoId = produto.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query('DELETE FROM vendas');
      await dataSource.getRepository(Produto).delete({ id: produtoId as any });
      await dataSource.getRepository(Fornecedor).delete({ id: fornecedorId as any });
      await dataSource.getRepository(Cliente).delete({ cpf_cnpj: '222.222.222-22' as any });
      await dataSource.getRepository(Usuario).delete({ cpf: ADMIN_CPF as any });
      await dataSource.getRepository(Usuario).delete({ cpf: VENDEDOR_CPF as any });
    }
    await app?.close();
  });

  describe('RBAC em /api/produtos', () => {
    it('vendedor não pode criar produto (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/produtos')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          nome: 'Produto Indevido',
          categoria: 'camiseta',
          material: 'algodao',
          tamanho: 'P',
          valor: 50,
          genero: 'unissex',
          modelo: 'regular',
          quantidade: 5,
          fornecedor_id: fornecedorId,
        })
        .expect(403);
    });

    it('vendedor pode listar produtos (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/produtos')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('vendedor não pode atualizar produto (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/produtos/${produtoId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ quantidade: 999 })
        .expect(403);
    });

    it('vendedor não pode excluir produto (403)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/produtos/${produtoId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(403);
    });
  });

  describe('RBAC e regras em /api/fornecedores', () => {
    it('vendedor não pode criar fornecedor (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/fornecedores')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          nome: 'Fornecedor Indevido',
          cnpj: '98.765.432/0001-10',
        })
        .expect(403);
    });

    it('inativar fornecedor já inativo retorna 409', async () => {
      const primeira = await request(app.getHttpServer())
        .delete(`/api/fornecedores/${fornecedorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(primeira.body.data.status).toBe('inativo');

      await request(app.getHttpServer())
        .delete(`/api/fornecedores/${fornecedorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);

      await request(app.getHttpServer())
        .patch(`/api/fornecedores/${fornecedorId}/ativar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('/api/clientes', () => {
    it('admin cria cliente (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Maria Cliente',
          cpf_cnpj: '222.222.222-22',
          email: 'maria@email.com',
          telefone: '14988887777',
        })
        .expect(201);
      clienteId = res.body.data.id;
    });

    it('admin não cria cliente com CPF/CNPJ duplicado (409)', async () => {
      await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Outra Maria',
          cpf_cnpj: '222.222.222-22',
        })
        .expect(409);
    });

    it('vendedor não pode criar cliente (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ nome: 'Cliente Indevido', cpf_cnpj: '333.333.333-33' })
        .expect(403);
    });

    it('vendedor pode listar clientes (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/clientes')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('/api/vendas (baixa, estorno e cliente)', () => {
    let vendaId: string;

    it('cria venda com cliente e baixa o estoque (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/vendas')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          formaPagamento: 'pix',
          clienteId,
          itens: [{ produtoId, quantidade: 2 }],
        })
        .expect(201);

      vendaId = res.body.data.id;
      expect(res.body.data.cliente_id).toBe(clienteId);

      const produtoApos = await dataSource
        .getRepository(Produto)
        .findOne({ where: { id: produtoId } });
      expect(produtoApos?.quantidade).toBe(8);
    });

    it('estoque insuficiente retorna 409 sem alterar saldo', async () => {
      await request(app.getHttpServer())
        .post('/api/vendas')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          formaPagamento: 'pix',
          itens: [{ produtoId, quantidade: 999 }],
        })
        .expect(409);

      const produtoApos = await dataSource
        .getRepository(Produto)
        .findOne({ where: { id: produtoId } });
      expect(produtoApos?.quantidade).toBe(8);
    });

    it('produto duplicado no pedido retorna 400', async () => {
      await request(app.getHttpServer())
        .post('/api/vendas')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          formaPagamento: 'pix',
          itens: [
            { produtoId, quantidade: 1 },
            { produtoId, quantidade: 1 },
          ],
        })
        .expect(400);
    });

    it('venda com cliente inexistente retorna 404', async () => {
      await request(app.getHttpServer())
        .post('/api/vendas')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          formaPagamento: 'pix',
          clienteId: '00000000-0000-0000-0000-000000000000',
          itens: [{ produtoId, quantidade: 1 }],
        })
        .expect(404);
    });

    it('cancela a venda e estorna o estoque (200)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/vendas/${vendaId}/cancelar`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(200);

      const produtoApos = await dataSource
        .getRepository(Produto)
        .findOne({ where: { id: produtoId } });
      expect(produtoApos?.quantidade).toBe(10);
    });

    it('cancelar venda já cancelada retorna 409', async () => {
      await request(app.getHttpServer())
        .patch(`/api/vendas/${vendaId}/cancelar`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(409);
    });
  });
});
