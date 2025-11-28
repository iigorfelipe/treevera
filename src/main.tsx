import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "@/common/i18n";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { indexedDbPersister, queryClient } from "@/services/queryClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: indexedDbPersister }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
);
