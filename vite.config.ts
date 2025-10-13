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
});
