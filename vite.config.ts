import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const isGhPages = mode === "gh-pages";
  return {
    plugins: [react(), tailwindcss()],
    base: isGhPages ? "/treevera/" : "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
