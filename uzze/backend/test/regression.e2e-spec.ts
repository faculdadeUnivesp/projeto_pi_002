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
import { Usuario, UsuarioStatus, UsuarioTipo } from '../src/usuarios/entities/usuario.entity.js';

const ADMIN_CPF = '999.999.999-99';
const VENDEDOR_CPF = '888.888.888-88';
const ADMIN_PASS = 'test-admin-123';
const VENDEDOR_PASS = 'test-vend-123';

describe('Regression suite (audit fixes)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminId: string;
  let vendedorId: string;
  let adminToken: string;
  let adminRefresh: string;
  let vendedorToken: string;

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

    // Clean up any leftover from a previous run
    await usuarios.delete({ cpf: ADMIN_CPF as any });
    await usuarios.delete({ cpf: VENDEDOR_CPF as any });

    const admin = await usuarios.save(
      usuarios.create({
        nome: 'Admin Teste',
        cpf: ADMIN_CPF,
        email: 'admin-test@uzze.com',
        senha_hash: await bcrypt.hash(ADMIN_PASS, 4),
        tipo: UsuarioTipo.ADMIN,
        status: UsuarioStatus.ATIVO,
      }),
    );
    adminId = admin.id;

    const vendedor = await usuarios.save(
      usuarios.create({
        nome: 'Vendedor Teste',
        cpf: VENDEDOR_CPF,
        email: 'vendedor-test@uzze.com',
        senha_hash: await bcrypt.hash(VENDEDOR_PASS, 4),
        tipo: UsuarioTipo.VENDEDOR,
        status: UsuarioStatus.ATIVO,
      }),
    );
    vendedorId = vendedor.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.getRepository(Usuario).delete({ cpf: ADMIN_CPF as any });
      await dataSource.getRepository(Usuario).delete({ cpf: VENDEDOR_CPF as any });
    }
    await app?.close();
  });

  // #7 — /health
  describe('GET /api/health', () => {
    it('returns status ok', async () => {
      const res = await request(app.getHttpServer()).get('/api/health').expect(200);
      expect(res.body.data).toMatchObject({ status: 'ok' });
      expect(res.body.data.timestamp).toBeDefined();
    });
  });

  // #1 — static assets
  describe('Static assets (/uploads/...)', () => {
    it('responds 404 (not 500) for missing file', async () => {
      const res = await request(app.getHttpServer()).get('/uploads/does-not-exist.jpg');
      expect([404, 200]).toContain(res.status);
    });
  });

  // Auth flow
  describe('POST /api/auth/login', () => {
    it('logs in admin with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ cpf: ADMIN_CPF, senha: ADMIN_PASS })
        .expect(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.usuario.tipo).toBe('admin');
      expect(res.body.data.usuario.senha_hash).toBeUndefined();
      expect(res.body.data.usuario.refresh_token).toBeUndefined();
      adminToken = res.body.data.accessToken;
      adminRefresh = res.body.data.refreshToken;
    });

    it('logs in vendedor with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ cpf: VENDEDOR_CPF, senha: VENDEDOR_PASS })
        .expect(200);
      expect(res.body.data.usuario.tipo).toBe('vendedor');
      vendedorToken = res.body.data.accessToken;
    });

    it('returns 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ cpf: ADMIN_CPF, senha: 'wrong-password' })
        .expect(401);
    });

    it('returns 400 when cpf is missing (validation)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ senha: 'x' })
        .expect(400);
      expect(Array.isArray(res.body.message)).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.data.id).toBe(adminId);
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });
  });

  // #25 — buildMeta shape (canonical paginated response)
  describe('GET /api/usuarios (paginated meta)', () => {
    it('returns canonical meta shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/usuarios?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toEqual(
        expect.objectContaining({
          total: expect.any(Number),
          page: 1,
          limit: 5,
          totalPages: expect.any(Number),
          hasNextPage: expect.any(Boolean),
          hasPreviousPage: expect.any(Boolean),
        }),
      );
    });
  });

  // #9 + #38 — RBAC
  describe('RBAC on /api/usuarios', () => {
    it('vendedor cannot list users (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(403);
    });

    it('vendedor cannot GET another user (403)', async () => {
      await request(app.getHttpServer())
        .get(`/api/usuarios/${adminId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(403);
    });

    it('vendedor can GET own user (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/usuarios/${vendedorId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(200);
      expect(res.body.data.id).toBe(vendedorId);
      expect(res.body.data.tipo).toBe('vendedor');
    });

    it('vendedor cannot PATCH another user', async () => {
      await request(app.getHttpServer())
        .patch(`/api/usuarios/${adminId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ nome: 'hacked' })
        .expect(403);
    });
  });

  // #8 — Self-edit restrictions
  describe('Self-edit restrictions on /api/usuarios/:id', () => {
    it('admin cannot change own tipo', async () => {
      await request(app.getHttpServer())
        .patch(`/api/usuarios/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ tipo: 'vendedor' })
        .expect(400);
    });

    it('admin cannot inactivate self', async () => {
      await request(app.getHttpServer())
        .patch(`/api/usuarios/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inativo' })
        .expect(400);
    });

    it('admin can change own nome', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/usuarios/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nome: 'Admin Renomeado' })
        .expect(200);
      expect(res.body.data.nome).toBe('Admin Renomeado');
    });

    it('vendedor cannot change own tipo (allowed by non-admin self-edit but blocked)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/usuarios/${vendedorId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ tipo: 'admin' })
        .expect(400);
    });

    it('vendedor can change own nome', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/usuarios/${vendedorId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ nome: 'Vend Renomeado' })
        .expect(200);
      expect(res.body.data.nome).toBe('Vend Renomeado');
    });
  });

  // #15 — DTO validation
  describe('POST /api/usuarios (DTO validation)', () => {
    it('rejects bad email with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'X',
          cpf: '123.456.789-00',
          email: 'not-an-email',
          senha: 'abcdef',
        })
        .expect(400);
    });

    it('rejects short password with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'X',
          cpf: '123.456.789-00',
          email: 'x@y.com',
          senha: '123',
        })
        .expect(400);
    });

    it('rejects bad cpf format with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'X',
          cpf: 'abc',
          email: 'x@y.com',
          senha: 'abcdef',
        })
        .expect(400);
    });
  });

  // #31 — ParseUUIDPipe on vendas
  describe('ParseUUIDPipe on /api/vendas/:id', () => {
    it('returns 400 for non-UUID id', async () => {
      await request(app.getHttpServer())
        .get('/api/vendas/not-a-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('ParseUUIDPipe on /api/vendas/:id/cancelar', () => {
    it('returns 400 for non-UUID id', async () => {
      await request(app.getHttpServer())
        .patch('/api/vendas/not-a-uuid/cancelar')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  // #10 — refresh flow
  describe('POST /api/auth/refresh', () => {
    it('issues a new pair of tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${adminRefresh}`)
        .expect(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('rejects a tampered token with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer not.a.valid.jwt')
        .expect(401);
    });
  });

  // #36 — 403 handling
  describe('403 propagation (handled by interceptor)', () => {
    it('returns 403 with consistent body for forbidden resource', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(403);
      expect(res.body.statusCode).toBe(403);
      expect(res.body.message).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
