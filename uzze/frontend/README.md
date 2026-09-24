# UZZE — Frontend Web

Frontend do sistema de gestão de estoque para loja de roupas UZZE.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | React 19 |
| Linguagem | TypeScript |
| Build tool | Vite 8 |
| Roteamento | React Router v7 |
| HTTP Client | Axios |
| Lint | oxlint |

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- Backend UZZE rodando em `http://localhost:3000`

## Setup

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## Variável de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `VITE_API_URL` | URL base da API backend | `http://localhost:3000/api` |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento com HMR |
| `npm run build` | Build de produção (tsc + vite) |
| `npm run preview` | Pré-visualizar build |
| `npm run lint` | Verificar lint |

## Estrutura de Pastas

```
src/
├── components/
│   └── common/
│       └── Layout/           # Layout com Sidebar + Header
│           ├── Sidebar/
│           ├── Header/
│           └── Layout.css
├── context/
│   └── AuthContext.tsx       # Estado de autenticação global
├── hooks/
├── pages/
│   ├── Login/                # Tela de login
│   ├── Dashboard/            # Tela inicial (privada)
│   └── NotFound/             # 404
├── routes/
│   ├── index.tsx             # Definição de rotas
│   └── PrivateRoute.tsx      # Guard de rotas autenticadas
├── services/
│   ├── api.ts                # Instância Axios + interceptor
│   └── auth.service.ts       # Chamadas de auth
├── types/
│   └── auth.ts               # Interfaces (Usuario, Tokens)
├── App.tsx
├── main.tsx
└── index.css
```

## Rotas

| Rota | Componente | Acesso |
|------|------------|--------|
| `/login` | Login | Público |
| `/` | Dashboard (via Layout) | Privado (autenticado) |
| `*` | NotFound | Público |

## Fluxo de Autenticação

```
┌──────────┐     POST /auth/login      ┌──────────┐
│  Login   │ ──────────────────────────▶│  Backend │
│  (CPF)   │◀──────────────────────────│          │
└──────────┘   { accessToken,          └──────────┘
                 refreshToken,
                 usuario }

     │ Salva tokens no localStorage
     │ Salva usuario no AuthContext

┌──────────┐     GET /auth/me          ┌──────────┐
│  App     │ ──────────────────────────▶│  Backend │
│ (reload) │◀──────────────────────────│          │
└──────────┘   { usuario }             └──────────┘

     │ Se 401:
     │ POST /auth/refresh com refreshToken
     │ Renova accessToken
     │ Reexecuta requisição original
```

### Detalhes

- **AuthContext** — gerencia `user`, `isAuthenticated`, `loading`; expõe `login()` e `logout()`
- **Axios interceptor** — intercepta respostas 401, tenta refresh automático, redireciona para `/login` se falhar
- **PrivateRoute** — wrapper que redireciona para `/login` se não autenticado

## Funcionalidades

- Tela de login com formatação automática de CPF (`XXX.XXX.XXX-XX`)
- Botão de mostrar/ocultar senha
- Layout responsivo com sidebar e header
- Exibição do nome e perfil do usuário logado
- Logout com limpeza de tokens

## Observações

- O **backend precisa estar rodando** antes de usar o frontend
- O frontend roda na porta **5173** (Vite default)
- CORS configurado no backend para `localhost:5173`

## Credenciais de Teste

| Campo | Valor |
|-------|-------|
| CPF | `000.000.000-00` |
| Senha | `admin123` |
| Perfil | admin |
