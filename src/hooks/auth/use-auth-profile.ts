import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/common/utils/supabase/client";

import {
  sessionAtom,
  userDbAtom,
  loginStatusAtom,
  logoutStatusAtom,
  authInitializedAtom,
  authErrorAtom,
} from "@/store/auth/atoms";

import { useGetUserDb } from "../queries/user-db/useGetUser";
import { openOAuthWindow, waitOAuthResult } from "@/services/auth/popup";
import { fetchUser } from "@/common/utils/supabase/fetch-user";
import { createUser } from "@/common/utils/supabase/create-user";
import type { User } from "@supabase/supabase-js";

const redirectTo = `${window.location.origin}/treevera/popup-callback`;

const ensureUserInDb = async (user: User | undefined | null) => {
  if (!user?.id) return null;
  try {
    const existing = await fetchUser(user.id);

    if (!existing) {
      const created = await createUser(user);
      if (!created) throw new Error("createUser retornou null");

      return created;
    }
    return existing;
  } catch (err) {
    console.error("[auth] erro ao garantir user no DB:", err);
    throw err;
  }
};

export const useAuth = () => {
  const setSession = useSetAtom(sessionAtom);
  const setUserDb = useSetAtom(userDbAtom);
  const setLoginStatus = useSetAtom(loginStatusAtom);
  const setLogoutStatus = useSetAtom(logoutStatusAtom);
  const setAuthError = useSetAtom(authErrorAtom);
  const [authInitialized, setAuthInitialized] = useAtom(authInitializedAtom);

  const queryClient = useQueryClient();

  const { data: userData, refetch: refetchUser } = useGetUserDb();

  useEffect(() => {
    setUserDb(userData ?? null);
  }, [userData, setUserDb]);

  // #region Listeners
  useEffect(() => {
    let unsub: (() => void) | null = null;

    const init = async () => {
      setAuthInitialized(false);
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session ?? null);

        if (data.session?.user?.id) {
          await refetchUser();
        }

        const { data: listener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (event === "SIGNED_OUT") {
              setSession(null);
              setUserDb(null);
              queryClient.clear();
              return;
            }

            if (newSession?.user?.id) {
              setSession(newSession);
              try {
                await ensureUserInDb(newSession.user);
              } catch (err) {
                console.error(
                  "[auth] erro criando user no onAuthStateChange:",
                  err,
                );
                setAuthError({
                  message: err instanceof Error ? err.message : String(err),
                });
              }
              await refetchUser();
            } else {
              setSession(null);
            }
          },
        );

        unsub = () => listener.subscription.unsubscribe();
      } catch (err: unknown) {
        console.error("27: Erro inicializando auth:", err);
        console.error("Erro inicializando auth:", err);
        setAuthError({
          message: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setAuthInitialized(true);
      }
    };

    init();

    return () => {
      unsub?.();
    };
  }, [
    setSession,
    setUserDb,
    refetchUser,
    queryClient,
    setAuthError,
    setAuthInitialized,
  ]);

  // #region Login
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setLoginStatus("loading");
      setAuthError(null);

      const { data } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { skipBrowserRedirect: true, redirectTo },
      });

      if (!data.url) throw new Error("OAuth sem URL");

      const popup = openOAuthWindow(data.url);
      if (!popup) throw new Error("Popup bloqueado");

      const result = await waitOAuthResult(popup, {
        expectedOrigin: window.location.origin,
      });
      if (!result.ok) throw new Error(result.reason);

      const sessionData = await supabase.auth.getSession();
      setSession(sessionData.data.session ?? null);

      if (sessionData.data.session?.user?.id) await refetchUser();

      setLoginStatus("success");

      return true;
    } catch (err: unknown) {
      setLoginStatus("error");
      setAuthError({
        message: err instanceof Error ? err.message : String(err),
      });

      return false;
    }
  };

  // #region Logout
  const logout = async (): Promise<boolean> => {
    try {
      setLogoutStatus("loading");
      setAuthError(null);
      setUserDb(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      queryClient.clear();
      setLogoutStatus("success");

      return true;
    } catch (err: unknown) {
      setLogoutStatus("error");
      setAuthError({
        message: err instanceof Error ? err.message : String(err),
      });

      return false;
    }
  };

  return {
    login: loginWithGoogle,
    logout,
    initialized: authInitialized,
    refetchUser,
  };
};
