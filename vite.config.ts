import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: true, // Força o HMR
    watch: {
      usePolling: true, // Útil em alguns sistemas
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Security configurations for production
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true, // Remove console.log statements
        drop_debugger: true, // Remove debugger statements
      },
      mangle: {
        toplevel: true, // Obfuscate top-level variable names
      },
      format: {
        comments: false, // Remove comments
      },
    } : undefined,
    rollupOptions: {
      output: {
        // Obfuscate chunk names in production
        chunkFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        entryFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        assetFileNames: mode === 'production' ? 'assets/[hash].[ext]' : 'assets/[name]-[hash].[ext]',
      },
    },
  },
}));
