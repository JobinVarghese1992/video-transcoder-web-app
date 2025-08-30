// src/auth/index.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as API from '@/api';

export type AuthCtx = {
  token: string | null;
  isAuthed: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(API.getToken());

  // Keep auth state in sync across tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'jwt') {
        setTok(API.getToken());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      token,
      isAuthed: !!token,
      async login(username, password) {
        const r = await API.login(username, password);
        setTok(r.token);
      },
      logout() {
        API.logout();
        setTok(null);
      },
    }),
    [token]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
