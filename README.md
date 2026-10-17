# UZZE — Gestão Web de Estoque com Controle de Grade para Vestuário em Nuvem

Sistema de gestão de estoque, fornecedores, vendas e relatórios para a loja de roupas e acessórios UZZE.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22.22+ (ou 24.15+)
- [Docker](https://www.docker.com/) + Docker Compose
- npm

> O frontend exige Node `^20.19` ou `>=22.12`; o CLI do backend exige `^22.22.3`, `^24.15` ou `>=26`.

## Setup Local

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd projeto_pi_002
```

### 2. Iniciar banco de dados

```bash
cd uzze
docker-compose up -d
```

O MySQL 8 ficará disponível na porta **3307**.

### 3. Configurar variáveis de ambiente

```bash
# A partir da pasta uzze/
cp backend/.env.example backend/.env
```

Edite `backend/.env` e defina `JWT_SECRET` e `JWT_REFRESH_SECRET`. Os dois são obrigatórios em desenvolvimento e produção.

### 4. Instalar dependências e rodar backend

```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```

O backend estará disponível em `http://localhost:3000`. A API fica em `http://localhost:3000/api` e os arquivos enviados em `http://localhost:3000/uploads`.

> O `npm run seed` cria o usuário administrador com CPF `000.000.000-00` e uma senha aleatória, exibida uma única vez no terminal.

### 5. Instalar dependências e rodar frontend

```bash
cd ../frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## Credenciais de Teste

| Campo | Valor |
|-------|-------|
| CPF | `000.000.000-00` |
| Senha | Gerada e exibida uma vez por `npm run seed` |
| Perfil | admin |

Se o administrador já existir, o seed não altera a senha.

## Scripts Úteis (Backend)

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Rodar em modo desenvolvimento (watch) |
| `npm run build` | Gerar build de produção |
| `npm run start:prod` | Rodar build de produção |
| `npm run migration:run` | Executar migrations |
| `npm run migration:generate -- src/database/migrations/nome` | Gerar migration a partir de mudanças na entity |
| `npm run migration:revert` | Reverter última migration |
| `npm run seed` | Popular banco com admin de teste |
| `npm run test` | Rodar testes unitários |
| `npm run test:e2e` | Rodar testes end-to-end |
| `npm run lint` | Verificar lint |
| `npm run format` | Formatar código com Prettier |

## Acessos

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |
| Uploads | http://localhost:3000/uploads |
| MySQL | localhost:3307 |

## Estrutura do Projeto

```
uzze/
├── backend/                  # NestJS + TypeORM
│   ├── src/
│   │   ├── auth/             # Login, refresh, perfil e troca de senha
│   │   ├── usuarios/         # CRUD de usuários
│   │   ├── fornecedores/     # CRUD de fornecedores
│   │   ├── produto/          # CRUD de produtos e upload de imagens
│   │   ├── vendas/           # Vendas, dashboard e relatórios
│   │   ├── endereco/         # Entity de endereço
│   │   ├── common/           # Filtros, interceptors, paginação
│   │   └── database/         # Configuração, migrations e seeds
│   ├── test/                 # Testes e2e
│   └── uploads/              # Imagens enviadas (gerado em runtime)
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/       # Layout, ícones e ErrorBoundary
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # useAuth
│   │   ├── pages/            # Dashboard, vendas, estoque, fornecedores, etc.
│   │   ├── routes/           # Rotas, PrivateRoute e RoleRoute
│   │   ├── services/         # Axios e serviços de autenticação
│   │   ├── styles/           # CSS global
│   │   ├── types/            # Tipos compartilhados
│   │   └── utils/            # Formatadores e assets
│   └── public/
└── docker-compose.yml        # MySQL 8
```

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Backend | NestJS 12 + TypeORM |
| Banco | MySQL 8 (Docker) |
| Autenticação | JWT + Refresh Token |
| Validação | class-validator + class-transformer |
| Uploads | Multer (JPEG, PNG e WEBP) |
| Testes | Vitest |
| Lint | oxlint + Prettier |
