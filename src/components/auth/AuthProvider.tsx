"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import type {
  AuthChangeEvent,
  AuthError,
  Session,
  User,
} from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isCloudMode: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isCloudMode: false,
  signOut: async () => {},
});

type SessionResult = {
  data: { session: Session | null };
  error: AuthError | null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isCloudMode = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isCloudMode);
  const router = useRouter();

  useEffect(() => {
    if (!isCloudMode) return;

    const supabase = createClient();

    supabase.auth
      .getSession()
      .then(({ data: { session }, error }: SessionResult) => {
        if (error) console.error("Failed to restore auth session:", error);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, nextSession: Session | null) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isCloudMode]);

  const signOut = useCallback(async () => {
    if (!isCloudMode) return;

    // Hide authenticated data immediately; the offline cache remains on disk
    // for the same private owner but is no longer rendered after navigation.
    setSession(null);
    setUser(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Supabase sign-out failed:", error);

    router.replace("/login");
    router.refresh();
  }, [isCloudMode, router]);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, isCloudMode, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
