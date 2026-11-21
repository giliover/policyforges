import { RouteNode } from "../parser/ast.js";
import { routeModuleName } from "./routeModuleName.js";

/** Minimal editable starter screens; protected screens must not import runtime packages. */
export function scaffoldRouteModule(route: RouteNode, firstProtectedPath?: string): string {
  const component = routeModuleName(route.path);

  if (route.isPublic && route.path === "/login") {
    const destination = firstProtectedPath || "/";
    return `// Public example: replace this form with your application's authentication flow.
// The pasted JWT must come from a trusted backend; this example does not issue tokens.
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@policyforges/react';

export default function Login() {
  const [jwt, setJwt] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jwt.trim()) return;
    login(jwt.trim(), []); // Roles in UI are not trusted for backend authorization.
    navigate(${JSON.stringify(destination)});
  }

  return (
    <main>
      <h1>Login</h1>
      <p>Enter a JWT issued by your authentication backend.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="jwt">JWT</label>
        <textarea id="jwt" value={jwt} onChange={(e) => setJwt(e.target.value)} required />
        <button type="submit">Continue</button>
      </form>
    </main>
  );
}
`;
  }

  if (route.isPublic) {
    return `// Public route example. Replace this content with your screen.
export default function ${component}() {
  return (
    <main>
      <h1>${component}</h1>
      <p>This route is public.</p>
    </main>
  );
}
`;
  }

  // Protected chunks execute as browser-loaded modules. Keep this starter free
  // of bare module imports (such as React or @policyforges/react).
  return `// Protected route example: replace this content with your screen.
// No package imports: this module is delivered as a standalone secured chunk.
export default function ${component}() {
  return (
    <main>
      <h1>${component}</h1>
      <p>This module is protected by PolicyForges.</p>
    </main>
  );
}
`;
}
