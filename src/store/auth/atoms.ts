import { atom } from "jotai";
import type { Session } from "@supabase/supabase-js";
import type { DbUser } from "@/common/types/user";

export type AuthStatus = "idle" | "loading" | "success" | "error";
export type AuthError = { code?: string; message: string } | null;

export const sessionAtom = atom<Session | null>(null);
export const userDbAtom = atom<DbUser | null>(null);

export const loginStatusAtom = atom<AuthStatus>("idle");
export const logoutStatusAtom = atom<AuthStatus>("idle");

export const authInitializedAtom = atom<boolean>(false);
export const authErrorAtom = atom<AuthError>(null);

export const isAuthenticatedAtom = atom((get) => {
  const session = get(sessionAtom);
  const userDb = get(userDbAtom);
  const initialized = get(authInitializedAtom);
  return initialized && !!session?.user && !!userDb;
});

export const isLoadingAnyAuthAtom = atom((get) => {
  return (
    get(loginStatusAtom) === "loading" || get(logoutStatusAtom) === "loading"
  );
});

export const lastAuthCheckAtom = atom<number | null>(null);
export const offlineModeAtom = atom<boolean>(false);
