import { useEffect } from "react";
import { supabase } from "@/common/utils/supabase/client";
import { fetchUser } from "@/common/utils/supabase/fetch-user";
import { createUser } from "@/common/utils/supabase/create-user";

export const PopupCallback = () => {
  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!user) throw new Error("Nenhum usuário autenticado");

        let dbUser = await fetchUser(user.id);
        if (!dbUser) {
          dbUser = await createUser(user);
        }

        if (window.opener && window.opener !== window) {
          window.opener.postMessage(
            { type: "OAUTH_COMPLETE", session: data.session },
            window.location.origin,
          );
        }

        try {
          const bc = new BroadcastChannel("supabase-auth");
          bc.postMessage("oauth_complete");
          bc.close();
        } catch {
          //
        }

        window.close();
      } catch (err) {
        console.error("[popup-callback] erro no login:", err);
      }
    };

    run();
  }, []);

  return <p>Finalizando login…</p>;
};
