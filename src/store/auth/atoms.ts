import { atom } from "jotai";
import { supabase } from "@/common/utils/supabase-client";
import type { User } from "@/common/types/user";
import { syncProfile } from "@/services/auth";

type AuthUser = User | null;
type AuthError = string | null;
type AuthStatus = "idle" | "loading-login" | "loading-logout" | "error";

export const authUser = atom<AuthUser>(null);
export const authError = atom<AuthError>(null);
export const authStatus = atom<AuthStatus>("idle");

authUser.onMount = (set) => {
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
   
    if (!session?.user) {
      set(null);
      return;
    }

    const profile = await syncProfile(session.user);
    set(profile);
  });

  return () => data.subscription.unsubscribe();
};
