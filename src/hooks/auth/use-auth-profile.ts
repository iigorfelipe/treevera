import { useEffect, useCallback } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import {
  loginWithOAuth,
  logout as logoutService,
  getCurrentSession,
} from "@/services/auth/profile";
import { supabase } from "@/common/utils/supabase/client";
import { createUser } from "@/common/utils/supabase/create-user";
import type { Provider } from "@supabase/supabase-js";
import type { DbUser } from "@/common/types/user";

const INIT_TIMEOUT = 10000;

export function useAuth() {
  const setSession = useSetAtom(authStore.session);
  const setUserDb = useSetAtom(authStore.userDb);
  const setLoginStatus = useSetAtom(authStore.loginStatus);
  const setLogoutStatus = useSetAtom(authStore.logoutStatus);
  const setAuthError = useSetAtom(authStore.error);
  const setAuthInitialized = useSetAtom(authStore.initialized);
  const setLastAuthCheck = useSetAtom(authStore.lastAuthCheck);

  const session = useAtomValue(authStore.session);
  const userDb = useAtomValue(authStore.userDb);
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const loginStatus = useAtomValue(authStore.loginStatus);
  const logoutStatus = useAtomValue(authStore.logoutStatus);
  const initialized = useAtomValue(authStore.initialized);

  const fetchUserDb = useCallback(
    async (userId: string): Promise<DbUser | null> => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            const { data: authUser } = await supabase.auth.getUser();

            if (authUser.user) {
              try {
                const createdUser = await createUser(authUser.user);

                return createdUser;
              } catch (createError) {
                console.error(
                  "❌ Erro ao criar usuário no banco:",
                  createError,
                );
                return null;
              }
            }
          }

          console.error("❌ Erro ao buscar userDb:", error);
          return null;
        }

        return data as DbUser;
      } catch (error) {
        console.error("❌ Erro ao buscar userDb:", error);
        return null;
      }
    },
    [],
  );

  const initializeSession = useCallback(async () => {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn("⏰ Timeout na inicialização");
        resolve(null);
      }, INIT_TIMEOUT);
    });

    const initPromise = (async () => {
      try {
        const currentSession = await getCurrentSession();

        if (currentSession?.user) {
          setSession(currentSession);

          const userData = await fetchUserDb(currentSession.user.id);

          if (userData) {
            setUserDb(userData);
          } else {
            console.warn("⚠️ UserDb não encontrado");
            setUserDb(null);
          }
        } else {
          setSession(null);
          setUserDb(null);
        }

        return currentSession;
      } catch (error) {
        console.error("❌ Erro ao inicializar:", error);
        setSession(null);
        setUserDb(null);
        return null;
      }
    })();

    await Promise.race([initPromise, timeoutPromise]);

    setLastAuthCheck(Date.now());
    setAuthInitialized(true);
  }, [
    setSession,
    setUserDb,
    setLastAuthCheck,
    setAuthInitialized,
    fetchUserDb,
  ]);

  const login = useCallback(
    async (provider: Provider = "google") => {
      try {
        setLoginStatus("loading");
        setAuthError(null);

        const { user: authUser, session: authSession } =
          await loginWithOAuth(provider);

        setSession(authSession);

        const userData = await fetchUserDb(authUser.id);

        if (userData) {
          setUserDb(userData);
          setLoginStatus("success");

          return { success: true, user: userData };
        } else {
          throw new Error("Não foi possível carregar os dados do usuário");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao fazer login";

        setAuthError({ message: errorMessage });
        setLoginStatus("error");
        console.error("❌ Erro no login:", error);

        return { success: false, error: errorMessage };
      } finally {
        setTimeout(() => setLoginStatus("idle"), 2000);
      }
    },
    [setLoginStatus, setAuthError, setSession, setUserDb, fetchUserDb],
  );

  const logout = useCallback(async () => {
    try {
      setLogoutStatus("loading");
      setAuthError(null);

      await logoutService();

      setSession(null);
      setUserDb(null);
      setLogoutStatus("success");

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao fazer logout";

      setAuthError({ message: errorMessage });
      setLogoutStatus("error");
      console.error("❌ Erro no logout:", error);

      return { success: false, error: errorMessage };
    } finally {
      setTimeout(() => setLogoutStatus("idle"), 2000);
    }
  }, [setLogoutStatus, setAuthError, setSession, setUserDb]);

  const refreshUserDb = useCallback(async () => {
    if (!session?.user?.id) return null;

    const userData = await fetchUserDb(session.user.id);
    if (userData) {
      setUserDb(userData);
    }
    return userData;
  }, [session, fetchUserDb, setUserDb]);

  useEffect(() => {
    if (!initialized) {
      initializeSession();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          if (currentSession?.user) {
            setSession(currentSession);
          }
          break;

        case "SIGNED_OUT":
          setSession(null);
          setUserDb(null);
          break;

        default:
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized, initializeSession, setSession, setUserDb]);

  return {
    session,
    userDb,
    isAuthenticated,
    initialized,
    loginStatus,
    logoutStatus,
    authError: useAtomValue(authStore.error),
    isLoggingIn: loginStatus === "loading",
    isLoggingOut: logoutStatus === "loading",
    isInitializing: !initialized,
    login,
    logout,
    refreshUserDb,
    refreshSession: initializeSession,
  };
}
