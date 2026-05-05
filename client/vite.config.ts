import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Versión única por build: timestamp en ms. Cambia en cada `vite build`.
const BUILD_VERSION = String(Date.now());

// Plugin que emite dist/version.json al final del build. El cliente lo
// consulta para detectar deploys nuevos y forzar recarga de pestañas con
// código viejo cacheado en memoria.
const emitVersionJson = (): Plugin => ({
  name: "emit-version-json",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({
        version: BUILD_VERSION,
        builtAt: new Date().toISOString(),
      }),
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), emitVersionJson()],
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  server: {
    proxy: {
      "/api": {
        //target: "http://192.168.3.38:3000",
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
