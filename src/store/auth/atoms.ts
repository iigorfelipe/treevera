import { atom } from "jotai";
import type { Session } from "@supabase/supabase-js";
import type { DbUser } from "@/common/types/user";

export type AuthStatus = "idle" | "loading" | "success" | "error";
export type AuthError = { code?: string; message: string } | null;

const sessionAtom = atom<Session | null>(null);

const userDbAtom = atom<DbUser | null>(null);

const loginStatusAtom = atom<AuthStatus>("idle");
const logoutStatusAtom = atom<AuthStatus>("idle");

const authInitializedAtom = atom<boolean>(false);

const authErrorAtom = atom<AuthError>(null);

const isAuthenticatedAtom = atom((get) => {
  const session = get(sessionAtom);
  const userDb = get(userDbAtom);
  const initialized = get(authInitializedAtom);
  return initialized && !!session?.user && !!userDb;
});

const isLoadingAnyAuthAtom = atom((get) => {
  return (
    get(loginStatusAtom) === "loading" || get(logoutStatusAtom) === "loading"
  );
});

const lastAuthCheckAtom = atom<number | null>(null);

const offlineModeAtom = atom<boolean>(false);

export const authStore = {
  session: sessionAtom,
  userDb: userDbAtom,
  loginStatus: loginStatusAtom,
  logoutStatus: logoutStatusAtom,
  error: authErrorAtom,
  initialized: authInitializedAtom,
  isAuthenticated: isAuthenticatedAtom,
  isLoadingAny: isLoadingAnyAuthAtom,
  lastAuthCheck: lastAuthCheckAtom,
  offlineMode: offlineModeAtom,
};
