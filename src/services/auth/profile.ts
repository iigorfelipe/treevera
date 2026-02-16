import { supabase } from "@/common/utils/supabase/client";
import type { Provider } from "@supabase/supabase-js";

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
      console.warn("⏰ Timeout aguardando OAuth (90s)");
      resolve({
        success: false,
        error: "Tempo limite de autenticação excedido",
      });
    }, MAX_WAIT_TIME);

    try {
      bc = new BroadcastChannel("supabase-auth");

      bc.onmessage = (event) => {
        if (event.data === "oauth_complete") {
          console.log("✅ Recebida confirmação do popup");
          clearTimeout(timeout);
          if (bc) bc.close();
          resolve({ success: true });
        }
      };
    } catch (error) {
      clearTimeout(timeout);
      console.warn(
        "⚠️ BroadcastChannel não disponível, usando timeout fixo",
        error,
      );

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
    console.log("🔐 Iniciando login OAuth...");

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
    if (!data?.url) throw new Error("URL de autenticação não foi gerada");

    console.log("🌐 Abrindo popup OAuth...");

    const popup = openOAuthPopup(data.url);
    if (!popup) {
      throw new Error(
        "Não foi possível abrir a janela. Verifique o bloqueador de pop-ups.",
      );
    }

    console.log("⏳ Aguardando conclusão do OAuth...");

    const result = await waitForOAuthComplete();

    if (!result.success) {
      throw new Error(result.error || "Falha na autenticação");
    }

    console.log("✅ OAuth concluído, aguardando sessão ser salva...");

    await new Promise((resolve) => setTimeout(resolve, SESSION_WAIT_TIME));

    console.log("🔍 Buscando sessão...");

    let sessionData = null;
    const maxAttempts = 10;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Tentativa ${attempt}/${maxAttempts}...`);

      const { data: session, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ Erro ao buscar sessão:", sessionError);
        if (attempt === maxAttempts) throw sessionError;
      }

      if (session.session) {
        sessionData = session;
        console.log("✅ Sessão obtida!");
        break;
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!sessionData?.session) {
      throw new Error("Sessão não foi estabelecida após autenticação");
    }

    return {
      user: sessionData.session.user,
      session: sessionData.session,
    };
  } catch (error) {
    console.error("❌ Erro no login OAuth:", error);
    throw error;
  }
}

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("❌ Erro no logout:", error);
    throw error;
  }
}

export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("❌ Erro ao obter sessão:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("❌ Erro ao obter usuário:", error);
    return null;
  }
}

export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("❌ Erro ao atualizar sessão:", error);
    return null;
  }
}
