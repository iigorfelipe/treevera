import { useEffect } from "react";
import { supabase } from "@/common/utils/supabase/client";

export const PopupCallback = () => {
  useEffect(() => {
    const run = async () => {
      try {
        await supabase.auth.getSession();
      } catch {
        //
      }

      try {
        const bc = new BroadcastChannel("supabase-auth");
        bc.postMessage("oauth_complete");
        bc.close();
      } catch {
        //
      }

      try {
        if (window.opener && window.opener !== window) {
          window.opener.postMessage(
            { type: "OAUTH_COMPLETE" },
            window.location.origin,
          );
        }
      } catch {
        //
      }

      setTimeout(() => {
        try {
          window.close();
        } catch {
          //
        }
      }, 50);
    };

    run();
  }, []);

  return null;
};
