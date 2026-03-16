import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
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
