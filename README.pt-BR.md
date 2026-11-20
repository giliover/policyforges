# PolicyForges

**Compilador declarativo de políticas RBAC e distribuição autorizada de módulos JavaScript para React.**

[English (principal)](README.md) · [Roadmap em português](ROADMAP.pt-BR.md) · [Roadmap em inglês](ROADMAP.md) · [Cartões para Trello](docs/TRELLO-CHECKLIST.md)

> **Limite de segurança:** quem recebe um JavaScript autorizado pode inspecioná-lo e copiá-lo. Proteger a entrega dos chunks **não substitui** a autorização nas APIs de negócio. O PolicyForges não é um provedor completo de identidade.

## O que faz

O PolicyForges lê `security.auth`, valida regras de perfis e rotas, gera integração de rotas React, compila módulos protegidos e cria um endpoint Express que verifica JWT e RBAC antes de entregar chunks.

```text
security.auth → Lexer → Parser → Semantic Analyzer
                               ├→ Geração de rotas React
                               └→ esbuild chunks → Entrega RBAC no Express
```

## Pacotes

| Pacote | Função |
|---|---|
| `@policyforges/cli` | Compilador DSL, pipeline de build e gerador Express |
| `@policyforges/react` | Contexto React de autenticação e carregador de módulos protegidos |

O monorepo principal é privado; os dois pacotes são publicados separadamente. Veja [PUBLISHING.md](PUBLISHING.md).

## Requisitos

Node.js 20+, aplicação React e um emissor confiável de JWT compatível com o servidor gerado. O servidor atual espera tokens HS256 com array `roles`. Perfis informados pelo frontend não podem autorizar ações no backend.

## Instalação

```bash
npm install @policyforges/react
npm install -D @policyforges/cli
```

## Início rápido

Crie `security.auth`:

```text
profile ADMIN;
profile USER;

route "/login" PUBLIC;
route "/dashboard" PROTECTED BY [USER, ADMIN] CHUNK "user-dashboard";
route "/admin" PROTECTED BY [ADMIN] CHUNK "admin-panel";
```

Os módulos protegidos são buscados em `src/modules/<NomeDaRota>.tsx` (ex.: `/admin` → `src/modules/Admin.tsx`). Garanta que existam antes do build. Rotas públicas seguem convenções do gerador; revise os arquivos gerados ao integrar.

```bash
npx policyforges init         # somente se security.auth ainda não existir
npx policyforges validate
npx policyforges compile
npx policyforges build
npx policyforges install
```

Para iniciar o servidor gerado em desenvolvimento:

```bash
JWT_SECRET='substitua-por-um-segredo-aleatorio-forte' \
CORS_ORIGIN='http://localhost:3000' \
npx policyforges start
```

A aplicação precisa obter JWTs de um serviço confiável. O servidor gerado valida tokens, mas não implementa login ou cadastro.

## Referência da CLI

| Comando | Função |
|---|---|
| `policyforges init` | Cria um modelo `security.auth` |
| `policyforges validate` | Valida políticas sem gerar arquivos |
| `policyforges compile` | Gera integração de rotas React |
| `policyforges build` | Compila chunks e gera servidor Express |
| `policyforges install` | Instala dependências do servidor gerado |
| `policyforges start` | Inicia o servidor gerado |

Aliases: `check` → `validate`; `secure-build` → `build`.

## Segurança atual e limitações

- O endpoint gerado verifica JWT com HS256 e compara os perfis do token com a política declarada.
- `JWT_SECRET` e `CORS_ORIGIN` são obrigatórios na inicialização.
- A autorização protege a **entrega dos chunks**, não automaticamente as APIs de negócio.
- O runtime React atual guarda token e perfis em `localStorage`, sujeito a riscos de XSS; não confie nos perfis do cliente.
- Verificação de issuer/audience, política de cache, auditoria estruturada, sessões reforçadas e testes de segurança estão no roadmap, **não são garantias implementadas**.
- Nunca inclua segredos no JavaScript do cliente.

## Desenvolvimento

```bash
npm install
npm run build
npm pack --workspace=@policyforges/react --dry-run
npm pack --workspace=@policyforges/cli --dry-run
```

## Roadmap

Veja [ROADMAP.pt-BR.md](ROADMAP.pt-BR.md) para os 14 princípios, critérios de aceite, prioridades e métricas. Os [cartões para Trello](docs/TRELLO-CHECKLIST.md) facilitam o planejamento.

## Licença

MIT. Veja [LICENSE](LICENSE).
