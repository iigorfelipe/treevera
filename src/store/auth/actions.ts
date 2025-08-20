import { atom, type Setter } from "jotai";
import { supabase } from "@/common/utils/supabase-client";
import { authStatus, authError, authUser } from "./atoms";
import { safeSupabase } from "@/common/utils/supabase-try-catch";

// #region Login
export const loginWithGoogle = atom(null, async (_get, set) => {
  set(authStatus, "loading-login");
  set(authError, null);

  const [response, error] = await safeSupabase(
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        skipBrowserRedirect: true,
        redirectTo: `${window.location.origin}/treevera/popup-callback`,
      },
    }),
  );

  if (error) {
    set(authError, error.message);
    set(authStatus, "error");
    return null;
  }

  if (!response?.data?.url) {
    set(authStatus, "idle");
    return response;
  }

  const popup = openOAuthWindow(response.data.url);

  if (!popup) {
    set(authError, "Não foi possível abrir o popup");
    set(authStatus, "error");
    return;
  }

  listenForOAuthCompletion(popup, set);
  detectPopupClosed(popup, set);

  return response;
});

// #region Popup (Login)
const openOAuthWindow = (url: string) => {
  return window.open(url, "oauth_popup", "width=500,height=600");
};

const listenForOAuthCompletion = (popup: Window, set: Setter) => {
  const channel = new BroadcastChannel("supabase-auth");

  channel.onmessage = (ev) => {
    if (ev.data === "oauth_complete") {
      channel.close();
      popup.close();
      set(authStatus, "idle");
      window.location.href = "/treevera/";
    }
  };
};

const detectPopupClosed = (popup: Window, set: Setter) => {
  const channel = new BroadcastChannel("supabase-auth");

  const interval = setInterval(() => {
    if (popup.closed) {
      clearInterval(interval);
      channel.close();
      set(authStatus, "idle");
      set(authError, "Login cancelado pelo usuário");
    }
  }, 500);
};

// #region Logout
export const logout = atom(null, async (_get, set) => {
  set(authStatus, "loading-logout");
  set(authError, null);

  const [, error] = await safeSupabase(supabase.auth.signOut());

  if (error) {
    set(authError, error.message);
    set(authStatus, "error");
    return;
  }

  set(authUser, null);
  set(authStatus, "idle");
});
