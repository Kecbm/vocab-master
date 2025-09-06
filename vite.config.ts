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
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        toplevel: true, // Obfuscate top-level variable names
        safari10: true, // Fix Safari 10 issues
      },
      format: {
        comments: false, // Remove comments
      },
      safari10: true, // Ensure Safari 10 compatibility
    } : undefined,
    rollupOptions: {
      output: {
        // Obfuscate chunk names in production
        chunkFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        entryFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        assetFileNames: mode === 'production' ? 'assets/[hash].[ext]' : 'assets/[name]-[hash].[ext]',
        // Optimize chunk splitting for better caching
        manualChunks: mode === 'production' ? {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-tooltip'],
        } : undefined,
      },
    },
    // Additional build optimizations
    target: 'es2015', // Support older browsers while maintaining security
    sourcemap: mode !== 'production', // Source maps only in development
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
  },
}));
