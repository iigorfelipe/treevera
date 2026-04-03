import { useCallback, useEffect } from "react";
import type { Provider } from "@supabase/supabase-js";
import i18next from "i18next";
import { useAtomValue, useSetAtom } from "jotai";

import type { DbUser } from "@/common/types/user";
import { createUser } from "@/common/utils/supabase/create-user";
import { supabase } from "@/common/utils/supabase/client";
import {
  getCurrentSession,
  loginWithOAuth,
  logout as logoutService,
} from "@/services/auth/profile";
import { authStore } from "@/store/auth/atoms";

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
                console.error("Error while creating database user:", createError);
                return null;
              }
            }
          }

          console.error("Error while fetching userDb:", error);
          return null;
        }

        return data as DbUser;
      } catch (error) {
        console.error("Error while fetching userDb:", error);
        return null;
      }
    },
    [],
  );

  const initializeSession = useCallback(async () => {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn("Session initialization timed out");
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
            console.warn("UserDb not found");
            setUserDb(null);
          }
        } else {
          setSession(null);
          setUserDb(null);
        }

        return currentSession;
      } catch (error) {
        console.error("Error while initializing auth:", error);
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
        }

        throw new Error(i18next.t("auth.errors.userDataLoadFailed"));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : i18next.t("auth.errors.loginUnknown");

        setAuthError({ message: errorMessage });
        setLoginStatus("error");
        console.error("Login error:", error);

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
          : i18next.t("auth.errors.logoutUnknown");

      setAuthError({ message: errorMessage });
      setLogoutStatus("error");
      console.error("Logout error:", error);

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
      void initializeSession();
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
