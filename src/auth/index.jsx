import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as API from "../api";

const Ctx = createContext(undefined);

export function AuthProvider({ children }) {
  const [token, setTok] = useState(API.getToken());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "jwt") {
        setTok(API.getToken());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthed: !!token,
      async settoken(token) {
        setTok(token);
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

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
