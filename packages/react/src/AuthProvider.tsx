import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { authCookies } from "./authCookies";

export interface UserAuthContextType {
  token: string | null;
  userRoles: string[];
  isAuthenticated: boolean;
  login: (token: string, roles: string[]) => void;
  logout: () => void;
}

const AuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // The secure chunk bundles use window.React instead of importing React.
  if (typeof window !== "undefined") window.React = React;

  const [token, setToken] = useState<string | null>(() => authCookies.getToken());
  const [userRoles, setUserRoles] = useState<string[]>(() => authCookies.getRoles());

  const login = (newToken: string, roles: string[]) => {
    const normalized = newToken.trim();
    if (!normalized) throw new Error("Token não pode ser vazio.");
    authCookies.setSession(normalized, roles);
    setToken(normalized);
    setUserRoles(roles);
  };

  const logout = () => {
    authCookies.clearSession();
    setToken(null);
    setUserRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{ token, userRoles, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): UserAuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um <AuthProvider>.");
  }
  return context;
};
