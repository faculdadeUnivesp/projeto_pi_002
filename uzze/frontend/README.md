# UZZE — Frontend Web

Frontend do sistema de gestão de estoque, fornecedores, vendas e relatórios da loja de roupas UZZE.

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

- [Node.js](https://nodejs.org/) `^20.19` ou `>=22.12`
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
│       ├── ErrorBoundary.tsx      # Captura erros de renderização
│       ├── Icons/                 # Ícones SVG
│       └── Layout/                # Layout com Sidebar + Header
│           ├── Sidebar/
│           └── Header/
├── context/
│   └── AuthContext.tsx            # Estado de autenticação global
├── hooks/
│   └── useAuth.ts                 # Hook de acesso ao AuthContext
├── pages/
│   ├── Login/                     # Tela de login
│   ├── Dashboard/                 # Indicadores e estoque baixo
│   ├── Vendas/                    # Registro e listagem de vendas
│   ├── Relatorios/                # Relatórios de vendas e estoque
│   ├── Estoque/                   # Listagem de produtos
│   ├── CadastroEstoque/           # Cadastro/edição de produto
│   ├── Fornecedores/              # Listagem de fornecedores
│   ├── CadastroFornecedores/      # Cadastro/edição de fornecedor
│   ├── Usuarios/                  # Listagem de usuários (admin)
│   ├── CadastroUsuario/           # Cadastro/edição de usuário (admin)
│   ├── Configuracoes/             # Perfil e troca de senha
│   └── NotFound/                  # 404
├── routes/
│   ├── index.tsx                  # Definição de rotas
│   ├── PrivateRoute.tsx           # Guard de rotas autenticadas
│   └── RoleRoute.tsx              # Guard de rotas por perfil
├── services/
│   ├── api.ts                     # Instância Axios + interceptors
│   └── auth.service.ts            # Chamadas de auth
├── styles/
│   └── global.css                 # Estilos globais
├── types/
│   └── auth.ts                    # Interfaces (Usuario, Tokens)
├── utils/
│   ├── assets.ts
│   └── formatters.ts              # CPF, moeda e datas
├── App.tsx
└── main.tsx
```

## Rotas

| Rota | Componente | Acesso |
|------|------------|--------|
| `/login` | Login | Público |
| `/` | Dashboard | Autenticado |
| `/vendas` | Vendas | Autenticado |
| `/relatorios` | Relatorios | Autenticado |
| `/fornecedores` | Fornecedores | Autenticado |
| `/fornecedores/cadastrar` | CadastroFornecedores | Autenticado |
| `/fornecedores/:id/editar` | CadastroFornecedores | Autenticado |
| `/estoque` | Estoque | Autenticado |
| `/estoque/cadastrar` | CadastroEstoque | Autenticado |
| `/estoque/:id/editar` | CadastroEstoque | Autenticado |
| `/usuarios` | Usuarios | Admin |
| `/usuarios/cadastrar` | CadastroUsuario | Admin |
| `/usuarios/:id/editar` | CadastroUsuario | Admin |
| `/configuracoes` | Configuracoes | Autenticado |
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
- **Axios interceptor** — envia o access token, intercepta 401, tenta refresh automático (uma única requisição simultânea) e redireciona para `/login` se falhar
- **403** — limpa os tokens e redireciona para `/`
- **PrivateRoute** — redireciona para `/login` se não autenticado
- **RoleRoute** — restringe rotas por perfil, como `/usuarios` para admin

## Funcionalidades

- Login com formatação automática de CPF (`XXX.XXX.XXX-XX`) e botão de mostrar/ocultar senha
- Dashboard com indicadores de vendas e produtos com estoque baixo
- Vendas: registro, listagem, detalhes e cancelamento; admin vê todas, vendedor vê as próprias
- Estoque: listagem com busca e filtros, cadastro/edição com upload de imagem, exclusão
- Fornecedores: listagem com busca e filtro de status, cadastro/edição, exclusão e reativação
- Relatórios: vendas por período e produtos com estoque baixo
- Usuários (admin): listagem, cadastro, edição e exclusão
- Configurações: atualização de perfil e troca de senha
- Layout responsivo com sidebar e header, exibição do usuário logado e logout
- ErrorBoundary para falhas de renderização

## Observações

- O **backend precisa estar rodando** antes de usar o frontend
- O frontend roda na porta **5173** (Vite default)
- CORS configurado no backend para `localhost:5173` e `localhost:3001`
- Imagens de produtos são servidas pelo backend em `/uploads`

## Credenciais de Teste

| Campo | Valor |
|-------|-------|
| CPF | `000.000.000-00` |
| Senha | Gerada e exibida uma vez por `npm run seed` no backend |
| Perfil | admin |

Se o administrador já existir, o seed não altera a senha.
