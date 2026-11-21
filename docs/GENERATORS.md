# Editing generated source templates

All generated code is maintained as **real files**, not embedded multiline
TypeScript strings. Edit these sources with your IDE:

```text
packages/cli/templates/
├── security.auth
├── react/
│   ├── routes-rbac/
│   │   ├── AppRoutes.tsx
│   │   └── authTypes.ts
│   └── modules/
│       ├── Login.tsx
│       ├── Public.tsx
│       ├── Protected.tsx
│       └── ExampleScreen.tsx
├── build/
│   ├── react-global.mjs
│   ├── react-jsx-runtime.mjs
│   └── react-jsx-dev-runtime.mjs
└── server/
    ├── index.js
    └── package.json
```

- `init`: reads `security.auth`, the React templates and the relevant module
  examples. Creates **only missing files**, leaving user edits untouched.
- `compile`: reads the same React templates, regenerates routes/types from DSL.
- `build`: bundles the protected `.tsx` modules, copies the JavaScript server
  and manifest from templates, and writes policy-specific
  `server/chunk-permissions.json`.
- `ServerGenerator` no longer builds executable JavaScript with strings. Its
  only dynamic output is `server/chunk-permissions.json`, derived exclusively
  from the validated DSL (not a modifiable default-permissions template).
- `CodeGenerator` takes valid React `.tsx` example lines marked
  `@policyforges:*`, replacing them with imports/routes for each DSL route.
- `templates/build/react-global.mjs` is editable ESM source read by the esbuild
  virtual-module plugin. The two `react-jsx-*-runtime.mjs` adapters ensure
  the automatic JSX transform uses **the host's React instance**, avoiding
  a bundled, potentially incompatible `react/jsx-runtime` (React 18/19).
- All CLI templates are shipped in the npm package (`package.json` `files`).

Template markers (such as `@policyforges:public-route`) are intentionally
recognized **once each**; keep them when editing the example line. A missing
marker fails compilation clearly rather than generating malformed output.

After editing a template, run `npm run build:cli && node --test tests/*.test.cjs`.
For publication run `npm run pack:check` after installing dependencies.

Generated output goes into a consumer's `src/` or `server/`; edit the templates
above to change future generation, **not** the generated `server/index.js`.
Secure chunks are browser code; do not embed secrets there.
