# UZZE — API Backend

Backend do sistema de gestão de estoque para loja de roupas UZZE.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | NestJS 12 |
| ORM | TypeORM |
| Banco | MySQL 8 (Docker) |
| Autenticação | JWT (access + refresh) com Passport |
| Validação | class-validator + class-transformer |
| Testes | Vitest |
| Lint | oxlint + Prettier |

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
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

Edite o `.env` conforme necessário.

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

### 6. Iniciar servidor de desenvolvimento

```bash
npm run start:dev
```

O backend estará disponível em `http://localhost:3000`.

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `DB_HOST` | Host do MySQL | `localhost` |
| `DB_PORT` | Porta do MySQL | `3307` |
| `DB_DATABASE` | Nome do banco | `uzze` |
| `DB_USER` | Usuário do MySQL | `uzze_user` |
| `DB_PASSWORD` | Senha do MySQL | `uzze_password` |
| `DB_ROOT_PASSWORD` | Senha root do MySQL | `rootpassword` |
| `JWT_SECRET` | Segredo do access token | — |
| `JWT_EXPIRATION` | TTL do access token (segundos) | `3600` |
| `JWT_REFRESH_SECRET` | Segredo do refresh token | — |
| `JWT_REFRESH_EXPIRATION` | TTL do refresh token (segundos) | `604800` |
| `PORT` | Porta do servidor | `3000` |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Desenvolvimento com watch |
| `npm run build` | Build de produção |
| `npm run start:prod` | Rodar build de produção |
| `npm run migration:run` | Executar migrations pendentes |
| `npm run migration:generate -- src/database/migrations/nome` | Gerar migration a partir de mudanças na entity |
| `npm run migration:revert` | Reverter última migration |
| `npm run seed` | Popular banco com admin de teste |
| `npm run test` | Rodar testes unitários |
| `npm run lint` | Verificar lint |

## Estrutura de Pastas

```
src/
├── auth/                    # Autenticação
│   ├── dto/                 #   DTOs (login, refresh)
│   ├── decorators/          #   @Roles
│   ├── guards/              #   JwtAuthGuard, RolesGuard
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
├── common/                  # Compartilhado
│   ├── filters/             #   HttpExceptionFilter
│   └── interceptors/        #   TransformInterceptor
├── database/                # Dados do banco
│   ├── migrations/
│   ├── seeds/
│   ├── database.config.ts
│   └── app.module.ts
├── app.module.ts
└── main.ts
```

## Arquitetura

Padrão **Controller → Service → Repository** com Dependency Injection.

- **Controllers** — definem rotas, validam entrada via DTOs
- **Services** — lógica de negócio, interage com repositories
- **Repositories** — acesso a dados via TypeORM

### Interceptors e Filters globais

- `TransformInterceptor` — envolve respostas em `{ data: ... }`
- `HttpExceptionFilter` — formato consistente de erros: `{ statusCode, message, timestamp }`

### Validação

`ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true` — propriedades não mapeadas nos DTOs são rejeitadas.

## Endpoints

### Autenticação

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/api/auth/login` | Login (CPF + senha) | Não |
| `POST` | `/api/auth/refresh` | Renovar access token | Refresh Token |
| `POST` | `/api/auth/logout` | Invalidar refresh token | Access Token |
| `GET` | `/api/auth/me` | Dados do usuário logado | Access Token |

### Usuários

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/api/usuarios` | Criar usuário | Admin |
| `GET` | `/api/usuarios` | Listar usuários (paginado) | Admin |
| `GET` | `/api/usuarios/:id` | Buscar por ID | Access Token |
| `PATCH` | `/api/usuarios/:id` | Atualizar usuário | Access Token |
| `DELETE` | `/api/usuarios/:id` | Soft delete (status → inativo) | Admin |

## Autenticação

- **Access Token** — TTL de 1h (`JWT_EXPIRATION`), enviado no header `Authorization: Bearer <token>`
- **Refresh Token** — TTL de 7d (`JWT_REFRESH_EXPIRATION`), salvo no banco
- **Refresh automático** — o frontend renova o access token via `POST /api/auth/refresh` quando recebe 401
- **Roles** — `admin` e `vendedor` via enum `UsuarioTipo`, controlado por `@Roles()` + `RolesGuard`

## Regras de Negócio

- Senhas armazenadas com **bcrypt** (hash, nunca texto plano)
- CPF validado e único no banco
- `ultimo_acesso` atualizado a cada login
- Soft delete em usuários (`status` → `inativo`)

## Credenciais de Teste

| Campo | Valor |
|-------|-------|
| CPF | `000.000.000-00` |
| Senha | `admin123` |
| Perfil | admin |
