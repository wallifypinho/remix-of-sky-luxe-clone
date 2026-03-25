import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Operador {
  id: string;
  nome: string;
  email: string;
  perfil: "admin" | "operador";
  status: string;
}

const STORAGE_KEY = "operador_session";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getStoredSession(): { operador: Operador; sessionToken: string; loginAt: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.loginAt || Date.now() - parsed.loginAt > SESSION_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function useOperadorAuth() {
  const [operador, setOperador] = useState<Operador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    if (session?.operador) {
      setOperador(session.operador);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (senha: string, slug?: string) => {
    const { data, error } = await supabase.functions.invoke("operador-auth", {
      body: { action: "login", senha, slug },
    });

    if (error) throw new Error("Erro de conexão");
    if (!data?.success) throw new Error(data?.error || "Login falhou");

    const session = { operador: data.operador, sessionToken: data.sessionToken, loginAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setOperador(data.operador);
    return data.operador;
  }, []);

  const logout = useCallback(async () => {
    const session = getStoredSession();
    if (session?.operador?.id) {
      await supabase.functions.invoke("operador-auth", {
        body: { action: "logout", operadorId: session.operador.id },
      }).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    setOperador(null);
  }, []);

  const isAdmin = operador?.perfil === "admin";

  return { operador, loading, login, logout, isAdmin };
}
