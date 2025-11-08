import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Prebundle lucide-react so icons are bundled into a single dep.
  // This avoids dev-time requests like /lucide-react/dist/esm/icons/fingerprint.js
  // that some ad blockers may block, breaking the app load.
  optimizeDeps: {
    include: ['lucide-react'],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for large dependencies
          if (id.includes('node_modules')) {
            // Radix UI components in separate chunk
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // Mantine components in separate chunk
            if (id.includes('@mantine')) {
              return 'vendor-mantine';
            }
            // Supabase in separate chunk
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Lucide icons in separate chunk
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // React and React-DOM together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // All other dependencies
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit to 600kb (from default 500kb)
    chunkSizeWarningLimit: 600,
  },
});
