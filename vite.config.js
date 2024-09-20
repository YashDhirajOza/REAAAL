import { defineConfig } from 'vite';

export default defineConfig({
  root: "src/",
  publicDir: "../static/",
  base: process.env.VITE_BASE_PATH || "/REAAAL/",
  server: {
    host: true,
    open: false,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
    assetsDir: "assets",
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
