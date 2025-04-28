import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  // 確保 CSS 預處理器正常工作
  css: {
    postcss: './postcss.config.js',
  },
}); 