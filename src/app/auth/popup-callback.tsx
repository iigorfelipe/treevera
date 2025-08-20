import { useEffect } from "react";
import { supabase } from "@/common/utils/supabase-client";

export const PopupCallback = () => {
  useEffect(() => {
    const channel = new BroadcastChannel("supabase-auth");

    const handleAuth = async () => {
      await supabase.auth.getSession();

      // notifica a janela principal que o login terminou
      channel.postMessage("oauth_complete");
      channel.close();
      window.close();
    };

    handleAuth();
  }, []);

  return null;
};
