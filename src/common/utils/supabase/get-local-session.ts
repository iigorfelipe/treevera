import type { Session } from "@supabase/supabase-js";

interface StoredSupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: Session["user"];
}

export const getLocalStorageSession = (): Session | null => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.includes("supabase") || key.includes("sb-")) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const parsed: StoredSupabaseSession = JSON.parse(raw);

        if (parsed?.user?.id) {
          console.log(
            "[getLocalStorageSession] sessão encontrada no localStorage",
            {
              key,
              userId: parsed.user.id,
            },
          );

          return {
            ...parsed,
            user: parsed.user,
          } as Session;
        }
      }
    }
    console.log(
      "[getLocalStorageSession] nenhuma sessão encontrada no localStorage",
    );
    return null;
  } catch (err) {
    console.error("[getLocalStorageSession] erro lendo localStorage", err);
    return null;
  }
};
