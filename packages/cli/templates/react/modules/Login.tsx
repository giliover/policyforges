// Public example: replace this form with your application's authentication flow.
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
    navigate("/dashboard"); // @policyforges:login-target
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
