import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

interface DynamicProtectedRouteProps {
  chunkName: string;
}

export const DynamicProtectedRoute: React.FC<DynamicProtectedRouteProps> = ({
  chunkName,
}) => {
  const { token } = useAuth();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let disposed = false;
    let blobUrl: string | null = null;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setComponent(null);

    if (!token) {
      setLoading(false);
      return () => controller.abort();
    }

    async function fetchAndLoadChunk() {
      try {
        const apiSecureChunk =
          process.env.REACT_APP_SECURE_CHUNK_URL ||
          process.env.API_SECURE_CHUNK ||
          "http://localhost:4000/api/secure-chunks";

        const response = await fetch(`${apiSecureChunk}/${chunkName}.js`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 403) {
          throw new Error("Acesso negado: perfil sem permissão para este módulo.");
        }
        if (!response.ok) {
          throw new Error(`Falha ao carregar o módulo (${response.status}).`);
        }

        const jsCode = await response.text();
        if (disposed) return;
        const blob = new Blob([jsCode], { type: "application/javascript" });
        blobUrl = URL.createObjectURL(blob);
        const module = await import(/* webpackIgnore: true */ blobUrl);
        if (!module.default) {
          throw new Error("Módulo inválido: export default não encontrado.");
        }
        if (!disposed) setComponent(() => module.default);
      } catch (err: unknown) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : "Erro ao carregar componente.");
        }
      } finally {
        if (!disposed) setLoading(false);
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      }
    }

    void fetchAndLoadChunk();
    return () => {
      disposed = true;
      controller.abort();
    };
  }, [chunkName, token]);

  if (!token) return <div className="auth-error">Faça login para acessar esta rota.</div>;
  if (loading) return <div className="auth-loading">Carregando módulo seguro...</div>;
  if (error) return <div className="auth-error">❌ {error}</div>;
  if (!Component) return null;
  return <Component />;
};
