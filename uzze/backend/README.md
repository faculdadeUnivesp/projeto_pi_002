# UZZE — API Backend

Backend do sistema de gestão de estoque, fornecedores, vendas e relatórios da loja de roupas UZZE.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | NestJS 12 |
| ORM | TypeORM |
| Banco | MySQL 8 (Docker) |
| Autenticação | JWT (access + refresh) com Passport |
| Validação | class-validator + class-transformer |
| Uploads | Multer |
| Testes | Vitest |
| Lint | oxlint + Prettier |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22.22+ (ou 24.15+)
- [Docker](https://www.docker.com/) + Docker Compose
- MySQL 8 (via Docker Compose na pasta `uzze/`)

## Setup

### 1. Subir banco de dados

```bash
# Na pasta raiz do projeto (uzze/)
docker-compose up -d
```

O MySQL fica disponível na porta **3307**.

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e defina `JWT_SECRET` e `JWT_REFRESH_SECRET`. Os dois são obrigatórios em desenvolvimento e produção.

### 3. Instalar dependências

```bash
npm install
```

### 4. Executar migrations

```bash
npm run migration:run
```

### 5. Popular dados de teste

```bash
npm run seed
```

O seed cria o administrador com CPF `000.000.000-00` e uma senha aleatória, exibida uma única vez no terminal.

### 6. Iniciar servidor de desenvolvimento

```bash
npm run start:dev
```

O backend estará disponível em `http://localhost:3000`. A API fica em `http://localhost:3000/api` e os uploads em `http://localhost:3000/uploads`.

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `DB_HOST` | Host do MySQL | `localhost` |
| `DB_PORT` | Porta do MySQL | `3307` |
| `DB_DATABASE` | Nome do banco | `uzze` |
| `DB_USER` | Usuário do MySQL | `uzze_user` |
| `DB_PASSWORD` | Senha do MySQL | `uzze_password` |
| `DB_ROOT_PASSWORD` | Senha root do MySQL | `rootpassword` |
| `JWT_SECRET` | Segredo do access token (obrigatório) | — |
| `JWT_EXPIRATION` | TTL do access token (segundos ou `1h`) | `3600` |
| `JWT_REFRESH_SECRET` | Segredo do refresh token (obrigatório) | — |
| `JWT_REFRESH_EXPIRATION` | TTL do refresh token (segundos ou `7d`) | `604800` |
| `PORT` | Porta do servidor | `3000` |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Desenvolvimento com watch |
| `npm run start:debug` | Desenvolvimento com debug e watch |
| `npm run build` | Build de produção |
| `npm run start:prod` | Rodar build de produção |
| `npm run migration:run` | Executar migrations pendentes |
| `npm run migration:generate -- src/database/migrations/nome` | Gerar migration a partir de mudanças na entity |
| `npm run migration:revert` | Reverter última migration |
| `npm run seed` | Popular banco com admin de teste |
| `npm run test` | Rodar testes unitários |
| `npm run test:watch` | Rodar testes em watch |
| `npm run test:cov` | Rodar testes com cobertura |
| `npm run test:e2e` | Rodar testes end-to-end |
| `npm run lint` | Verificar lint |
| `npm run format` | Formatar código com Prettier |

## Estrutura de Pastas

```
src/
├── auth/                    # Autenticação
│   ├── dto/                 #   Login, perfil e troca de senha
│   ├── decorators/          #   @Public e @Roles
│   ├── guards/              #   JwtAuthGuard, JwtRefreshAuthGuard, RolesGuard
│   ├── strategies/          #   JwtStrategy, JwtRefreshStrategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── usuarios/                # CRUD de usuários
│   ├── entities/            #   Entity Usuario
│   ├── dto/                 #   Create/Update DTOs
│   ├── usuarios.controller.ts
│   ├── usuarios.service.ts
│   └── usuarios.module.ts
├── fornecedores/            # CRUD de fornecedores
│   ├── entities/            #   Entity Fornecedor
│   ├── dto/                 #   Create/Update DTOs
│   ├── fornecedor.controller.ts
│   ├── fornecedor.service.ts
│   └── fornecedor.module.ts
├── produto/                 # CRUD de produtos
│   ├── entities/            #   Entity Produto
│   ├── dto/                 #   Create/Update/List DTOs
│   ├── produto.controller.ts
│   ├── produto.service.ts
│   └── produto.module.ts
├── vendas/                  # Vendas, dashboard e relatórios
│   ├── entities/            #   Entities Venda e ItemVenda
│   ├── dto/                 #   CreateVenda e RelatorioVendas
│   ├── vendas.controller.ts
│   ├── dashboard.controller.ts
│   ├── relatorios.controller.ts
│   ├── vendas.service.ts
│   └── vendas.module.ts
├── endereco/                # Entity Endereco
├── common/                  # Compartilhado
│   ├── filters/             #   HttpExceptionFilter
│   ├── interceptors/        #   TransformInterceptor
│   └── pagination.ts        #   Metadados de paginação
├── database/                # Dados do banco
│   ├── migrations/
│   ├── seeds/
│   └── database.config.ts
├── app.controller.ts        # Health check
├── app.module.ts
└── main.ts
```

## Arquitetura

Padrão **Controller → Service → Repository** com Dependency Injection.

- **Controllers** — definem rotas, validam entrada via DTOs
- **Services** — lógica de negócio, interage com repositories
- **Repositories** — acesso a dados via TypeORM

### Guards globais

- `JwtAuthGuard` — protege todas as rotas por padrão
- `RolesGuard` — aplica `@Roles()` quando presente
- `@Public()` — libera rotas específicas, como login, refresh e health

### Interceptors e Filters globais

- `TransformInterceptor` — envolve respostas em `{ data: ... }`
- `HttpExceptionFilter` — formato consistente de erros: `{ statusCode, message, timestamp }`; em produção, erros internos não expõem detalhes

### Validação

`ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true` — propriedades não mapeadas nos DTOs são rejeitadas.

### Uploads

Imagens de produtos são salvas em `uploads/produtos` e servidas em `/uploads`. São aceitos apenas JPEG, PNG e WEBP de até 5 MB, com validação de magic bytes.

## Endpoints

Todas as rotas usam o prefixo `/api`.

### Autenticação

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/auth/login` | Login (CPF + senha) | Público |
| `POST` | `/auth/refresh` | Renovar access token | Refresh Token |
| `POST` | `/auth/logout` | Invalidar refresh token | Access Token |
| `GET` | `/auth/me` | Dados do usuário logado | Access Token |
| `PATCH` | `/auth/me` | Atualizar nome, email ou foto | Access Token |
| `POST` | `/auth/alterar-senha` | Trocar a própria senha | Access Token |

### Usuários

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/usuarios` | Criar usuário | Admin |
| `GET` | `/usuarios` | Listar usuários (paginado) | Admin |
| `GET` | `/usuarios/:id` | Buscar por ID | Admin ou o próprio usuário |
| `PATCH` | `/usuarios/:id` | Atualizar usuário | Admin ou o próprio usuário |
| `DELETE` | `/usuarios/:id` | Soft delete (status → inativo) | Admin |

### Fornecedores

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/fornecedores` | Criar fornecedor | Access Token |
| `GET` | `/fornecedores` | Listar fornecedores (paginado, filtros `status` e `busca`) | Access Token |
| `GET` | `/fornecedores/:id` | Buscar por ID | Access Token |
| `PATCH` | `/fornecedores/:id` | Atualizar fornecedor | Access Token |
| `DELETE` | `/fornecedores/:id` | Remover fornecedor | Access Token |
| `PATCH` | `/fornecedores/:id/ativar` | Reativar fornecedor | Access Token |

### Produtos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/produtos` | Criar produto (multipart, campo `imagem`) | Access Token |
| `GET` | `/produtos` | Listar produtos (paginado e com filtros) | Access Token |
| `GET` | `/produtos/opcoes` | Listar categorias, materiais, tamanhos e modelos | Access Token |
| `GET` | `/produtos/:id` | Buscar por ID | Access Token |
| `PATCH` | `/produtos/:id` | Atualizar produto (multipart opcional) | Access Token |
| `DELETE` | `/produtos/:id` | Remover produto | Access Token |
| `PATCH` | `/produtos/:id/ativar` | Reativar produto | Access Token |

### Vendas

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/vendas` | Registrar venda | Access Token |
| `GET` | `/vendas` | Listar vendas (admin vê todas; vendedor vê as próprias) | Access Token |
| `GET` | `/vendas/:id` | Buscar venda por ID | Access Token |
| `PATCH` | `/vendas/:id/cancelar` | Cancelar venda | Access Token |

### Dashboard e Relatórios

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `GET` | `/dashboard` | Indicadores do dashboard | Access Token |
| `GET` | `/relatorios/vendas` | Relatório de vendas (`dataInicio`, `dataFim`) | Access Token |
| `GET` | `/relatorios/estoque-baixo` | Relatório de estoque baixo (`limite`, `page`) | Access Token |

### Health

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `GET` | `/health` | Status da API | Público |

## Autenticação

- **Access Token** — TTL de 1h (`JWT_EXPIRATION`), enviado no header `Authorization: Bearer <token>`
- **Refresh Token** — TTL de 7d (`JWT_REFRESH_EXPIRATION`), salvo no banco
- **Refresh automático** — o frontend renova o access token via `POST /auth/refresh` quando recebe 401
- **Roles** — `admin` e `vendedor` via enum `UsuarioTipo`, controlado por `@Roles()` + `RolesGuard`

## Regras de Negócio

- Senhas armazenadas com **bcrypt** (hash, nunca texto plano)
- CPF validado e único no banco
- `ultimo_acesso` atualizado a cada login
- Soft delete em usuários (`status` → `inativo`)
- Vendedores só acessam as próprias vendas; tentativas de acesso cruzado retornam 403
- Troca de senha invalida o refresh token atual

## Credenciais de Teste

| Campo | Valor |
|-------|-------|
| CPF | `000.000.000-00` |
| Senha | Gerada e exibida uma vez por `npm run seed` |
| Perfil | admin |

Se o administrador já existir, o seed não altera a senha.
