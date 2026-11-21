# Publicação no NPM

Os pacotes publicáveis são `@policyforges/react` e `@policyforges/cli`. A raiz é um monorepo privado e não deve ser publicada.

## Preparação

1. Verifique se você controla o escopo `@policyforges` no NPM (ou altere os nomes de ambos os pacotes para seu escopo).
2. Execute `npm login` e `npm whoami`.
3. Na raiz, execute `npm install` e `npm run build`.
4. Confira o conteúdo com `npm pack --workspace=@policyforges/react --dry-run` e `npm pack --workspace=@policyforges/cli --dry-run`. Os arquivos `dist/index.js` e `dist/index.d.ts` devem estar presentes.
5. Publique primeiro o runtime: `npm run publish:react`.
6. Publique a CLI: `npm run publish:cli`.

Para atualizações, aumente a versão em ambos os package.json (o NPM não aceita republicar a mesma versão) e ajuste a versão do exemplo.

## Teste externo

```bash
mkdir /tmp/policyforges-smoke && cd /tmp/policyforges-smoke
npm init -y
npm install -D @policyforges/cli
npx policyforges --help
npx policyforges init
npx policyforges validate
```

Também é possível executar sem instalação local:

```bash
npm exec --yes --package=@policyforges/cli -- policyforges --help
```

`npx policyforges` sem instalação local procura o pacote não escopado `policyforges`; não é equivalente a `@policyforges/cli`.

## Observações

- `prepack` compila TypeScript antes de empacotar.
- `files` restringe o pacote publicado a `dist`, README e LICENSE.
- O servidor gerado precisa ser configurado separadamente; nunca publique segredos ou `.env`.
- A aplicação `examples/app-cli` é privada e consome versões do registro NPM após a publicação.
