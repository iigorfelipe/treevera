import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "@/common/i18n";
import "./index.css";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { indexedDbPersister, queryClient } from "@/services/queryClient";
import { ThemeProvider } from "./context/theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: indexedDbPersister }}
    >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
);
