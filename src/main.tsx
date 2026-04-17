import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";
import { i18nReady } from "@/common/i18n";
import "./index.css";
import { ThemeProvider } from "./context/theme";
import { Toaster } from "sonner";
import { AppQueryProvider } from "@/services/query-provider";

async function bootstrap() {
  await i18nReady;

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppQueryProvider>
        <ThemeProvider>
          <App />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </AppQueryProvider>
    </StrictMode>,
  );
}

void bootstrap();
