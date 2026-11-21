# PolicyForges

**React route access policies + protected JavaScript modules.**

[Português](README.pt-BR.md) · [Security roadmap](ROADMAP.md) · [Publishing](PUBLISHING.md)

## Quick start (existing React + TypeScript app)

**1. Install:**

```bash
npm install @policyforges/react react-router-dom
npm install -D @policyforges/cli
```

**2. Generate the working starter:**

```bash
npx policyforges init
```

`init` creates these files **without overwriting existing code**:

```text
security.auth
src/routes-rbac/AppRoutes.tsx
src/routes-rbac/authTypes.ts
src/modules/Login.tsx
src/modules/Dashboard.tsx
src/modules/Admin.tsx
```

Edit `security.auth` to add/remove profiles and routes, and replace the example screens in `src/modules/`. The module filename comes from the URL: `/reports` → `Reports.tsx`, `/account/settings` → `AccountSettings.tsx`. Running `init` again adds missing modules; running `compile` **refreshes generated routes** after editing the DSL.

**3. Use the generated router** in `src/App.tsx`:

```tsx
import { AppRoutes } from './routes-rbac/AppRoutes';
export default function App() {
  return <AppRoutes />;
}
```

Do not add a second `BrowserRouter` or `AuthProvider` around `AppRoutes`.

**4. Validate, build and install the secured chunk server:**

```bash
npx policyforges validate
npx policyforges compile # required if you edited security.auth after init
npx policyforges build
npx policyforges install
```

**5. Start the API** (terminal 1) and your React app (terminal 2):

```bash
# Terminal 1 — use the SAME secret as the service issuing the JWTs
JWT_SECRET='your-long-random-development-secret' CORS_ORIGIN='http://localhost:3000' npx policyforges start

# Terminal 2 (Create React App)
npm start
```

The generated `/login` page accepts a JWT from **your own authentication backend**. PolicyForges does not issue tokens or provide a user database. For local-only tests, after `policyforges install`, create an example JWT using the generated server dependency:

```bash
cd server
JWT_SECRET='your-long-random-development-secret' node -e "console.log(require('jsonwebtoken').sign({roles:['USER']}, process.env.JWT_SECRET, {algorithm:'HS256', expiresIn:'15m'}))"
cd ..
```

Paste that token on `/login`, then open `/dashboard`. `/admin` requires the `ADMIN` role inside the **signed** JWT.

For Create React App, optionally configure `REACT_APP_SECURE_CHUNK_URL=http://localhost:4000/api/secure-chunks` in `.env` (this is the default). Set `CORS_ORIGIN` to your actual frontend origin and restart the dev server after changing `.env`.

## `security.auth` example

```text
profile ADMIN;
profile USER;

route "/login" PUBLIC;
route "/dashboard" PROTECTED BY [USER, ADMIN] CHUNK "user-dashboard";
route "/admin" PROTECTED BY [ADMIN] CHUNK "admin-panel";
```

## CLI commands

| Command | Purpose |
|---|---|
| `policyforges init` | Generate DSL, routes, and missing example screens (preserves existing files) |
| `policyforges validate` | Check DSL syntax and rules |
| `policyforges compile` | Regenerate `src/routes-rbac/` based on DSL |
| `policyforges build` | Bundle protected modules and generate `server/` |
| `policyforges install` | Install generated server dependencies |
| `policyforges start` | Start the chunk delivery server |

## Authentication and security

- `useAuth().login(token, roles)` stores the token **in a session cookie**, not `localStorage`. Logout clears it; roles are only UI state.
- The runtime reads that cookie in JavaScript and sends the token as `Authorization: Bearer ...` to the chunk API. Cookies use `SameSite=Strict`, `Path=/`, and `Secure` on HTTPS. **These cookies are not HttpOnly:** JavaScript-managed cookies remain exposed to XSS.
- For stronger protection, your authentication backend must set an **HttpOnly, Secure** cookie and validate it server-side; that architecture requires a different session/transport integration.
- The generated server verifies HS256 JWT signatures and roles. It does **not** secure your business APIs, implement login, manage credentials, or make delivered JavaScript impossible to inspect.
- Protected example modules must remain standalone; avoid bare imports in these chunks unless your bundling strategy supports them. Never include secrets in browser code.

See the [14-principle security roadmap](ROADMAP.md) for work not yet implemented.
