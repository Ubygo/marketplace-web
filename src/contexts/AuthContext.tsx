"use client";

import {
  getCurrentUser,
  loginUser,
  loginWithAccessToken,
  logoutUser,
  registerUser,
} from "@/lib/auth";
import { disconnectSocket } from "@/lib/chat-socket";
import { getStoredSession, storeSession } from "@/lib/auth-session";
import type {
  LoginCredentials,
  RegisterCredentials,
  Session,
  User,
} from "@/types/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<Session>;
  register: (credentials: RegisterCredentials) => Promise<Session>;
  loginWithToken: (accessToken: string) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  tenantId: string;
  slug: string;
  children: ReactNode;
}

export function AuthProvider({ tenantId, slug, children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const stored = getStoredSession(slug);

      if (!stored?.accessToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser(slug, tenantId);
        if (!isMounted) {
          return;
        }

        const session = { ...stored, user: currentUser };
        storeSession(slug, session);
        setUser(currentUser);
      } catch {
        logoutUser(slug);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [tenantId, slug]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const session = await loginUser(slug, tenantId, credentials);
      setUser(session.user);
      return session;
    },
    [slug, tenantId],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const session = await registerUser(slug, tenantId, credentials);
      setUser(session.user);
      return session;
    },
    [slug, tenantId],
  );

  const loginWithToken = useCallback(
    async (accessToken: string) => {
      const session = await loginWithAccessToken(slug, tenantId, accessToken);
      setUser(session.user);
      return session;
    },
    [slug, tenantId],
  );

  const logout = useCallback(() => {
    disconnectSocket();
    logoutUser(slug);
    setUser(null);
  }, [slug]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      loginWithToken,
      logout,
    }),
    [user, isLoading, login, register, loginWithToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
