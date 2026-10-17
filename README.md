# UZZE — Gestão Web de Estoque com Controle de Grade para Vestuário em Nuvem

Sistema de gestão de estoque/vendas para loja de roupas e acessórios UZZE.

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) + Docker Compose
- npm

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
# Backend
cp uzze/backend/.env.example uzze/backend/.env
```

### 4. Instalar dependências e rodar backend

```bash
cd uzze/backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```

O backend estará disponível em `http://localhost:3000`.

### 5. Instalar dependências e rodar frontend

```bash
cd uzze/frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## Credenciais de Teste

| Campo | Valor |
|-------|-------|
| CPF | `000.000.000-00` |
| Senha | `admin123` |
| Perfil | admin |

## Scripts Úteis (Backend)

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Rodar em modo desenvolvimento (watch) |
| `npm run build` | Gerar build de produção |
| `npm run migration:run` | Executar migrations |
| `npm run migration:generate -- src/database/migrations/nome` | Gerar migration a partir de mudanças na entity |
| `npm run seed` | Popular banco com dados de teste |
| `npm run test` | Rodar testes |
| `npm run lint` | Verificar lint |

## Acessos

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| MySQL | localhost:3307 |

## Estrutura do Projeto

```
uzze/
├── backend/              # NestJS + TypeORM
│   ├── src/
│   │   ├── auth/         # Autenticação (JWT + Refresh Token)
│   │   ├── usuarios/     # CRUD de usuários
│   │   ├── common/       # Filtros, interceptors, pipes
│   │   └── database/     # Migrations e seeds
│   └── test/
├── frontend/             # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Componentes compartilhados
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Páginas
│   │   ├── routes/       # Rotas + PrivateRoute
│   │   └── services/     # Chamadas à API
│   └── public/
└── docker-compose.yml    # MySQL 8
```

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + TypeScript + Vite |
| Backend | NestJS + TypeORM |
| Banco | MySQL 8 (Docker) |
| Autenticação | JWT + Refresh Token |
| Testes | Vitest |
