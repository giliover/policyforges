# @policyforges/cli

Compila o arquivo `security.auth`, gera rotas React e um servidor Express para distribuir módulos protegidos por RBAC.

```bash
npm install -D @policyforges/cli
npx policyforges --help
npx policyforges init
npx policyforges validate
npx policyforges compile
npx policyforges build
```

O pacote deve ser publicado a partir de `packages/cli`, não da raiz do monorepo.
