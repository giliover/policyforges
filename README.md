# PolicyForges

**Declarative RBAC policy compiler and authorized JavaScript module delivery for React.**

[Português](README.pt-BR.md) · [Security roadmap](ROADMAP.md) · [Checklist em português](ROADMAP.pt-BR.md) · [Trello cards](docs/TRELLO-CHECKLIST.md)

> **Security boundary:** A user who is authorized to download JavaScript can inspect and copy it. Protecting chunk delivery does **not** replace authorization on business APIs. PolicyForges is not a complete identity provider.

## What it does

PolicyForges reads `security.auth`, validates route/profile rules, generates React route integration, bundles protected modules, and generates an Express endpoint that verifies JWTs and RBAC before returning protected chunks.

```text
security.auth → Lexer → Parser → Semantic Analyzer
                               ├→ React route generation
                               └→ esbuild chunks → Express RBAC delivery
```

## Packages

| Package | Purpose |
|---|---|
| `@policyforges/cli` | DSL compiler, build pipeline and generated Express server |
| `@policyforges/react` | React authentication context and protected module loader |

The root monorepo is private; publish the two packages independently. See [PUBLISHING.md](PUBLISHING.md).

## Requirements

Node.js 20+; a React application; a trusted JWT issuer compatible with the generated server configuration. The generated server expects HS256 tokens with a `roles` array. Do not use a frontend-controlled roles list for backend authorization.

## Install

```bash
npm install @policyforges/react
npm install --save-dev @policyforges/cli
```

## Quick start

Create `security.auth`:

```text
profile ADMIN;
profile USER;

route "/login" PUBLIC;
route "/dashboard" PROTECTED BY [USER, ADMIN] CHUNK "user-dashboard";
route "/admin" PROTECTED BY [ADMIN] CHUNK "admin-panel";
```

Protected source modules are resolved from `src/modules/<RouteName>.tsx` (for example `/admin` → `src/modules/Admin.tsx`). Ensure these files exist before building. Public routes use the generator's naming conventions; inspect generated routes and adjust your app integration as needed.

```bash
npx policyforges init          # only if security.auth does not exist
npx policyforges validate
npx policyforges compile
npx policyforges build
npx policyforges install
```

Start the generated server (example development environment):

```bash
JWT_SECRET='replace-with-a-strong-random-secret' \
CORS_ORIGIN='http://localhost:3000' \
npx policyforges start
```

The application must obtain valid tokens from a trusted authentication service. The generated Express server validates tokens; it does not implement user registration or login.

## CLI reference

| Command | Description |
|---|---|
| `policyforges init` | Scaffold a `security.auth` file |
| `policyforges validate` | Parse and validate policies without generating files |
| `policyforges compile` | Generate React route integration |
| `policyforges build` | Bundle protected modules and generate the Express server |
| `policyforges install` | Install generated server dependencies |
| `policyforges start` | Start the generated server |

Aliases: `check` → `validate`; `secure-build` → `build`.

## Current security model and limitations

- The generated chunk endpoint checks JWT signatures with HS256 and matches trusted token roles against declared permissions.
- `JWT_SECRET` and `CORS_ORIGIN` are required at server startup.
- Authorization is enforced for **chunk delivery**, not automatically for your business APIs.
- The current React runtime stores token and roles in `localStorage`, which increases exposure to XSS; do not treat client roles as trusted.
- JWT issuer/audience checks, protected-response cache policy, structured audit logging, stronger session handling and security tests are roadmap items, **not implemented guarantees**.
- Do not embed secrets in client JavaScript, protected or otherwise.

## Security roadmap

See [ROADMAP.md](ROADMAP.md) for the 14-principle checklist, current evidence, acceptance criteria, priorities and research measurements. For project boards, use [Trello checklist cards](docs/TRELLO-CHECKLIST.md).

## License

MIT. See [LICENSE](LICENSE).
