# @policyforges/cli

Scaffolds routes and example screens, compiles `security.auth`, and generates an RBAC-protected chunk server.

```bash
npm install @policyforges/react react-router-dom
npm install -D @policyforges/cli
npx policyforges init
```

`init` creates `security.auth`, `src/routes-rbac/`, and matching `src/modules/` files. It **does not overwrite** existing code. Add `AppRoutes` in `src/App.tsx`:

```tsx
import { AppRoutes } from './routes-rbac/AppRoutes';
export default function App() { return <AppRoutes />; }
```

Then run:

```bash
npx policyforges validate
npx policyforges compile  # refresh routes if security.auth changed
npx policyforges build
npx policyforges install
JWT_SECRET='development-secret-change-me' CORS_ORIGIN='http://localhost:3000' npx policyforges start
```

The `/login` example expects a JWT from a trusted authentication backend. See the repository root README for a local test token and security notes.

### Maintaining generated code

The generator reads **real editable source templates** in `templates/` (included
in the published npm package). Server source is `templates/server/index.js`;
server permissions are written separately as `server/chunk-permissions.json`.
The full source layout is in the monorepo's `docs/GENERATORS.md`.
