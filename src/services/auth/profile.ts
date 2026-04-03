import i18next from "i18next";
import type { Provider } from "@supabase/supabase-js";

import { supabase } from "@/common/utils/supabase/client";

const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 700;
const MAX_WAIT_TIME = 90000;
const SESSION_WAIT_TIME = 4000;

interface PopupResult {
  success: boolean;
  error?: string;
}

function getPopupPosition() {
  const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
  const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;
  return { left, top };
}

function waitForOAuthComplete(): Promise<PopupResult> {
  return new Promise((resolve) => {
    let bc: BroadcastChannel | null = null;

    const timeout = setTimeout(() => {
      if (bc) bc.close();
      console.warn("OAuth wait timed out (90s)");
      resolve({
        success: false,
        error: i18next.t("auth.errors.timeout"),
      });
    }, MAX_WAIT_TIME);

    try {
      bc = new BroadcastChannel("supabase-auth");

      bc.onmessage = (event) => {
        if (event.data === "oauth_complete") {
          clearTimeout(timeout);
          if (bc) bc.close();
          resolve({ success: true });
        }
      };
    } catch (error) {
      clearTimeout(timeout);
      console.warn("BroadcastChannel unavailable, using fixed timeout", error);

      setTimeout(() => {
        resolve({ success: true });
      }, 5000);
    }
  });
}

function openOAuthPopup(url: string): Window | null {
  const { left, top } = getPopupPosition();

  return window.open(
    url,
    "oauth-popup",
    `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
  );
}

export async function loginWithOAuth(provider: Provider = "google") {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/treevera/auth-callback`,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error(i18next.t("auth.errors.authUrlMissing"));

    const popup = openOAuthPopup(data.url);
    if (!popup) {
      throw new Error(i18next.t("auth.errors.popupBlocked"));
    }

    const result = await waitForOAuthComplete();

    if (!result.success) {
      throw new Error(result.error || i18next.t("auth.errors.authFailed"));
    }

    await new Promise((resolve) => setTimeout(resolve, SESSION_WAIT_TIME));

    let sessionData = null;
    const maxAttempts = 10;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error while fetching session:", sessionError);
        if (attempt === maxAttempts) throw sessionError;
      }

      if (session.session) {
        sessionData = session;
        break;
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!sessionData?.session) {
      throw new Error(i18next.t("auth.errors.sessionNotEstablished"));
    }

    return {
      user: sessionData.session.user,
      session: sessionData.session,
    };
  } catch (error) {
    console.error("OAuth login error:", error);
    throw error;
  }
}

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("Error while fetching session:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("Error while fetching user:", error);
    return null;
  }
}

export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("Error while refreshing session:", error);
    return null;
  }
}
