# PolicyForges

**Políticas de acesso a rotas React e entrega de módulos JavaScript protegidos.**

[English (principal)](README.md) · [Roadmap de segurança](ROADMAP.pt-BR.md)

## Comece aqui (aplicação React + TypeScript existente)

**1. Instale:**

```bash
npm install @policyforges/react react-router-dom
npm install -D @policyforges/cli
```

**2. Gere o exemplo completo:**

```bash
npx policyforges init
```

O `init` cria os arquivos abaixo **sem sobrescrever seu código**:

```text
security.auth
src/routes-rbac/AppRoutes.tsx
src/routes-rbac/authTypes.ts
src/modules/Login.tsx
src/modules/Dashboard.tsx
src/modules/Admin.tsx
```

Personalize `security.auth` e substitua as telas em `src/modules/`. O nome do arquivo acompanha a rota: `/reports` → `Reports.tsx`, `/account/settings` → `AccountSettings.tsx`. Execute `init` novamente para criar telas que faltam; execute `compile` para **atualizar as rotas geradas** após editar a DSL.

**3. Use as rotas geradas**, em `src/App.tsx`:

```tsx
import { AppRoutes } from './routes-rbac/AppRoutes';
export default function App() {
  return <AppRoutes />;
}
```

Não adicione outro `BrowserRouter` ou `AuthProvider` ao redor de `AppRoutes`.

**4. Valide, compile e instale o servidor dos chunks:**

```bash
npx policyforges validate
npx policyforges compile # necessário se alterou security.auth depois do init
npx policyforges build
npx policyforges install
```

**5. Inicie o servidor** (terminal 1) **e a aplicação** (terminal 2):

```bash
# Terminal 1 — mesmo segredo usado pelo serviço que emite os JWTs
JWT_SECRET='segredo-aleatorio-longo-para-desenvolvimento' CORS_ORIGIN='http://localhost:3000' npx policyforges start

# Terminal 2 (Create React App)
npm start
```

A página `/login` aceita um JWT emitido pelo **seu backend de autenticação**. O PolicyForges não gera tokens nem oferece cadastro de usuários. Para testar localmente, depois de `policyforges install`, emita um JWT de demonstração utilizando a dependência do servidor:

```bash
cd server
JWT_SECRET='segredo-aleatorio-longo-para-desenvolvimento' node -e "console.log(require('jsonwebtoken').sign({roles:['USER']}, process.env.JWT_SECRET, {algorithm:'HS256', expiresIn:'15m'}))"
cd ..
```

Cole o token em `/login` e abra `/dashboard`. Para acessar `/admin`, o JWT **assinado** precisa conter `ADMIN` na lista `roles`.

Se usar Create React App, configure opcionalmente `REACT_APP_SECURE_CHUNK_URL=http://localhost:4000/api/secure-chunks` no `.env` (já é o padrão). Ajuste `CORS_ORIGIN` para a origem real do frontend e reinicie o dev server após editar `.env`.

## Exemplo de `security.auth`

```text
profile ADMIN;
profile USER;

route "/login" PUBLIC;
route "/dashboard" PROTECTED BY [USER, ADMIN] CHUNK "user-dashboard";
route "/admin" PROTECTED BY [ADMIN] CHUNK "admin-panel";
```

## Comandos

| Comando | O que faz |
|---|---|
| `policyforges init` | Gera DSL, rotas e telas ausentes, preservando arquivos existentes |
| `policyforges validate` | Verifica as regras da DSL |
| `policyforges compile` | Atualiza `src/routes-rbac/` a partir da DSL |
| `policyforges build` | Compila os módulos e gera `server/` |
| `policyforges install` | Instala dependências do servidor gerado |
| `policyforges start` | Inicia o servidor de entrega de chunks |

## Autenticação e segurança

- `useAuth().login(token, roles)` grava o token **em cookie de sessão**, não em `localStorage`. O logout remove o cookie. Os perfis informados ao frontend servem apenas para apresentação.
- O frontend lê o cookie via JavaScript e envia o JWT no cabeçalho `Authorization: Bearer ...`. O cookie usa `SameSite=Strict`, `Path=/` e `Secure` com HTTPS. **Não é HttpOnly:** cookies acessíveis por JS continuam vulneráveis a XSS.
- Para usar **HttpOnly + Secure** de verdade, o backend de autenticação precisa emitir e validar o cookie. Isso exige outra integração de sessão/transporte.
- O servidor gerado valida JWT HS256 e perfis assinados, mas **não** protege automaticamente APIs de negócio nem impede a inspeção do JavaScript entregue.
- Os módulos protegidos gerados são independentes: evite imports de pacotes não resolvidos pelo navegador. Nunca inclua segredos no código frontend.

Veja o [roadmap de 14 princípios](ROADMAP.pt-BR.md) para os itens de segurança ainda pendentes.

## Personalizando os templates dos geradores

Os arquivos-fonte editáveis (`.ts`, `.tsx`, `.js`, `.mjs`, `.json`, `.auth`)
ficam em `packages/cli/templates/`. O servidor fica em
`packages/cli/templates/server/index.js`, enquanto as permissões são
geradas separadamente em `server/chunk-permissions.json`.
Veja [guia de manutenção](docs/GENERATORS.md).
