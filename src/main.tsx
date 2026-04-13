import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const params = new URLSearchParams(window.location.search);
if (params.has("code") && window.opener) {
  setTimeout(() => {
    try {
      const bc = new BroadcastChannel("supabase-auth");
      bc.postMessage("oauth_complete");
      bc.close();
    } catch {
      //
    }
    try {
      window.opener.postMessage(
        { type: "OAUTH_COMPLETE" },
        window.location.origin,
      );
    } catch {
      //
    }
    setTimeout(() => window.close(), 500);
  }, 2000);
}

import { App } from "./app";
import "@/common/i18n";
import "./index.css";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
  indexedDbPersister,
  persistDehydrateOptions,
  queryClient,
} from "@/services/queryClient";
import { ThemeProvider } from "./context/theme";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: indexedDbPersister,
        maxAge: 1000 * 60 * 60 * 24 * 3, // 3 dias
        dehydrateOptions: persistDehydrateOptions,
      }}
    >
      <ThemeProvider>
        <App />
        <Toaster position="bottom-right" richColors />
      </ThemeProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
);
