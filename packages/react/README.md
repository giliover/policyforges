# @policyforges/react

Authentication context and secure module loader for React.

```bash
npm install @policyforges/react react-router-dom
npm install -D @policyforges/cli
npx policyforges init
```

Add the generated `AppRoutes` in your `src/App.tsx`. The generated `/login` page shows how to call `login`:

```tsx
import { useAuth } from '@policyforges/react';

export function SignInButton({ jwt }: { jwt: string }) {
  const { login } = useAuth();
  return <button onClick={() => login(jwt, [])}>Sign in</button>;
}
```

The token is kept in a JavaScript-readable **session cookie** (`SameSite=Strict`, `Secure` on HTTPS), not in `localStorage`. It is sent in a Bearer header when fetching secured chunks. **This cookie is not HttpOnly and does not protect against XSS.** To use HttpOnly cookies, configure a server-issued and server-verified session instead. Server authorization always uses signed JWT roles, not frontend roles.

See the repository README for the full setup and generated server instructions.
