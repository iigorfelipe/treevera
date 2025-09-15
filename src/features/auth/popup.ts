const CHANNEL_NAME = "supabase-auth";
const POPUP_FEATURES =
  "width=500,height=600,menubar=no,toolbar=no,location=no,status=no";

export type OAuthResult =
  | { ok: true }
  | {
      ok: false;
      reason: "popup_blocked" | "popup_closed" | "timeout" | "message_error";
    };

export function openOAuthWindow(url: string): Window | null {
  try {
    const w = window.open(url, "oauth_popup", POPUP_FEATURES);
    return w ?? null;
  } catch {
    return null;
  }
}

export function waitOAuthResult(
  popup: Window,
  {
    timeoutMs = 60_000,
    expectedOrigin = window.location.origin,
  }: { timeoutMs?: number; expectedOrigin?: string } = {},
): Promise<OAuthResult> {
  return new Promise((resolve) => {
    let settled = false;

    const settle = (res: OAuthResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(res);
    };

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (ev) => {
        if (ev?.data === "oauth_complete") {
          settle({ ok: true });
        }
      };
    } catch {
      //
    }

    const onMessage = (ev: MessageEvent) => {
      try {
        if (typeof ev.data !== "object" || !ev.data) return;
        if (ev.origin !== expectedOrigin) return;
        if (ev.data.type === "OAUTH_COMPLETE") {
          settle({ ok: true });
        }
      } catch {
        settle({ ok: false, reason: "message_error" });
      }
    };
    window.addEventListener("message", onMessage);

    const interval = window.setInterval(() => {
      if (popup.closed) {
        settle({ ok: false, reason: "popup_closed" });
      }
    }, 400);

    const timer = window.setTimeout(() => {
      settle({ ok: false, reason: "timeout" });
    }, timeoutMs);

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
      if (bc) {
        try {
          bc.close();
        } catch {
          //
        }
      }
      try {
        popup.close();
      } catch {
        //
      }
    };
  });
}
